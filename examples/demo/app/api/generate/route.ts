import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, LanguageModel } from "ai";
import { catalog } from "@/lib/catalog";
import { specSchema } from "@/lib/spec-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Extract every top-level JSON object from text via bracket-matching. */
function extractAllJSON(text: string): string[] {
  // Strip all markdown code fences (handles multiple blocks, any language tag)
  text = text.replace(/```(?:json)?\s*\n?/g, "");

  const results: string[] = [];
  let i = 0;
  while (i < text.length) {
    const start = text.indexOf("{", i);
    if (start === -1) break;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = start; j < text.length; j++) {
      const ch = text[j];
      if (escape) { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          results.push(text.slice(start, j + 1));
          i = j + 1;
          break;
        }
      }
    }
    // If we never closed the bracket, skip this opening brace
    if (depth !== 0) i = start + 1;
  }
  return results;
}

/**
 * Reconstruct a spec from JSON Patch "add" operations.
 * Some models (e.g. Gemini via OpenRouter) emit a bare comma-separated list of
 * RFC 6902 patch ops instead of a full spec object.
 */
function reconstructSpecFromPatches(text: string): unknown | null {
  const stripped = text.replace(/```(?:json)?\s*\n?/g, "").trim();

  let patches: unknown;
  try {
    patches = JSON.parse(stripped);
  } catch {
    try {
      // Comma-separated objects (no array brackets)
      patches = JSON.parse(`[${stripped}]`);
    } catch {
      try {
        // Newline-delimited JSON (NDJSON) — Gemini via OpenRouter uses this format
        const commaJoined = stripped.replace(/\}\s*\n\s*\{/g, "},{");
        patches = JSON.parse(`[${commaJoined}]`);
      } catch {
        return null;
      }
    }
  }

  if (!Array.isArray(patches) || patches.length === 0) return null;
  const first = patches[0] as Record<string, unknown>;
  if (typeof first?.op !== "string" || typeof first?.path !== "string") return null;

  const result: Record<string, unknown> = {};
  for (const entry of patches) {
    const patch = entry as { op: string; path: string; value: unknown };
    if (patch.op !== "add") continue;
    const parts = patch.path.replace(/^\//, "").split("/");
    if (parts.length === 1) {
      result[parts[0]] = patch.value;
    } else if (parts.length === 2) {
      const [parent, key] = parts;
      if (typeof result[parent] !== "object" || result[parent] === null) {
        result[parent] = {};
      }
      (result[parent] as Record<string, unknown>)[key] = patch.value;
    }
    // Ignore deeper paths like /state/form/name — not part of the spec schema
  }

  if (typeof result.root === "string" && typeof result.elements === "object" && result.elements !== null) {
    // Strip any elements entries that aren't valid component definitions (no `type` field).
    // Models sometimes add /elements/state or similar non-component patches.
    const elements = result.elements as Record<string, unknown>;
    for (const key of Object.keys(elements)) {
      const el = elements[key] as Record<string, unknown> | null;
      if (typeof el?.type !== "string") delete elements[key];
    }
    return result;
  }
  return null;
}

/**
 * Fix common model JSON errors before parsing.
 * Llama-4 (and similar) omit the closing `"` on $state/$bindState path values, e.g.:
 *   {"$state":"/elements/foo/props/value}}  →  {"$state":"/elements/foo/props/value"}}
 */
function repairJSON(text: string): string {
  return text.replace(/"(\$(?:state|bindState))":"([^"]*?)(\}+)/g, '"$1":"$2"$3');
}

/**
 * Strip elements entries that have no `type` string — e.g. Llama-4 injects a
 * `"state"` key directly into `elements` to hold initial state data.
 */
function stripInvalidElements(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  const record = obj as Record<string, unknown>;
  if (typeof record.elements === "object" && record.elements !== null) {
    const elements = record.elements as Record<string, unknown>;
    for (const key of Object.keys(elements)) {
      const el = elements[key] as Record<string, unknown> | null;
      if (typeof el?.type !== "string") delete elements[key];
    }
  }
  return obj;
}

/** Recursively find the first object with string `root` and object `elements` keys. */
function findSpecObject(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return null;
  const record = obj as Record<string, unknown>;
  if (typeof record.root === "string" && typeof record.elements === "object" && record.elements !== null) {
    return obj;
  }
  for (const value of Object.values(record)) {
    const found = findSpecObject(value);
    if (found) return found;
  }
  return null;
}

