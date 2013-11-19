/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console

import akka.actor.{ ActorRef, ActorLogging, Actor }
import console.parser.TimeQuery
import java.net.URI
import play.api.libs.json._
import play.api.libs.json.JsObject
import play.api.libs.ws.Response
import play.api.libs.ws.WS
import scala.concurrent.duration._
import scala.concurrent.{ Future, ExecutionContext }
import play.api.Play.current
import controllers.ConsoleController

trait RequestHandler extends Actor with ActorLogging {
  import Responses._
  import ExecutionContext.Implicits.global
  import snap.EnhancedURI._
  import ClientController.Update

  def handle(receiver: ActorRef, moduleInformation: ModuleInformation): Future[(ActorRef, JsValue)]

  def receive = {
    case mi: ModuleInformation => for { r <- handle(sender, mi) } r._1 ! Update(r._2)
  }

  def call(path: String, params: Map[String, String]): Future[Response] = {
    val uri = new URI("").copy(
      scheme = RequestHandler.scheme,
      host = ConsoleController.config.getString("console.host"),
      port = ConsoleController.config.getInt("console.port"),
      path = path).addQueryParameters(
        (RequestHandler.timestampFormatting ++ params).foldLeft(
          Map.empty[String, Seq[String]])((r, c) => r ++ Map(c._1 -> Seq(c._2))))

    WS.url(uri.toASCIIString).get()
  }

  def validateResponse(responses: Response*): ResponseStatus = {
    val invalidStatus = responses.filterNot { _.status == 200 }
    if (invalidStatus.isEmpty)
      ValidResponse
    else {
      val responseCodes = invalidStatus.map(_.status)
      ErrorResponse(JsObject(Seq("errorCodes" -> JsString(responseCodes mkString " : "))))
    }
  }

  def chunksFilter(time: TimeQuery): String = {
    val minChunks = math.min(time.duration.toMinutes, 10)
    val maxChunks = math.min(time.duration.toMinutes, 20)
    "&minChunks=%s&maxChunks=%s".format(minChunks, maxChunks)
  }

  def latencyBarsJson(spanSummaryBars: play.api.libs.ws.Response): JsObject = {
    val latencyMinutes = spanSummaryBars.json match {
      case a @ JsArray(_) => minutesFromArray(a)
      case other => JsNumber(0)
    }

    JsObject(Seq("spanSummaryBars" ->
      JsObject(Seq(
        "minutes" -> latencyMinutes,
        "bars" -> spanSummaryBars.json))))
  }

  def minutes(json: JsValue): JsNumber = JsNumber((endTime(json) + 1 - startTime(json)).millis.toMinutes)

  def timeInMailboxBarsJson(actorStatsBars: play.api.libs.ws.Response): JsObject = {
    val timeInMailboxMinutes = actorStatsBars.json match {
      case a @ JsArray(_) => minutesFromArray(a)
      case other => JsNumber(0)
    }

    JsObject(Seq("actorStatsBars" ->
      JsObject(Seq(
        "minutes" -> timeInMailboxMinutes,
        "bars" -> actorStatsBars.json))))
  }

  private def startTime(json: JsValue): Long = {
    (json \ "timeRange" \ "startTime").asOpt[Long].getOrElse(
      throw new IllegalStateException("Missing startTime in result: " + json))
  }

  private def endTime(json: JsValue): Long = {
    (json \ "timeRange" \ "endTime").asOpt[Long].getOrElse(
      throw new IllegalStateException("Missing endTime in result: " + json))
  }

  private def minutesFromArray(json: JsArray): JsNumber = {
    if (json.value.isEmpty) JsNumber(0)
    else JsNumber((endTime(json.value.last) + 1 - startTime(json.value.head)).millis.toMinutes)
  }
}

object RequestHandler {
  final val scheme = "http"
  final val timestampFormatting = Map("formatTimestamps" -> "off")

  def url(path: String) = ConsoleController.config.getString("console.start-url") + path

  val metadataURL = url("metadata")
  val actorsURL = url("actors")
  val playRequestsURL = url("playrequestsummary/multi")
  val playRequestURL = url("playrequestsummary/event/")

  def mapify[A](name: String, value: Option[A]): Map[String, String] =
    (for { v <- value } yield Map(name -> v.toString)) getOrElse Map.empty[String, String]

  def mapifyF[A, B](name: String, value: Option[A], f: A => B): Map[String, String] =
    (for { v <- value } yield Map(name -> f(v).toString)) getOrElse Map.empty[String, String]
}

object Responses {
  sealed trait ResponseStatus
  object ValidResponse extends ResponseStatus
  case class ErrorResponse(jsonErrorCodes: JsObject) extends ResponseStatus
  case class InvalidLicense(jsonLicense: JsObject) extends ResponseStatus
}
