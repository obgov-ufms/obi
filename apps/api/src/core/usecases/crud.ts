import {
  DataDefinitionEntryRepository,
  DocumentNodeRepository,
  DocumentRepository,
  OrganizationRepository,
} from "../data";
import { Usecase } from "../domain";

export class CRUDUsecase
  implements
    Usecase<
      {},
      {
        organization: OrganizationRepository;
        document: DocumentRepository;
        documentNode: DocumentNodeRepository;
        dataDefinitionEntry: DataDefinitionEntryRepository;
      }
    >
{
  constructor(
    private organizationRepository: OrganizationRepository,
    private documentRepository: DocumentNodeRepository,
    private documentNodeRepository: DocumentNodeRepository,
    private dataDefinitionEntryRepository: DataDefinitionEntryRepository
  ) {}

  execute(_: {}) {
    return {
      organization: this.organizationRepository,
      document: this.documentRepository,
      documentNode: this.documentNodeRepository,
      dataDefinitionEntry: this.dataDefinitionEntryRepository,
    };
  }
}
