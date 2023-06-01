import { createServer } from "node:http";
import { ExpressApp, KyselyCRUDRepository, kyselyClient } from "./framework";
import { CRUDUsecase } from "./core";
import { http as httpConfig } from "./config";

const crudUsecase = new CRUDUsecase(
  new KyselyCRUDRepository(kyselyClient, "organization"),
  new KyselyCRUDRepository(kyselyClient, "document"),
  new KyselyCRUDRepository(kyselyClient, "document_node"),
  new KyselyCRUDRepository(kyselyClient, "data_definition_entry")
);
const app = new ExpressApp(crudUsecase);

createServer(app.requestListener).listen(
  httpConfig.port,
  httpConfig.hostname,
  () =>
    console.log(
      `Server listening on http://${httpConfig.hostname}:${httpConfig.port}`
    )
);
