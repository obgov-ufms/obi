package com.vega.streamprocessing

import io.minio.MinioClient
import org.apache.pdfbox.contentstream.PDFStreamEngine
import org.apache.pdfbox.contentstream.operator.state.{
  Concatenate,
  SetGraphicsStateParameters,
  Save,
  Restore,
  SetMatrix
}
import org.apache.pdfbox.contentstream.operator.DrawObject
import org.apache.pdfbox.cos.COSBase
import java.{util => ju}
import org.apache.pdfbox.contentstream.operator.OperatorName
import org.apache.pdfbox.cos.COSName
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject
import java.io.InputStream
import io.minio.PutObjectArgs
import java.time.LocalDateTime
import org.apache.pdfbox.contentstream.operator.Operator
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream
import scala.util.Try

import org.apache.pdfbox.tools.PDFText2Markdown

extension (e: S3Event)
  def extractText()(using storage: StorageProvider): Either[Throwable, String] =
    val (filename, _) = e.key.nameAndExtension
    val bucket = e.key.bucket

    e
      .fetchPdf()
      .flatMap(doc =>
        Try {
          val data = PDFText2Markdown().getText(doc)
          val is = ByteArrayInputStream(data.getBytes())

          storage.putObject(
            Object(
              bucket,
              s"$filename/text/content.md",
              "text/markdown",
              is.available,
              is
            )
          )

          data
        }.toEither
      )
