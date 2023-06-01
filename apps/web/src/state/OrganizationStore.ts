import { persistentAtom } from "@nanostores/persistent";
import { Organization } from "@/domain/Organization";
import { organizationFixtures } from "./fixtures";

export const organizations = persistentAtom<Organization[]>(
  "organizations",
  [organizationFixtures.ufms],
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
);

export const addOrganization = (newOrganization: Organization) =>
  organizations.set([...organizations.get(), newOrganization]);
