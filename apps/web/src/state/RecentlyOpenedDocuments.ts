import { persistentAtom } from "@nanostores/persistent";
import { domain } from "@vega/documents";

export const recentlyOpenedDocumentIds = persistentAtom<
  domain.Document["id"][]
>("recently_opened_documents", [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addRecentlyOpenedDocument = (documentId: string) =>
  recentlyOpenedDocumentIds.set([
    documentId,
    ...recentlyOpenedDocumentIds
      .get()
      .slice(0, 5)
      .filter((id) => id !== documentId),
  ]);
