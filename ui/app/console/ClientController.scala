/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console

import akka.actor._
import akka.pattern._
import akka.util.Timeout
import play.api.libs.iteratee.{ Enumerator, Iteratee }
import play.api.libs.json.JsValue
import scala.concurrent.duration._
import scala.concurrent.{ Future, ExecutionContext }
import controllers.ConsoleController
import play.api.Play.current
import console.handler._
import console.handler.rest._

class ClientController extends Actor with ActorLogging {
  import ClientController._
  import ExecutionContext.Implicits.global

  context.system.scheduler.schedule(
    ConsoleController.config.getLong("console.update-frequency").milliseconds,
    ConsoleController.config.getLong("console.update-frequency").milliseconds,
    self,
    Tick)

  val defaultLimit = ConsoleController.defaultPageLimit

  def receive = {
    case CreateClient(id) =>
      if (context.child(id).isEmpty)
        context.actorOf(Props(new ClientHandler(
          jsonHandlerProps = Props[JsonHandler],
          overviewHandlerProps = Props(new OverviewHandler(Props[OverviewJsonBuilder], defaultLimit)),
          actorsHandlerProps = Props(new ActorsHandler(Props[ActorsJsonBuilder], defaultLimit)),
          actorHandlerProps = Props(new ActorHandler(Props[ActorJsonBuilder])),
          playRequestsHandlerProps = Props(new PlayRequestsHandler(Props[PlayRequestsJsonBuilder], defaultLimit)),
          playRequestHandlerProps = Props(new PlayRequestHandler(Props[PlayRequestJsonBuilder])),
          deviationsHandlerProps = Props(new DeviationsHandler(Props[DeviationsJsonBuilder], defaultLimit)),
          deviationHandlerProps = Props(new DeviationHandler(Props[DeviationJsonBuilder])),
          lifecycleHandlerProps = Props[LifecycleHandler],
          monitorHandlerProps = Props(new MonitorHandler(Props[MonitorJsonBuilder], defaultLimit)))), id) forward InitializeCommunication
    case Tick => context.children foreach { _ ! Tick }
  }
}

object ClientController {
  case class CreateClient(id: String)
  case class Connection(ref: ActorRef, enum: Enumerator[JsValue])
  case class HandleRequest(payload: JsValue)
  case class Update(js: JsValue)
  case object InitializeCommunication
  case object Tick

  def join(id: String): Future[(Iteratee[JsValue, _], Enumerator[JsValue])] = {
    import play.api.libs.concurrent.Execution.Implicits._
    implicit val timeout = Timeout(1.second)
    (ConsoleController.clientHandlerActor ? CreateClient(id)).map {
      case Connection(ref, enumerator) => (Iteratee.foreach[JsValue] { ref ! HandleRequest(_) }.map(_ => ref ! PoisonPill), enumerator)
    }
  }
}
