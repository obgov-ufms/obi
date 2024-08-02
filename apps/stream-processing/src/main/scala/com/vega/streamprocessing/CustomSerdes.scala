package com.vega.streamprocessing

import org.apache.kafka.common.serialization.{
  Serdes,
  Serializer,
  Deserializer,
  Serde
}
import upickle.default.{ReadWriter, writeBinary, readBinary}
import scala.util.Try

object CustomSerdes:
  def fromFns[A >: Null](
      serializer: (a: A) => Array[Byte],
      deserializer: (bytes: Array[Byte]) => Option[A]
  ) =
    Serdes.serdeFrom[A](
      new Serializer[A]:
        override def serialize(
            topic: String,
            data: A
        ): Array[Byte] =
          serializer(data)
      ,
      new Deserializer[A]:
        override def deserialize(
            topic: String,
            data: Array[Byte]
        ): A =
          deserializer(data).orNull
    )

given serde[A >: Null: ReadWriter]: Serde[A] =
  val serializer = (a: A) => writeBinary(a)
  val deserializer = (bytes: Array[Byte]) =>
    Try { readBinary[A](bytes) }.toOption

  val ser = new Serializer[A] {
    override def serialize(topic: String, data: A): Array[Byte] = serializer(
      data
    )
  }

  val des = new Deserializer[A]:
    override def deserialize(topic: String, data: Array[Byte]): A =
      deserializer(data).orNull

  Serdes.serdeFrom(ser, des)
