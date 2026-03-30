import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { catalog } from "@/lib/catalog";
import { specSchema } from "@/lib/spec-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

function extractSingleJSON(text: string) {
  // Remove JSON patch operations and extract the main spec object
  // Look for the outermost { ... } that contains "root" and "elements"
  const specMatch = text.match(/\{\s*"root"\s*:\s*"[^"]*"\s*,\s*"elements"\s*:\s*\{[\s\S]*\}\s*\}/);
  if (specMatch) {
    return specMatch[0];
  }

  // Fallback: try to find any large JSON object
  const jsonMatch = text.match(/\{[\s\S]*"elements"[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return text;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

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

    const result = streamText({
      model: anthropic("claude-opus-4-6"),
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

          // When done streaming, extract and parse the JSON spec
          const jsonText = extractSingleJSON(fullText);

          try {
            const parsed = JSON.parse(jsonText);
            const spec = specSchema.parse(parsed);

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
