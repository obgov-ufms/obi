import { persistentAtom } from "@nanostores/persistent";
import { domain } from "@vega/documents";
import { documentNodeFixtures } from "./fixtures";

export const documentNodes = persistentAtom<domain.DocumentNode[]>(
  "document_nodes",
  [documentNodeFixtures.ouvidoriaTitulo],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const updateNode = (updatedNode: domain.DocumentNode) =>
  documentNodes.set(
    documentNodes
      .get()
      .map((node, j) => (j !== updatedNode.index ? node : updatedNode))
  );

export const addNode = (newNode: Omit<domain.DocumentNode, "index">) =>
  documentNodes.set([
    ...documentNodes.get(),
    { ...newNode, index: documentNodes.get().length } as domain.DocumentNode,
  ]);

export const deleteNode = (node: domain.DocumentNode) =>
  documentNodes.set(
    documentNodes
      .get()
      .filter((_, j) => j !== node.index)
      .map((node, i) => ({ ...node, index: i }))
  );
