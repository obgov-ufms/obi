import { CRUDRepository } from "../../core";
import { Database, KyselyClient } from "./kysely";

export class KyselyCRUDRepository<T, Q, D> implements CRUDRepository<T, Q, D> {
  constructor(
    private client: KyselyClient,
    private entityName: keyof Database
  ) {}

  getAll() {
    return this.client
      .selectFrom(this.entityName)
      .selectAll()
      .execute() as Promise<T[]>;
  }

  getOne(query: Q) {
    let builder = this.client.selectFrom(this.entityName).selectAll();

    for (const [key, value] of Object.entries(query as any)) {
      builder = builder.where(key as any, "=", value);
    }

    return builder.executeTakeFirst() as Promise<T>;
  }

  createOne(data: D): Promise<T> {
    return this.client
      .insertInto(this.entityName)
      .values(data as any)
      .returningAll()
      .executeTakeFirst() as Promise<T>;
  }

  deleteOne(query: Q): Promise<T> {
    let builder = this.client.deleteFrom(this.entityName);

    for (const [key, value] of Object.entries(query as any)) {
      builder = builder.where(key as any, "=", value);
    }

    return builder.returningAll().executeTakeFirst() as Promise<T>;
  }

  updateOne(query: Q, data: D): Promise<T> {
    let builder = this.client.updateTable(this.entityName).set(data as any);

    for (const [key, value] of Object.entries(query as any)) {
      builder = builder.where(key as any, "=", value);
    }

    return builder.returningAll().executeTakeFirst() as Promise<T>;
  }
}
