import com.vega.streamprocessing.*
import scala.io.Source
import scala.util.Try

class ImageExtractionSuite extends munit.FunSuite:
  test("ImageExtraction"):
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

    val extractedImages = event.extractFileImages()

    println(s"$extractedImages/${MockStorageProvider.objectsPut}")

    assert(
      extractedImages == 945 && extractedImages == MockStorageProvider.objectsPut
    )
