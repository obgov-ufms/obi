import sbtassembly.MergeStrategy

val scala3Version = "3.4.2"
val kafkaVersion = "3.7.1"
val upickleVersion = "4.0.0-RC1"
val slf4jVersion = "2.0.13"
val minioVersion = "8.5.11"
val pdfboxVersion = "3.0.3"
val jaiImageioVersion = "1.4.0"

ThisBuild / assemblyMergeStrategy := {
  case x if x.endsWith("module-info.class")  => MergeStrategy.discard
  case x if x.endsWith("okio.kotlin_module") => MergeStrategy.discard
  case x =>
    val oldStrategy = (ThisBuild / assemblyMergeStrategy).value
    oldStrategy(x)
}

lazy val root = project
  .in(file("."))
  .settings(
    name := "stream-processing",
    version := "0.1.0",
    scalaVersion := scala3Version,
    libraryDependencies ++= Seq(
      "org.scala-lang.modules" %% "scala-parallel-collections" % "1.0.4",
      "org.scalameta" %% "munit" % "1.0.0" % Test,
      "org.apache.kafka" % "kafka-clients" % kafkaVersion,
      "org.apache.kafka" % "kafka-streams" % kafkaVersion,
      "com.lihaoyi" %% "upickle" % upickleVersion,
      "org.slf4j" % "slf4j-api" % slf4jVersion,
      "org.slf4j" % "slf4j-simple" % slf4jVersion,
      "io.minio" % "minio" % minioVersion,
      "org.apache.pdfbox" % "pdfbox" % pdfboxVersion,
      "org.apache.pdfbox" % "pdfbox-tools" % pdfboxVersion,
      "com.github.jai-imageio" % "jai-imageio-jpeg2000" % jaiImageioVersion,
      "com.github.jai-imageio" % "jai-imageio-core" % jaiImageioVersion
    )
  )
