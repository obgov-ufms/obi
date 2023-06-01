import { Generated, Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

interface OrganizationTable {
  id: Generated<string>;
  name: string;
}

interface DocumentTable {
  id: Generated<string>;
  organization_id: OrganizationTable["id"];
}

interface DocumentNodeTable {
  id: Generated<number>;
  document_id: DocumentTable["id"];
  index: number;
  metadata: any;
}

interface DataDefinitionEntryTable {
  document_node_id: number;
  document_id: string;
  id: number;
  value: any;
}

export interface Database {
  organization: OrganizationTable;
  document: DocumentTable;
  document_node: DocumentNodeTable;
  data_definition_entry: DataDefinitionEntryTable;
}

export type KyselyClient = Kysely<Database>;

export const kyselyClient = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: "localhost",
      database: "obgov",
      user: "postgres",
      password: "secret",
    }),
  }),
});
