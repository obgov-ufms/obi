package com.vega.streamprocessing

import org.apache.kafka.common.serialization.{Serdes, Serde}
import upickle.default.{ReadWriter, writeToByteArray, read}
import scala.util.Try

case class S3Event(key: S3EventKey, value: S3EventValue)

case class S3EventKey(bucket: String, path: String, filename: String):
  def nameAndExtension =
    val parts = filename.split("\\.")
    (parts.slice(0, parts.length - 1).mkString("."), parts.last)
  override def toString() =
    s"$bucket${if path.nonEmpty then s"/$path" else ""}/$filename"
object S3EventKey:
  def unapply(s: String): Option[S3EventKey] =
    val parts = s.split("/")
    if parts.length >= 2 then
      val bucket = parts.head
      val filename = parts.last
      val path = parts.slice(1, parts.length - 1).mkString("/")
      Some(S3EventKey(bucket, path, filename))
    else None

  val serde = CustomSerdes.fromFns[S3EventKey](
    _.toString.getBytes("UTF-8"),
    Serdes.String.deserializer.deserialize("", _) match
      case S3EventKey(bucket, path, filename) =>
        Some(S3EventKey(bucket, path, filename))
      case _ => None
  )

case class S3EventValue(
    EventName: String,
    Key: String,
    Records: List[S3EventRecord]
) derives ReadWriter

object S3EventValue:
  val serde: Serde[S3EventValue] =
    CustomSerdes.fromFns(
      writeToByteArray(_),
      v => Some(read[S3EventValue](v))
    )

case class S3EventRecord(eventTime: String, s3: RecordS3Field)
    derives ReadWriter

case class RecordS3Field(`object`: S3Object) derives ReadWriter

case class S3Object(key: String, size: Option[String] = None) derives ReadWriter
