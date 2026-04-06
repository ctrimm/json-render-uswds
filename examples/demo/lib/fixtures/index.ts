import type { Spec } from "@/lib/spec-schema";
import publicRecordsSpec from "./public-records.json";
import publicRecordsGpt4oSpec from "./public-records-gpt4o.json";
import publicRecordsGeminiFlashSpec from "./public-records-gemini20flash.json";
import federalBenefitsMetaLlama4MaverickSpec from "./public-records-llama.json";
import federalBenefitsSpec from "./federal-benefits.json";
import federalBenefitsGpt4oSpec from "./federal-benefits-gpt4o.json";
import federalBenefitsGeminiFlash from "./federal-benefits-gemini20flash.json";
import federalBenefitsMetaLlama4Spec from "./federal-benefits-llama.json";

export interface Fixture {
  id: string;
  groupId: string;   // fixtures with the same groupId are variants of the same prompt
  label: string;
  description: string;
  prompt: string;
  model: string;
  provider: string;
  spec: Spec;
}

export interface FixtureGroup {
  groupId: string;
  label: string;
  description: string;
  prompt: string;
  variants: Fixture[];
}

export const FIXTURES: Fixture[] = [
  {
    id: "public-records-claude",
    groupId: "public-records",
    label: "Public Records Request",
    description: "FOIA-style records request portal with hero, process list, status table, and footer.",
    prompt: "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
    model: "claude-opus-4-6",
    provider: "anthropic",
    spec: publicRecordsSpec as Spec,
  },
  {
    id: "federal-benefits-claude",
    groupId: "federal-benefits",
    label: "Federal Benefits Application",
    description: "Multi-step benefits application with income verification, document upload, and process indicator.",
    prompt: "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
    model: "claude-opus-4-6",
    provider: "anthropic",
    spec: federalBenefitsSpec as Spec,
  },
  {
    id: "federal-benefits-gpt4o",
    groupId: "federal-benefits",
    label: "Federal Benefits Application",
    description: "Multi-step benefits application with income verification, document upload, and process indicator.",
    prompt: "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
    model: "gpt-4o",
    provider: "openai",
    spec: federalBenefitsGpt4oSpec as Spec,
  },
  {
    id: "federal-benefits-gemini",
    groupId: "federal-benefits",
    label: "Federal Benefits Application",
    description: "Multi-step benefits application with income verification, document upload, and process indicator.",
    prompt: "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
    model: "gemini-flash-001",
    provider: "google",
    spec: federalBenefitsGeminiFlash as Spec,
  },
  {
    id: "federal-benefits-llama",
    groupId: "federal-benefits",
    label: "Federal Benefits Application",
    description: "Multi-step benefits application with income verification, document upload, and process indicator.",
    prompt: "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
    model: "llama-4-maverick",
    provider: "meta",
    spec: federalBenefitsMetaLlama4Spec as Spec,
  },
  {
    id: "public-records-gpt4o",
    groupId: "public-records",
    label: "Public Records Request",
    description: "FOIA-style records request portal with hero, process list, status table, and footer.",
    prompt: "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
    model: "gpt-4o",
    provider: "openai",
    spec: publicRecordsGpt4oSpec as Spec,
  },
  {
    id: "public-records-gemini20flash",
    groupId: "public-records",
    label: "Public Records Request",
    description: "FOIA-style records request portal with hero, process list, status table, and footer.",
    prompt: "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
    model: "gemini-flash-001",
    provider: "google",
    spec: publicRecordsGeminiFlashSpec as Spec,
  },
  {
    id: "public-records-meta-llama-maverick",
    groupId: "public-records",
    label: "Public Records Request",
    description: "FOIA-style records request portal with hero, process list, status table, and footer.",
    prompt: "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
    model: "llama-4-maverick",
    provider: "meta",
    spec: federalBenefitsMetaLlama4MaverickSpec as Spec,
  },
];

/** Returns fixtures grouped for sidebar rendering */
export function getFixtureGroups(): FixtureGroup[] {
  const map = new Map<string, FixtureGroup>();
  for (const fixture of FIXTURES) {
    if (!map.has(fixture.groupId)) {
      map.set(fixture.groupId, {
        groupId: fixture.groupId,
        label: fixture.label,
        description: fixture.description,
        prompt: fixture.prompt,
        variants: [],
      });
    }
    map.get(fixture.groupId)!.variants.push(fixture);
  }
  return Array.from(map.values());
}
