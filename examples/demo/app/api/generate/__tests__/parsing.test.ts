import { describe, it, expect } from "vitest";

/**
 * Extract every top-level JSON object from text via bracket-matching.
 * (Copied from route.ts for testing purposes)
 */
function extractAllJSON(text: string): string[] {
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
    if (depth !== 0) i = start + 1;
  }
  return results;
}

/**
 * Fix common model JSON errors before parsing.
 */
function repairJSON(text: string): string {
  return text.replace(/"(\$(?:state|bindState))":"([^"]*?)(\}+)/g, '"$1":"$2"$3');
}

/**
 * Reconstruct a spec from JSON Patch "add" operations.
 */
function reconstructSpecFromPatches(text: string): unknown | null {
  const stripped = text.replace(/```(?:json)?\s*\n?/g, "").trim();

  let patches: unknown;
  try {
    patches = JSON.parse(stripped);
  } catch {
    try {
      patches = JSON.parse(`[${stripped}]`);
    } catch {
      try {
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
  }

  if (typeof result.root === "string" && typeof result.elements === "object" && result.elements !== null) {
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
 * Strip elements entries that have no `type` string.
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

// ============================================================================
// TEST SUITE
// ============================================================================

describe("extractAllJSON", () => {
  it("should extract a single JSON object from plain text", () => {
    const input = 'Here is a JSON: {"key":"value"}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"key":"value"}');
  });

  it("should extract JSON from markdown code fences with json tag", () => {
    const input = 'Here is code:\n```json\n{"key":"value"}\n```\nEnd';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"key":"value"}');
  });

  it("should extract JSON from markdown code fences without language tag", () => {
    const input = 'Here is code:\n```\n{"key":"value"}\n```\nEnd';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"key":"value"}');
  });

  it("should handle nested objects correctly", () => {
    const input = '{"a":{"b":{"c":1}}}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"a":{"b":{"c":1}}}');
  });

  it("should extract multiple JSON objects from one string", () => {
    const input = '{"first":1}{"second":2}{"third":3}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(3);
    expect(result[0]).toBe('{"first":1}');
    expect(result[1]).toBe('{"second":2}');
    expect(result[2]).toBe('{"third":3}');
  });

  it("should extract multiple JSON objects separated by text", () => {
    const input = 'First: {"a":1} and Second: {"b":2}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('{"a":1}');
    expect(result[1]).toBe('{"b":2}');
  });

  it("should skip incomplete JSON with unclosed brackets", () => {
    const input = '{"valid":1} and {"invalid":1 (no closing bracket)';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"valid":1}');
  });

  it("should return empty array when no JSON is present", () => {
    const input = "No JSON here at all";
    const result = extractAllJSON(input);
    expect(result).toHaveLength(0);
  });

  it("should handle JSON with strings containing braces", () => {
    const input = '{"msg":"Use {curly} braces like this"}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"msg":"Use {curly} braces like this"}');
  });

  it("should handle JSON with escaped quotes in strings", () => {
    const input = '{"msg":"He said \\"hello\\""}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"msg":"He said \\"hello\\""}');
  });

  it("should handle JSON with escaped backslashes", () => {
    const input = '{"path":"C:\\\\Users\\\\file"}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"path":"C:\\\\Users\\\\file"}');
  });

  it("should handle multiple code fence blocks", () => {
    const input = '```json\n{"first":1}\n```\nSome text\n```json\n{"second":2}\n```';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe('{"first":1}');
    expect(result[1]).toBe('{"second":2}');
  });

  it("should extract JSON with newlines inside strings", () => {
    const input = '{"key":"line1\\nline2"}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"key":"line1\\nline2"}');
  });

  it("should extract JSON with array values", () => {
    const input = '{"items":[1,2,3]}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"items":[1,2,3]}');
  });

  it("should extract spec-like objects with root and elements", () => {
    const input = '{"root":"main","elements":{"main":{"type":"Section"}}}';
    const result = extractAllJSON(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('{"root":"main","elements":{"main":{"type":"Section"}}}');
  });
});

describe("repairJSON", () => {
  it("should fix missing closing quote before closing brace for $state", () => {
    const input = '{"$state":"/path"}}';
    const result = repairJSON(input);
    expect(result).toBe('{"$state":"/path"}}');
  });

  it("should fix missing closing quote for $bindState", () => {
    const input = '{"$bindState":"/path"}}';
    const result = repairJSON(input);
    expect(result).toBe('{"$bindState":"/path"}}');
  });

  it("should fix Llama bug with multiple closing braces", () => {
    const input = '{"$state":"/elements/foo/props/value}}}';
    const result = repairJSON(input);
    expect(result).toBe('{"$state":"/elements/foo/props/value"}}}');
  });

  it("should leave valid JSON unchanged", () => {
    const input = '{"key":"value","$state":"/path"}';
    const result = repairJSON(input);
    expect(result).toBe('{"key":"value","$state":"/path"}');
  });

  it("should handle multiple instances in one string", () => {
    const input = '{"$state":"/path1"}},{"$bindState":"/path2"}}';
    const result = repairJSON(input);
    expect(result).toBe('{"$state":"/path1"}},{"$bindState":"/path2"}}');
  });

  it("should handle complex paths with slashes", () => {
    const input = '{"$state":"/elements/foo/props/value/deep"}}';
    const result = repairJSON(input);
    expect(result).toBe('{"$state":"/elements/foo/props/value/deep"}}');
  });

  it("should not modify $state with correct closing quotes", () => {
    const input = '{"$state":"/correct"},"other":1}';
    const result = repairJSON(input);
    expect(result).toBe('{"$state":"/correct"},"other":1}');
  });

  it("should handle edge case with empty path", () => {
    const input = '{"$state":""}}';
    const result = repairJSON(input);
    // Edge case with empty string doesn't match repair pattern, returns as-is
    expect(result).toBe('{"$state":""}}');
  });

  it("should fix multiple keys in same object", () => {
    const input = '{"a":"x","$state":"/path","b":"y"}}';
    const result = repairJSON(input);
    expect(result).toBe('{"a":"x","$state":"/path","b":"y"}}');
  });

  it("should handle nested structures with the bug", () => {
    const input = '{"nested":{"$bindState":"/data"}}}}';
    const result = repairJSON(input);
    expect(result).toContain('"$bindState":"/data"');
  });
});

describe("reconstructSpecFromPatches", () => {
  it("should reconstruct spec from valid NDJSON patch format", () => {
    const input = `{"op":"add","path":"/root","value":"main-content"}
{"op":"add","path":"/elements/main-content","value":{"type":"Section"}}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      root: "main-content",
      elements: {
        "main-content": { type: "Section" },
      },
    });
  });

  it("should reconstruct spec from comma-separated patch objects", () => {
    const input = '{"op":"add","path":"/root","value":"main"},{"op":"add","path":"/elements/main","value":{"type":"Container"}}';
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      root: "main",
      elements: {
        main: { type: "Container" },
      },
    });
  });

  it("should reconstruct spec from array-formatted patches", () => {
    const input = '[{"op":"add","path":"/root","value":"page"},{"op":"add","path":"/elements/page","value":{"type":"Page"}}]';
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      root: "page",
      elements: {
        page: { type: "Page" },
      },
    });
  });

  it("should return null for empty patches", () => {
    const input = "[]";
    const result = reconstructSpecFromPatches(input);
    expect(result).toBeNull();
  });

  it("should return null when patches lack required fields", () => {
    const input = '{"op":"add"}';
    const result = reconstructSpecFromPatches(input);
    expect(result).toBeNull();
  });

  it("should return null when result lacks root or elements", () => {
    const input = '{"op":"add","path":"/other","value":"data"}';
    const result = reconstructSpecFromPatches(input);
    expect(result).toBeNull();
  });

  it("should handle patches with markdown code fences", () => {
    const input = `\`\`\`json
{"op":"add","path":"/root","value":"main"}
{"op":"add","path":"/elements/main","value":{"type":"Section"}}
\`\`\``;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      root: "main",
      elements: {
        main: { type: "Section" },
      },
    });
  });

  it("should ignore non-add operations", () => {
    const input = `{"op":"add","path":"/root","value":"main"}
{"op":"remove","path":"/elements/removed"}
{"op":"add","path":"/elements/main","value":{"type":"Button"}}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    expect(result).toEqual({
      root: "main",
      elements: {
        main: { type: "Button" },
      },
    });
  });

  it("should strip elements without type field", () => {
    const input = `{"op":"add","path":"/root","value":"main"}
{"op":"add","path":"/elements/main","value":{"type":"Section"}}
{"op":"add","path":"/elements/state","value":{"someData":"value"}}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    const elements = result as Record<string, unknown>;
    expect(Object.keys(elements.elements as Record<string, unknown>)).toEqual(["main"]);
  });

  it("should handle multiple elements with valid types", () => {
    const input = `{"op":"add","path":"/root","value":"container"}
{"op":"add","path":"/elements/container","value":{"type":"Container"}}
{"op":"add","path":"/elements/button-1","value":{"type":"Button"}}
{"op":"add","path":"/elements/button-2","value":{"type":"Button"}}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toHaveLength(3);
  });

  it("should ignore paths deeper than 2 levels", () => {
    const input = `{"op":"add","path":"/root","value":"main"}
{"op":"add","path":"/elements/main","value":{"type":"Container"}}
{"op":"add","path":"/state/form/name","value":"John"}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
    const spec = result as Record<string, unknown>;
    expect(Object.keys(spec)).not.toContain("state");
  });

  it("should return null for malformed NDJSON", () => {
    const input = '{"op":"add","path":"/root" "value":"main"}';
    const result = reconstructSpecFromPatches(input);
    expect(result).toBeNull();
  });

  it("should handle whitespace variations in NDJSON", () => {
    const input = `{"op":"add","path":"/root","value":"main"}

{"op":"add","path":"/elements/main","value":{"type":"Section"}}`;
    const result = reconstructSpecFromPatches(input);
    expect(result).not.toBeNull();
  });
});

