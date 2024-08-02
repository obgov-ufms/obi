package com.vega.streamprocessing

import java.io.InputStream
import scala.util.Try
import io.minio.{MinioClient, GetObjectArgs, StatObjectArgs}

extension (e: S3Event)
  def fetchObject()(using minioClient: MinioClient): Option[InputStream] =
    val S3EventKey(_, path, filename) = e.key

    val objectName = s"${if path.nonEmpty then s"/$path" else ""}/$filename"

    val getArgs = GetObjectArgs
      .builder()
      .bucket("vega")
      .`object`(objectName)
      .build()

    Try {
      minioClient
        .getObject(getArgs)
    }.toOption
