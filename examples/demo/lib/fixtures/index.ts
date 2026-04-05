import type { Spec } from "@/lib/spec-schema";
import publicRecordsSpec from "./public-records.json";
import federalBenefitsSpec from "./federal-benefits.json";

export interface Fixture {
  id: string;
  label: string;
  description: string;
  prompt: string;
  model: string;
  provider: string;
  spec: Spec;
}

export const FIXTURES: Fixture[] = [
  {
    id: "public-records-claude",
    label: "Public Records Request",
    description: "FOIA-style records request portal with hero, process list, status table, and footer.",
    prompt: "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
    model: "claude-opus-4-6",
    provider: "anthropic",
    spec: publicRecordsSpec as Spec,
  },
  {
    id: "federal-benefits-claude",
    label: "Federal Benefits Application",
    description: "Multi-step benefits application with income verification, document upload, and process indicator.",
    prompt: "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
    model: "claude-opus-4-6",
    provider: "anthropic",
    spec: federalBenefitsSpec as Spec,
  },
];
