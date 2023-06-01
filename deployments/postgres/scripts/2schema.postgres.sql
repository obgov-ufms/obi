CREATE TABLE "organization" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "name" text NOT NULL
);

CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4())
);

CREATE TABLE "user_organization" (
  "id" serial PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "organization_id" uuid NOT NULL
);

CREATE TABLE "authorization_scope" (
  "id" text PRIMARY KEY,
  "description" text
);

CREATE TABLE "user_organization_scope" (
  "user_organization_id" int,
  "authorization_scope_id" text,
  PRIMARY KEY ("user_organization_id", "authorization_scope_id")
);

CREATE TABLE "document" (
  "id" uuid PRIMARY KEY DEFAULT (uuid_generate_v4()),
  "organization_id" uuid NOT NULL
);

CREATE TABLE "user_document" (
  "id" serial PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "document_id" uuid NOT NULL
);

CREATE TABLE "user_document_scope" (
  "user_document_id" int,
  "authorization_scope_id" text,
  PRIMARY KEY ("user_document_id", "authorization_scope_id")
);

CREATE TABLE "document_node" (
  "id" serial,
  "document_id" uuid,
  "index" int NOT NULL,
  "metadata" jsonb,
  PRIMARY KEY ("id", "document_id")
);

CREATE TABLE "data_definition_entry" (
  "document_node_id" int,
  "document_id" uuid,
  "id" serial,
  "value" jsonb,
  PRIMARY KEY ("document_node_id", "document_id", "id")
);

CREATE UNIQUE INDEX ON "user_organization" ("user_id", "organization_id");

CREATE UNIQUE INDEX ON "user_document" ("user_id", "document_id");

CREATE UNIQUE INDEX ON "document_node" ("id", "document_id", "index");

ALTER TABLE "user_organization" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user_organization" ADD FOREIGN KEY ("organization_id") REFERENCES "organization" ("id");

ALTER TABLE "user_organization_scope" ADD FOREIGN KEY ("user_organization_id") REFERENCES "user_organization" ("id");

ALTER TABLE "user_organization_scope" ADD FOREIGN KEY ("authorization_scope_id") REFERENCES "authorization_scope" ("id");

ALTER TABLE "document" ADD FOREIGN KEY ("organization_id") REFERENCES "organization" ("id");

ALTER TABLE "user_document" ADD FOREIGN KEY ("user_id") REFERENCES "user" ("id");

ALTER TABLE "user_document" ADD FOREIGN KEY ("document_id") REFERENCES "document" ("id");

ALTER TABLE "user_document_scope" ADD FOREIGN KEY ("user_document_id") REFERENCES "user_document" ("id");

ALTER TABLE "user_document_scope" ADD FOREIGN KEY ("authorization_scope_id") REFERENCES "authorization_scope" ("id");

ALTER TABLE "document_node" ADD FOREIGN KEY ("document_id") REFERENCES "document" ("id");

ALTER TABLE "data_definition_entry" ADD FOREIGN KEY ("document_node_id", "document_id") REFERENCES "document_node" ("id", "document_id");