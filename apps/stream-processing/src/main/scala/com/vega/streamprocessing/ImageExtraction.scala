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
import java.io.ByteArrayOutputStream
import java.io.ByteArrayInputStream
import scala.collection.parallel.CollectionConverters._
import scala.util.Try
import scala.concurrent.{Future, Await, ExecutionContext}
import scala.concurrent.duration.Duration

import ExecutionContext.Implicits.global

extension (e: S3Event)
  def extractFileImages()(using storage: StorageProvider): Int =
    val (filename, _) = e.key.nameAndExtension
    val bucket = e.key.bucket

    val document = e.fetchPdf()

    document match
      case Left(value) => 0
      case Right(value) =>
        val engine = ImageGetterEngine()
        value.getPages().forEach(engine.processPage(_))

        val results = engine.images.map(i =>
          val ImageWithName(name, image) = i
          val imageObjectName = s"$filename/images/$name.${image.getSuffix}"

          Try {
            val stream = image.imageInputStream()

            storage.putObject(
              Object(
                bucket,
                imageObjectName,
                s"image/${image.getSuffix}",
                stream.available,
                stream
              )
            )
          }.toEither
        )

        results.count(_.isRight)

  def parExtractFileImages()(using storage: StorageProvider): Int =
    val (filename, _) = e.key.nameAndExtension
    val bucket = e.key.bucket

    val document = e.fetchPdf()

    document match
      case Left(value) => 0
      case Right(value) =>
        val engine = ImageGetterEngine()
        value.getPages().forEach(engine.processPage(_))

        val imageFutures = engine.images.map(i =>
          val ImageWithName(name, image) = i
          val imageObjectName = s"$filename/images/$name.${image.getSuffix}"

          Future {
            Try {
              val stream = image.imageInputStream()

              storage.putObject(
                Object(
                  bucket,
                  imageObjectName,
                  s"image/${image.getSuffix}",
                  stream.available,
                  stream
                )
              )
            }.toEither
          }
        )

        val futureResults = Future.sequence(imageFutures)
        val results = Await.result(futureResults, Duration.Inf)
        results.count(_.isRight)

case class ImageWithName(name: String, image: PDImageXObject)

extension (o: PDImageXObject)
  def imageInputStream(): InputStream =
    val byteArrayOutputStream = ByteArrayOutputStream()
    ImageIO.write(o.getImage, o.getSuffix, byteArrayOutputStream)
    ByteArrayInputStream(byteArrayOutputStream.toByteArray)

class ImageGetterEngine extends PDFStreamEngine:
  var images = Array[ImageWithName]()

  addOperator(Concatenate(this))
  addOperator(DrawObject(this))
  addOperator(SetGraphicsStateParameters(this))
  addOperator(Save(this))
  addOperator(Restore(this))
  addOperator(SetMatrix(this))

  override def processOperator(
      operator: Operator,
      arguments: ju.List[COSBase]
  ): Unit =
    val operation = operator.getName

    if operation != OperatorName.DRAW_OBJECT then
      super.processOperator(operator, arguments)
    else
      val objectName = arguments.get(0).asInstanceOf[COSName]
      val xobject = getResources().getXObject(objectName)

      if xobject.isInstanceOf[PDImageXObject] then
        val image = xobject.asInstanceOf[PDImageXObject]
        images :+= ImageWithName(objectName.getName, image)
