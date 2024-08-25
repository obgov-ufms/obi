package com.vega.streamprocessing

import com.vega.streamprocessing.*
import scala.io.Source
import scala.util.Try
import org.apache.pdfbox.contentstream.PDFStreamEngine
import org.apache.pdfbox.contentstream.operator.state.{
  Concatenate,
  SetGraphicsStateParameters,
  Save,
  Restore,
  SetMatrix
}
import org.apache.pdfbox.contentstream.operator.{
  DrawObject,
  Operator,
  OperatorName
}
import java.{util => ju}
import org.apache.pdfbox.cos.COSBase
import org.apache.pdfbox.text.TextPosition
import org.apache.pdfbox.text.PDFTextStripper
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject
import org.apache.pdfbox.cos.COSName
import java.io.OutputStreamWriter
import java.io.ByteArrayOutputStream

class PrintLocations extends PDFTextStripper:
  addOperator(Concatenate(this))
  addOperator(DrawObject(this))
  addOperator(SetGraphicsStateParameters(this))
  addOperator(Save(this))
  addOperator(Restore(this))
  addOperator(SetMatrix(this))

  this.output = OutputStreamWriter(ByteArrayOutputStream())

  override def writeString(
      string: String,
      textPositions: ju.List[TextPosition]
  ): Unit =
    textPositions.forEach(text =>
      println(
        "String[" + text.getXDirAdj() + "," +
          text.getYDirAdj() + " fs=" + text.getFontSize() + " xscale=" +
          text.getXScale() + " height=" + text.getHeightDir() + " space=" +
          text.getWidthOfSpace() + " width=" +
          text.getWidthDirAdj() + "]" + text.getUnicode()
      )
    )

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

        val imageWidth = image.getWidth
        val imageHeight = image.getHeight

        println(
          "*******************************************************************"
        )
        println("Found image [" + objectName.getName + "]")

        val ctmNew = getGraphicsState.getCurrentTransformationMatrix
        var imageXScale = ctmNew.getScalingFactorX
        var imageYScale = ctmNew.getScalingFactorY

        println(
          "position in PDF = " + ctmNew.getTranslateX() + ", " + ctmNew
            .getTranslateY() + " in user space units"
        )

        println(
          "raw image size  = " + imageWidth + ", " + imageHeight + " in pixels"
        )

        println(
          "displayed size  = " + imageXScale + ", " + imageYScale + " in user space units"
        )

        imageXScale /= 72
        imageYScale /= 72

        println(
          "displayed size  = " + imageXScale + ", " + imageYScale + " in inches at 72 dpi rendering"
        )

        imageXScale *= 25.4f
        imageYScale *= 25.4f

        println(
          "displayed size  = " + imageXScale + ", " + imageYScale + " in millimeters at 72 dpi rendering"
        );

        println()

class TextExtractionSuite extends munit.FunSuite:
  test("TextExtraction"):
    object MockStorageProvider extends StorageProvider:
      var objectsPut = 0
      def getObject(event: S3Event): Either[Throwable, Object] =
        Try {
          val objectName = "/relatorio.pdf"

          val resource =
            getClass.getResourceAsStream(objectName)

          Object(
            "test",
            objectName,
            "application/pdf",
            resource.available,
            resource
          )
        }.toEither
      def putObject(obj: Object): Either[Throwable, Unit] =
        objectsPut += 1
        Right(())

    given StorageProvider = MockStorageProvider

    val event = S3Event(
      S3EventKey("test", "/", "relatorio.pdf"),
      S3EventValue(
        "s3:ObjectCreated:Put",
        "test/relatorio.pdf",
        List()
      )
    )

    val text = event.extractText()

    assert(text.isRight)

    val pdf = event.fetchPdf()

    val locations = PrintLocations()

    pdf.map(_.getPages().forEach(locations.processPage(_)))
