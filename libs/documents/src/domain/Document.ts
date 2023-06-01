import { Organization } from "./Organization";

export interface Document {
  id: string;
  name: string;
  organizationId: Organization["id"];
}
