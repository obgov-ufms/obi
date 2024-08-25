package com.vega.streamprocessing

import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.Loader
import scala.util.Try

extension (e: S3Event)
  def fetchPdf()(using
      storage: StorageProvider
  ): Either[Throwable, PDDocument] =
    val S3EventKey(_, _, filename) = e.key

    if !filename.endsWith(".pdf") then Left(Error("Not a PDF"))
    else
      e.fetchObject()
        .flatMap(d => Try { Loader.loadPDF(d.content.readAllBytes()) }.toEither)
