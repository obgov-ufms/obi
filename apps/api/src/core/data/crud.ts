export type Document = {};
export type Organization = {};
export type DocumentNode = {};
export type DataDefinitionEntry = {};

export interface DocumentRepository
  extends CRUDRepository<Document, { id: string }> {}
export interface OrganizationRepository
  extends CRUDRepository<Organization, { id: string }> {}
export interface DocumentNodeRepository
  extends CRUDRepository<DocumentNode, { id: string }> {}
export interface DataDefinitionEntryRepository
  extends CRUDRepository<DataDefinitionEntry, { id: string }> {}

export interface CRUDRepository<T, Q, D = Partial<T>> {
  getAll(): Promise<T[]>;
  getOne(query: Q): Promise<T>;
  createOne(data: D): Promise<T>;
  deleteOne(query: Q): Promise<T>;
  updateOne(query: Q, data: D): Promise<T>;
}
