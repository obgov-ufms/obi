import cors from "cors";
import express, { Express, Router } from "express";
import { RequestListener } from "node:http";
import { CRUDUsecase } from "../../core";

export class ExpressApp {
  private app: Express;

  constructor(crudUsecase: CRUDUsecase) {
    this.app = express()
      .use(cors())
      .use(express.json())
      .use("/v1", this.buildRouter(crudUsecase.execute({})));
  }

  private buildRouter(crud: ReturnType<CRUDUsecase["execute"]>): Router {
    const router = Router();

    const entities = [
      {
        name: "organization",
        allPath: "/organizations",
        onePath: "/organization/:id",
      },
      { name: "document", allPath: "/documents", onePath: "/document/:id" },
      {
        name: "documentNode",
        allPath: "/documents/:document_id/nodes",
        onePath: "/documents/:document_id/nodes/:id",
      },
      {
        name: "dataDefinitionEntry",
        allPath: "/documents/:document_id/nodes/:document_node_id/entries",
        onePath: "/documents/:document_id/nodes/:document_node_id/entries/:id",
      },
    ] as const;

    for (const entity of entities) {
      const entityCrud = crud[entity.name];

      router.get(entity.allPath, async (_, res) => {
        return res.status(200).json(await entityCrud.getAll());
      });

      router.get(entity.onePath, async (req, res) => {
        const query = {
          ...req.params,
          ...req.query,
        } as any;

        return res.status(200).json(await entityCrud.getOne(query));
      });

      router.put(entity.onePath, async (req, res) => {
        const query = {
          ...req.params,
          ...req.query,
        } as any;
        const data = req.body as any;

        return res.status(200).json(await entityCrud.updateOne(query, data));
      });

      router.delete(entity.onePath, async (req, res) => {
        const query = {
          ...req.params,
          ...req.query,
        } as any;

        return res.status(200).json(await entityCrud.deleteOne(query));
      });

      router.post(entity.allPath, async (req, res) => {
        const query = {
          ...req.params,
          ...req.query,
        } as any;

        return res.status(200).json(await entityCrud.createOne(query));
      });
    }

    return router;
  }

  get requestListener(): RequestListener {
    return this.app;
  }
}
