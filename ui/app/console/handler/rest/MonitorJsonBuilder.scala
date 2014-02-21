package console.handler.rest

import akka.actor.ActorRef
import play.api.libs.json._
import console.ClientController.Update
import play.api.libs.json.JsObject
import console.handler.MonitorData

class MonitorJsonBuilder extends JsonBuilderActor {
  import MonitorJsonBuilder._

  def receive = {
    case r: MonitorResult => r.receiver ! Update(createJson(r.data))
  }
}

object MonitorJsonBuilder {
  case class MonitorResult(receiver: ActorRef, data: List[MonitorData])

  def createJson(data: MonitorData): JsObject = Json.obj("category" -> data.category, "value" -> data.value)

  def createJson(data: List[MonitorData]): JsObject = Json.obj("type" -> "monitordata", "data" -> data.map(createJson))
}
