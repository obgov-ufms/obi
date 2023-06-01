import { nanoid } from "nanoid";
import { Document } from "./Document";

export type TypedDocumentNode<T> = DocumentNode & { metadata: T };

export interface DocumentNode {
  id: string;
  index: number;
  documentId: Document["id"];

  metadata:
    | TextDocumentNodeMetadata
    | DataDefinitionDocumentNodeMetadata
    | ValueDocumentNodeMetadata
    | FormulaDocumentNodeMetadata;
}

export interface TextDocumentNodeMetadata {
  kind: "text";
  value: string;
}

export interface DataDefinitionDocumentNodeMetadata {
  kind: "data_definition";
  name: string;
  schema: Record<string, string>;
}

export interface ValueDocumentNodeMetadata {
  kind: "value";
  name: string;
  type: "string" | "number";
  value: any;
}

export interface FormulaDocumentNodeMetadata {
  kind: "formula";
  name: string;
  symbols: string[];
}

export const TextDocumentNode = (
  value: TextDocumentNodeMetadata["value"],
  documentId: DocumentNode["documentId"],
  index: DocumentNode["index"] = -1
): TypedDocumentNode<TextDocumentNodeMetadata> => ({
  id: nanoid(),
  documentId,
  index,
  metadata: {
    kind: "text",
    value,
  },
});

export const DataDefinitionDocumentNode = (
  name: DataDefinitionDocumentNodeMetadata["name"],
  schema: DataDefinitionDocumentNodeMetadata["schema"],
  documentId: DocumentNode["documentId"],
  index: DocumentNode["index"] = -1
): TypedDocumentNode<DataDefinitionDocumentNodeMetadata> => ({
  id: nanoid(),
  documentId,
  index,
  metadata: {
    kind: "data_definition",
    name,
    schema,
  },
});

export const ValueDocumentNode = (
  name: ValueDocumentNodeMetadata["name"],
  type: ValueDocumentNodeMetadata["type"],
  value: ValueDocumentNodeMetadata["value"],
  documentId: DocumentNode["documentId"],
  index: DocumentNode["index"] = -1
): TypedDocumentNode<ValueDocumentNodeMetadata> => ({
  id: nanoid(),
  documentId,
  index,
  metadata: {
    kind: "value",
    name,
    type,
    value,
  },
});

export const FormulaDocumentNode = (
  name: FormulaDocumentNodeMetadata["name"],
  symbols: FormulaDocumentNodeMetadata["symbols"],
  documentId: DocumentNode["documentId"],
  index: DocumentNode["index"] = -1
): TypedDocumentNode<FormulaDocumentNodeMetadata> => ({
  id: nanoid(),
  documentId,
  index,
  metadata: {
    kind: "formula",
    name,
    symbols,
  },
});
