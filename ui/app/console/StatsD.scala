package console

import akka.io.{ IO, Udp }
import akka.actor._
import java.net.InetSocketAddress
import activator.analytics.data.{ ActorStatsMetrics, Scope, TimeRange, ActorStats }

object StatsD {

  def start(context: ActorContext, target: ActorRef) = {
    val handler = context.actorOf(Props(new StatsDHandler(target)))
    IO(Udp)(context.system) ! Udp.Bind(handler, new InetSocketAddress("0.0.0.0", 12345))
  }

}

trait StatsDUnmarshaller {

  def unmarshal(data: Array[Byte]): ActorStats = {
    val timeRange = TimeRange()
    val scope = Scope(true, None, None, None, None, None, None, None)
    val asm = ActorStatsMetrics()
    ActorStats(timeRange, scope, asm)
  }

}

class StatsDHandler(target: ActorRef) extends Actor with StatsDUnmarshaller {

  def receive: Receive = {
    case Udp.Received(data, _) => target ! unmarshal(data.toArray)
  }
}
