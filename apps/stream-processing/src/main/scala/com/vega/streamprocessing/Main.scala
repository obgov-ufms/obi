package com.vega.streamprocessing

import org.apache.kafka.common.serialization.{
  Deserializer,
  Serde,
  Serdes,
  Serializer
}
import org.apache.kafka.streams.{
  KafkaStreams,
  StreamsConfig,
  Topology,
  StreamsBuilder,
  KeyValue
}
import org.apache.kafka.streams.kstream.{KStream, Consumed, Produced}
import java.util.Properties
import io.minio.MinioClient
import io.minio.GetObjectArgs
import org.apache.commons.lang3.SystemProperties
import scala.util.Try
import scala.jdk.CollectionConverters._
import org.apache.pdfbox.Loader
import scala.io.BufferedSource
import java.io.InputStream
import org.apache.pdfbox.pdmodel.PDDocument
import upickle.default.{ReadWriter, writeBinary, readBinary}
import S3Event._

object StreamProcessing:
  object Topics:
    val S3Events = "minio-events-v1"
    val PdfImageCount = "pdf-image-count"

  given StorageProvider = MinioStorageProvider(
    MinioClient
      .builder()
      .endpoint("http://minio:9000")
      .credentials(
        "Q3AM3UQ867SPQQA43P2F",
        "zuf+tfteSlswRu7BJ86wekitnifILbZam1KYY3TG"
      )
      .build()
  )

  val builder = StreamsBuilder()

  val s3EventsStream: KStream[S3EventKey, S3EventValue] =
    builder.stream(
      Topics.S3Events,
      Consumed.`with`(S3EventKey.serde, S3EventValue.serde)
    )

  val processedStream: KStream[S3EventKey, String] = s3EventsStream
    .filter: (key, value) =>
      value.EventName.startsWith("s3:ObjectCreated")
    .flatMap: (key, value) =>
      val event = S3Event(key, value)
      val imagesNum = event.extractFileImages()

      List(KeyValue(key, imagesNum.toString)).asJava

  processedStream.to(
    Topics.PdfImageCount,
    Produced.`with`(S3EventKey.serde, Serdes.String())
  )

  def main(args: Array[String]): Unit =
    val props = Properties()
    props.put(StreamsConfig.APPLICATION_ID_CONFIG, "orders-application")
    props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "kafka:19092")
    props.put(
      StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG,
      Serdes.String().getClass().getName()
    )
    props.put(
      StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG,
      Serdes.String().getClass().getName()
    )

    val topology: Topology = builder.build()
    println(topology.describe())

    val application: KafkaStreams = KafkaStreams(topology, props)
    application.start()
