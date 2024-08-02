package com.vega.streamprocessing

import io.minio.MinioClient
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.Loader
import scala.util.Try

extension (e: S3Event)
  def fetchPdf()(using minioClient: MinioClient): Option[PDDocument] =
    val S3EventKey(_, _, filename) = e.key

    if !filename.endsWith(".pdf") then None
    else
      e.fetchObject() match
        case None => None
        case Some(value) =>
          Try { Loader.loadPDF(value.readAllBytes()) }.toOption
