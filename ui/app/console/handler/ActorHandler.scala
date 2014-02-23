/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package console
package handler

import akka.actor.{ ActorRef, Props }
import activator.analytics.data.{ TimeRange, Scope, ActorStats }
import console.handler.rest.ActorJsonBuilder.ActorResult
import console.handler.rest.ActorJsonBuilder
import console.AnalyticsRepository

object ActorHandler {
  def props(repository: AnalyticsRepository,
    builderProps: Props = ActorJsonBuilder.props()) =
    Props(classOf[ActorHandler], repository, builderProps)

  case class ActorModuleInfo(scope: Scope,
    modifiers: ScopeModifiers,
    time: TimeRange,
    dataFrom: Option[Long],
    traceId: Option[String]) extends ScopedModuleInformationBase
}

trait ActorHandlerBase extends RequestHandlerLike[ActorHandler.ActorModuleInfo] {
  import ActorHandler._
  def useActorStats(sender: ActorRef, stats: ActorStats): Unit

  def onModuleInformation(sender: ActorRef, mi: ActorModuleInfo): Unit = {
    useActorStats(sender, ActorStats.concatenate(repository.actorStatsRepository.findWithinTimePeriod(mi.time, mi.scope), mi.time, mi.scope))
  }
}

class ActorHandler(val repository: AnalyticsRepository,
  builderProps: Props) extends RequestHandler[ActorHandler.ActorModuleInfo] with ActorHandlerBase {
  val builder = context.actorOf(builderProps, "actorBuilder")

  def useActorStats(sender: ActorRef, stats: ActorStats): Unit = {
    builder ! ActorResult(sender, stats)
  }
}
