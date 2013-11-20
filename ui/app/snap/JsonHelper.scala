/**
 * Copyright (C) 2013 Typesafe <http://typesafe.com/>
 */
package snap

import play.api.libs.json._
import scala.util.parsing.json.JSONType
import scala.util.parsing.json.JSONObject
import scala.util.parsing.json.JSONArray

/** Helper methods to convert between JSON libraries. */
object JsonHelper {

  def playJsonToRawMap(playJson: JsValue): Map[String, Any] =
    playJson match {
      case o: JsObject =>
        for {
          (key, value) <- o.fieldSet.toMap
        } yield key -> playJsonToRaw(value)
      case _ => throw new RuntimeException("Trying to put non-js-object into a Map[String,Any]")
    }

  def playJsonToRaw(playJson: JsValue): Any =
    playJson match {
      case JsBoolean(b) => b
      case JsNumber(n) => n
      case JsString(s) => s
      case JsNull => null
      case o: JsObject =>
        for {
          (key, value) <- o.fieldSet.toMap
        } yield key -> playJsonToRaw(value)
      case a: JsArray => a.value.map(playJsonToRaw)
      case u: JsUndefined => throw new RuntimeException("undefined found in json")
    }

  def rawToPlayJson(value: Any): JsValue =
    value match {
      // always check null first since it's an instance of everything
      case null => JsNull
      case o: Map[String, Any] => JsObject(for {
        (key, value) <- o.toSeq
      } yield key -> rawToPlayJson(value))
      case a: Seq[_] => JsArray(a.map(rawToPlayJson))
      case b: Boolean => JsBoolean(b)
      case n: Double => JsNumber(BigDecimal(n))
      case n: Long => JsNumber(BigDecimal(n))
      case n: Int => JsNumber(BigDecimal(n))
      case s: String => JsString(s)
      case u => throw new RuntimeException("Unknown thing to map into json: " + u)
    }

  def playJsonToScalaJson(playJson: JsValue): JSONType = {
    def playJsonToScalaJsonValue(playJson: JsValue): Any = {
      playJson match {
        case JsBoolean(b) => b
        case JsNumber(n) => n
        case JsString(s) => s
        case JsNull => null
        case o: JsObject => playJsonToScalaJson(o)
        case a: JsArray => playJsonToScalaJson(a)
        case u: JsUndefined => throw new RuntimeException("undefined found in json")
      }
    }

    playJson match {
      case JsObject(list) =>
        JSONObject((list map { kv =>
          kv._1 -> playJsonToScalaJsonValue(kv._2)
        }).toMap)
      case JsArray(list) =>
        JSONArray(list.map(playJsonToScalaJsonValue).toList)
      case other =>
        throw new RuntimeException("only JSON 'containers' allowed here, not " + other.getClass)
    }
  }

  def scalaJsonToPlayJson(scalaJson: JSONType): JsValue = {
    def scalaJsonToPlayJsonValue(scalaJson: Any): JsValue = {
      scalaJson match {
        // always check null first since it's an instance of everything
        case null => JsNull
        case o: JSONObject => scalaJsonToPlayJson(o)
        case a: JSONArray => scalaJsonToPlayJson(a)
        case b: Boolean => JsBoolean(b)
        case n: Double => JsNumber(BigDecimal(n))
        case n: Long => JsNumber(BigDecimal(n))
        case n: Int => JsNumber(BigDecimal(n))
        case s: String => JsString(s)
      }
    }

    scalaJson match {
      case JSONObject(m) =>
        JsObject(m.iterator.map(kv => (kv._1 -> scalaJsonToPlayJsonValue(kv._2))).toSeq)
      case JSONArray(list) =>
        JsArray(list.map(scalaJsonToPlayJsonValue))
      case other =>
        throw new RuntimeException("only JSON 'containers' allowed here, not " + other.getClass)
    }
  }
}
