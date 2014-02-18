/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console
package handler

import akka.actor.{ ActorRef, Props }
import com.typesafe.trace.uuid.UUID
import com.typesafe.trace.TraceEvent
import console.handler.rest.DeviationJsonBuilder.DeviationResult
import scala.concurrent.{ ExecutionContext, Future }
import ExecutionContext.Implicits.global

object DeviationHandler {
  case class DeviationModuleInfo(eventId: UUID, traceId: UUID) extends ModuleInformationBase
}

trait DeviationHandlerBase extends RequestHandlerLike[DeviationHandler.DeviationModuleInfo] {
  import DeviationHandler._

  def useDeviation(sender: ActorRef, eventId: UUID, event: TraceEvent, traces: Seq[TraceEvent]): Unit

  def onModuleInformation(sender: ActorRef, mi: DeviationModuleInfo): Unit = {
    val tracesPromise = Future { repository.traceRepository.trace(mi.traceId) }
    val eventPromise = Future { repository.traceRepository.event(mi.eventId).get }
    for {
      traces <- tracesPromise
      event <- eventPromise
    } yield {
      useDeviation(sender, mi.eventId, event, traces)
    }
  }
}

class DeviationHandler(builderProps: Props) extends RequestHandler[DeviationHandler.DeviationModuleInfo] with DeviationHandlerBase {
  val builder = context.actorOf(builderProps, "deviationBuilder")

  def useDeviation(sender: ActorRef, eventId: UUID, event: TraceEvent, traces: Seq[TraceEvent]): Unit = {
    builder ! DeviationResult(sender, eventId, event, traces)
  }
}
