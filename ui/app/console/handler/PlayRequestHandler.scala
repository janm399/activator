/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console.handler

import console.{ PagingInformation, ModuleInformation, RequestHandler }
import scala.concurrent.{ Future, ExecutionContext }
import akka.actor.ActorRef
import play.api.libs.json.{ JsString, JsObject, JsValue }
import console.RequestHandler._
import console.Responses.{ ErrorResponse, InvalidLicense, ValidResponse }

class PlayRequestHandler extends RequestHandler {
  import ExecutionContext.Implicits.global
  import RequestHandler._

  def handle(receiver: ActorRef, mi: ModuleInformation): Future[(ActorRef, JsValue)] = {
    val params = mi.scope.queryParams
    val playRequestPromise = call(RequestHandler.playRequestURL + mi.traceId.get, params)
    for {
      playRequests <- playRequestPromise
    } yield {
      val result = validateResponse(playRequests) match {
        case ValidResponse =>
          val data = JsObject(Seq("playRequestSummary" -> playRequests.json))
          JsObject(Seq(
            "type" -> JsString("request"),
            "data" -> data))
        case InvalidLicense(jsonLicense) => jsonLicense
        case ErrorResponse(jsonErrorCodes) => jsonErrorCodes
      }

      (receiver, result)
    }
  }
}