function getModel(provider: string, modelId: string, baseUrl?: string, apiKey?: string): LanguageModel {
  switch (provider) {
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY });
      return anthropic(modelId) as LanguageModel;
    }
    case "openai": {
      const openai = createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
      return openai(modelId) as LanguageModel;
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey: apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY });
      return google(modelId) as LanguageModel;
    }
    case "openrouter": {
      const openrouter = createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      });
      return openrouter(modelId) as LanguageModel;
    }
    case "ollama":
    case "lmstudio":
    case "custom": {
      const resolvedBaseUrl =
        baseUrl ||
        (provider === "ollama" ? "http://localhost:11434/v1" : "http://localhost:1234/v1");
      const openaiCompat = createOpenAI({
        baseURL: resolvedBaseUrl,
        apiKey: apiKey || "local", // local servers typically ignore the key
      });
      return openaiCompat(modelId) as LanguageModel;
    }
    default: {
      // Fallback to Anthropic
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      return anthropic("claude-opus-4-6") as LanguageModel;
    }
  }
}

export async function POST(req: Request) {
  try {
    const { prompt, provider = "anthropic", modelId = "claude-opus-4-6", baseUrl, apiKey } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Invalid prompt" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a UI generator that creates government web pages using the USWDS (U.S. Web Design System) component library.

${catalog.prompt()}

Generate a SINGLE JSON spec object (not JSON patches) that renders a complete USWDS page based on the user's request.
Follow this exact structure and return ONLY this JSON object:
{
  "root": "element-id-string",
  "elements": {
    "element-id-string": {
      "type": "ComponentName",
      "props": { /* component props object */ },
      "children": ["child-element-id-string"]
    }
  }
}

CRITICAL INSTRUCTIONS:
- Return ONE complete JSON object with root and elements properties
- Do NOT generate JSON patches or multiple JSON objects
- Do NOT use markdown code blocks or explanations
- ALL element IDs referenced in children arrays MUST exist in the elements object
- The root property MUST reference an element that exists in elements
- Use ONLY the USWDS components listed above in the catalog
- Make realistic government pages with proper structure
- Include proper headers, navigation, and footers
- Make content accessible and follow federal guidelines`;

    let model: LanguageModel;
    try {
      model = getModel(provider, modelId, baseUrl, apiKey);
    } catch (err) {
      return Response.json(
        { error: `Failed to initialize model: ${err instanceof Error ? err.message : String(err)}` },
        { status: 400 }
      );
    }

    const result = streamText({
      model,
      system: systemPrompt,
      prompt: `Create a USWDS page for the following request: ${prompt}`,
      temperature: 0.7,
      maxTokens: 16384,
    });

    let fullText = "";
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text: chunk })}\n\n`
              )
            );
          }

          // When done streaming, extract and parse the JSON spec.
          // Try every JSON object in the output — some models (e.g. Gemini) prefix
          // the real spec with smaller JSON fragments or wrap it in an envelope.
          const candidates = extractAllJSON(fullText);

          try {
            let specObject: unknown = null;
            for (const candidate of candidates) {
              try {
                const parsed = JSON.parse(repairJSON(candidate));
                const found = findSpecObject(parsed);
                if (found) { specObject = found; break; }
              } catch {
                // not valid JSON or not a spec — try next
              }
            }
            // Fallback: some models (Gemini via OpenRouter) emit JSON Patch ops
            if (!specObject) {
              specObject = reconstructSpecFromPatches(fullText);
            }
            if (!specObject) {
              throw new Error("No valid spec object found in model output");
            }
            // Strip non-component entries (e.g. "state" blobs) from elements before validation
            stripInvalidElements(specObject);
            const spec = specSchema.parse(specObject);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "done", spec })}\n\n`
              )
            );
          } catch (parseError) {
            throw new Error(
              `Failed to parse generated JSON: ${
                parseError instanceof Error ? parseError.message : "Unknown error"
              }`
            );
          }

          controller.close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to parse response";
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: message })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to generate page";
    return Response.json({ error: message }, { status: 500 });
  }
}
