import { persistentAtom } from "@nanostores/persistent";
import { domain } from "@vega/documents";
import { documentFixtures } from "./fixtures";

export const documents = persistentAtom<domain.Document[]>(
  "documents",
  [documentFixtures.ouvidoria],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const addDocument = (newDocument: domain.Document) =>
  documents.set([...documents.get(), newDocument]);
