import { Organization } from "@/domain/Organization";
import { domain } from "@vega/documents";

export const organizationFixtures: Record<string, Organization> = {
  ufms: { id: "0gqOOauBdnWZtVMFaGdcq", name: "UFMS" },
};

export const documentFixtures: Record<string, domain.Document> = {
  ouvidoria: {
    id: "R27txq8Fu3U_NlQ8G77eQ",
    name: "Ouvidoria",
    organizationId: organizationFixtures.ufms.id,
  },
};

export const documentNodeFixtures: Record<string, domain.DocumentNode> = {
  ouvidoriaTitulo: {
    id: "qrKRxAUujCtGw-LwKaJTk",
    documentId: documentFixtures.ouvidoria.id,
    index: 0,
    metadata: {
      kind: "text",
      value: "# Ouvidoria",
    },
  },
};
