import { persistentAtom } from "@nanostores/persistent";
import { domain } from "@vega/documents";
import { documentFixtures } from "./fixtures";
import { nanoid } from "nanoid";

export const documents = persistentAtom<domain.Document[]>(
  "documents",
  [documentFixtures.ouvidoria],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const addDocument = (newDocument: Omit<domain.Document, "id">) => {
  const document = { ...newDocument, id: nanoid() };

  documents.set([...documents.get(), document]);

  return document;
};

export const deleteDocument = (documentId: domain.Document["id"]) =>
  documents.set(documents.get().filter(({ id }) => id !== documentId));
