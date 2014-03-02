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
  import console.handler.rest.MonitorJsonBuilder

  def props(repository: AnalyticsRepository,
    defaultLimit: Int,
    builderProps: Props = MonitorJsonBuilder.props()) =
    Props(classOf[MonitorHandler], repository, builderProps, defaultLimit)

}

trait MonitorHandlerBase extends RequestHandler[MonitorHandler.MonitorModuleInfo] {

}

class MonitorHandler(val repository: AnalyticsRepository,
  builderProps: Props, val defaultLimit: Int) extends MonitorHandlerBase {
  import MonitorHandler._
  val builder = context.actorOf(builderProps, "monitorBuilder")

  override def onModuleInformation(sender: ActorRef, mi: MonitorModuleInfo): Unit = {
    builder ! MonitorResult(sender, List.fill(10) { MonitorData("foo", (math.random * 100).toInt) })
  }
}
