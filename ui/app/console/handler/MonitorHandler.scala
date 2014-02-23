package console.handler

import akka.actor.{ ActorRef, Props }
import console._
import console.handler.rest.MonitorJsonBuilder.MonitorResult

sealed trait MonitorSort
object MonitorSorts {
  case object DefineMe extends MonitorSort
}

object MonitorHandler {
  case class MonitorModuleInfo() extends ModuleInformationBase

}

trait MonitorHandlerBase extends RequestHandler[MonitorHandler.MonitorModuleInfo] {

}

class MonitorHandler(builderProps: Props, val defaultLimit: Int) extends MonitorHandlerBase {
  import MonitorHandler._
  val builder = context.actorOf(builderProps, "monitorBuilder")

  override def onModuleInformation(sender: ActorRef, mi: MonitorModuleInfo): Unit = {
    builder ! MonitorResult(sender, List.fill(10) { MonitorData("foo", (math.random * 100).toInt) })
  }
}
