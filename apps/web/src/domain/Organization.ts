import { nanoid } from "nanoid";

export interface Organization {
  id: string;
  name: string;
}

export const Organization = (name: string): Organization => ({
  id: nanoid(),
  name,
});
