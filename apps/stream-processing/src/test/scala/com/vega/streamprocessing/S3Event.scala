import com.vega.streamprocessing.*
import upickle.default.{read}
import java.nio.charset.StandardCharsets
import io.minio.MinioClient

class S3EventSuite extends munit.FunSuite:
  test("S3EventKey"):
    val keyWithoutPath = "vega/file.txt"

    assert(keyWithoutPath match
      case S3EventKey(bucket, path, filename) =>
        true
      case _ => false
    )

    val keyWithPath = "vega/long/path/to/file.txt"

    assert(keyWithoutPath match
      case S3EventKey(bucket, path, filename) =>
        true
      case _ => false
    )
  test("S3EventValue"):
    val eventExample = s"""{
      "EventName": "s3:ObjectCreated:Put",
      "Key": "vega/Contrato de renovação-1.pdf",
      "Records": [
        {
          "eventVersion": "2.0",
          "eventSource": "minio:s3",
          "awsRegion": "",
          "eventTime": "2024-07-19T14:34:08.158Z",
          "eventName": "s3:ObjectCreated:Put",
          "userIdentity": {
            "principalId": "Q3AM3UQ867SPQQA43P2F"
          },
          "requestParameters": {
            "principalId": "Q3AM3UQ867SPQQA43P2F",
            "region": "",
            "sourceIPAddress": "172.22.0.1"
          },
          "responseElements": {
            "x-amz-id-2": "dd9025bab4ad464b049177c95eb6ebf374d3b3fd1af9251148b658df7ac2e3e8",
            "x-amz-request-id": "17E3A3DC0FB2EF4F",
            "x-minio-deployment-id": "bf181084-21a1-4dbc-ae17-802c391e39f2",
            "x-minio-origin-endpoint": "http://172.22.0.2:9000"
          },
          "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "Config",
            "bucket": {
              "name": "vega",
              "ownerIdentity": {
                "principalId": "Q3AM3UQ867SPQQA43P2F"
              },
              "arn": "arn:aws:s3:::vega"
            },
            "object": {
              "key": "Contrato+de+renova%C3%A7%C3%A3o-1.pdf",
              "size": 1154983,
              "eTag": "5d8d6616e52abb2a041be799f674c228",
              "contentType": "application/pdf",
              "userMetadata": {
                "content-type": "application/pdf"
              },
              "sequencer": "17E3A3DC10F32B0C"
            }
          },
          "source": {
            "host": "172.22.0.1",
            "port": "",
            "userAgent": "MinIO (linux; amd64) minio-go/v7.0.61 MinIO Console/(dev)"
          }
        }
      ]
    }"""

    val value =
      S3EventValue.serde
        .deserializer()
        .deserialize("", eventExample.getBytes)

    assert(Option(value) match
      case Some(value) => true
      case _           => false
    )
