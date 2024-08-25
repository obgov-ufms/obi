package com.vega.streamprocessing

import java.io.InputStream
import scala.util.Try
import io.minio.{MinioClient, GetObjectArgs, StatObjectArgs}
import io.minio.PutObjectArgs

extension (e: S3Event)
  def fetchObject()(using storage: StorageProvider): Either[Throwable, Object] =
    storage.getObject(e)

case class Object(
    bucket: String,
    name: String,
    contentType: String,
    size: Long,
    content: InputStream
)

trait StorageProvider:
  def getObject(event: S3Event): Either[Throwable, Object]
  def putObject(obj: Object): Either[Throwable, Unit]

class MinioStorageProvider(client: MinioClient) extends StorageProvider:
  def getObject(event: S3Event): Either[Throwable, Object] =
    val objectName = event.key.objectName
    val bucket = event.key.bucket

    val objectStat = Try {
      client.statObject(
        StatObjectArgs.builder.bucket(bucket).`object`(objectName).build
      )
    }.toEither

    objectStat.flatMap(stat =>
      Try {
        val objectData = client
          .getObject(
            GetObjectArgs.builder
              .bucket(bucket)
              .`object`(objectName)
              .build
          )

        Object(
          bucket,
          objectName,
          stat.contentType,
          stat.size(),
          objectData
        )
      }.toEither
    )
  def putObject(obj: Object): Either[Throwable, Unit] =
    Try {
      client.putObject(
        PutObjectArgs.builder
          .contentType(obj.contentType)
          .stream(obj.content, obj.size, -1)
          .build
      )

      ()
    }.toEither
