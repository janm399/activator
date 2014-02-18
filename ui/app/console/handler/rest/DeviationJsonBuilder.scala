/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console.handler.rest

import akka.actor.ActorRef
import play.api.libs.json._
import com.typesafe.trace.uuid.UUID
import console.ClientController.Update

class DeviationJsonBuilder extends JsonBuilderActor {
  import DeviationJsonBuilder._

  def receive = {
    case r: DeviationResult => r.receiver ! Update(createJson(r.eventID, r.event, r.traces))
  }
}

object DeviationJsonBuilder {
  import com.typesafe.trace._

  case class DeviationResult(receiver: ActorRef, eventID: UUID, event: TraceEvent, traces: Seq[TraceEvent])

  def createJson(eventId: UUID, event: TraceEvent, traces: Seq[TraceEvent]): JsObject =
    Json.obj(
      "type" -> "deviation",
      "data" ->
        Json.obj(
          "deviation" -> "N/A"))
}