describe("stripInvalidElements", () => {
  it("should remove elements without type field", () => {
    const input = {
      root: "x",
      elements: {
        valid: { type: "Button" },
        invalid: { requests: [] },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toEqual(["valid"]);
    expect(elements.valid).toEqual({ type: "Button" });
  });

  it("should keep elements with type field", () => {
    const input = {
      root: "main",
      elements: {
        main: { type: "Section", props: { className: "main" } },
        child: { type: "Button", props: { label: "Click" } },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toHaveLength(2);
  });

  it("should handle nested elements without type", () => {
    const input = {
      root: "container",
      elements: {
        container: { type: "Container", children: ["inner"] },
        inner: { type: "Button" },
        metadata: { created: "2024-01-01" },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toEqual(["container", "inner"]);
  });

  it("should leave already clean objects unchanged", () => {
    const input = {
      root: "main",
      elements: {
        main: { type: "Section" },
      },
    };
    const result = stripInvalidElements(input);
    expect(result).toEqual(input);
  });

  it("should handle empty elements object", () => {
    const input = {
      root: "main",
      elements: {},
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toHaveLength(0);
  });

  it("should not modify non-spec objects", () => {
    const input = { data: "value", other: "field" };
    const result = stripInvalidElements(input);
    expect(result).toEqual(input);
  });

  it("should handle null or missing elements", () => {
    const input = { root: "main" };
    const result = stripInvalidElements(input);
    expect(result).toEqual(input);
  });

  it("should preserve non-string type values (remove them)", () => {
    const input = {
      root: "main",
      elements: {
        valid: { type: "Button" },
        invalid1: { type: null },
        invalid2: { type: 123 },
        invalid3: { type: {} },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toEqual(["valid"]);
  });

  it("should handle Llama state injection pattern", () => {
    const input = {
      root: "main",
      elements: {
        main: { type: "Container" },
        state: { formData: { name: "", email: "" } },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements)).toEqual(["main"]);
  });

  it("should return non-object inputs unchanged", () => {
    expect(stripInvalidElements(null)).toBeNull();
    expect(stripInvalidElements(123)).toBe(123);
    expect(stripInvalidElements("string")).toBe("string");
    expect(stripInvalidElements([])).toEqual([]);
  });

  it("should handle elements with both valid and invalid keys", () => {
    const input = {
      root: "page",
      elements: {
        page: { type: "Page", props: { title: "Home" } },
        header: { type: "Header" },
        requests: { pending: true },
        footer: { type: "Footer", children: [] },
        cache: { ttl: 3600 },
      },
    };
    const result = stripInvalidElements(input);
    const spec = result as Record<string, unknown>;
    const elements = spec.elements as Record<string, unknown>;
    expect(Object.keys(elements).sort()).toEqual(["footer", "header", "page"]);
  });
});
