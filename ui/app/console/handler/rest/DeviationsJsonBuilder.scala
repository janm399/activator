/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console.handler.rest

import akka.actor.ActorRef
import console.ClientController.Update
import play.api.libs.json.{ JsValue, JsArray, Json, JsObject }

class DeviationsJsonBuilder extends JsonBuilderActor {
  import DeviationsJsonBuilder._

  def receive = {
    case r: DeviationsResult => r.receiver ! Update(createJson(r.result))
  }
}

object DeviationsJsonBuilder {
  import activator.analytics.data._

  case class DeviationsResult(receiver: ActorRef, result: Either[Seq[ErrorStats], Seq[ActorStats]])

  def createJson(result: Either[Seq[ErrorStats], Seq[ActorStats]]): JsObject =
    Json.obj(
      "type" -> "deviations",
      "data" ->
        Json.obj(
          "deviations" -> handleTypes(result)))

  private def handleTypes(result: Either[Seq[ErrorStats], Seq[ActorStats]]): JsValue = result match {
    case Left(x) => generateErrorStats(x)
    case Right(x) => generateActorStats(x)
  }

  private def generateErrorStats(stats: Seq[ErrorStats]): JsValue =
    Json.toJson(stats.map(i =>
      Json.obj(
        "errorCount" -> i.metrics.counts.errors,
        "errors" -> extract(i.metrics.deviations.errors),
        "warningCount" -> i.metrics.counts.warnings,
        "warnings" -> extract(i.metrics.deviations.warnings),
        "deadletterCount" -> i.metrics.counts.deadLetters,
        "deadletters" -> extract(i.metrics.deviations.deadLetters),
        "unhandledMessageCount" -> i.metrics.counts.unhandledMessages,
        "unhandledMessages" -> extract(i.metrics.deviations.unhandledMessages),
        "deadlockCount" -> i.metrics.counts.deadlocks,
        "deadlocks" -> extract(i.metrics.deviations.deadlockedThreads))))

  private def extract(details: List[DeviationDetail]): List[JsObject] = {
    details.map(d =>
      Json.obj(
        "event" -> d.eventId.toString,
        "trace" -> d.traceId.toString,
        "message" -> d.message,
        "timestamp" -> d.timestamp))
  }

  private def generateActorStats(stats: Seq[ActorStats]): JsValue = {
    Json.toJson(stats.map(i =>
      Json.obj(
        "errorCount" -> i.metrics.counts.errorCount,
        "errors" -> extract(i.metrics.deviationDetails.errors),
        "warningCount" -> i.metrics.counts.warningCount,
        "warnings" -> extract(i.metrics.deviationDetails.warnings),
        "deadletterCount" -> i.metrics.counts.deadLetterCount,
        "deadletters" -> extract(i.metrics.deviationDetails.deadLetters),
        "unhandledMessageCount" -> i.metrics.counts.unhandledMessageCount,
        "unhandledMessages" -> extract(i.metrics.deviationDetails.unhandledMessages),
        "deadlockCount" -> i.metrics.deviationDetails.deadlockedThreads.size,
        "deadlocks" -> extract(i.metrics.deviationDetails.deadlockedThreads))))
  }
}
