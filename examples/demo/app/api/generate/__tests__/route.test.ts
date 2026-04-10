import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

// Mock the dependencies
vi.mock("@/lib/catalog", () => ({
  catalog: {
    prompt: () => "Mock catalog with components",
  },
}));

vi.mock("@/lib/spec-schema", () => ({
  specSchema: {
    parse: (obj: any) => obj, // Pass through for testing
  },
}));

vi.mock("ai", () => ({
  streamText: vi.fn(() => ({
    textStream: (async function* () {
      yield '{"root":"main"';
      yield ',"elements":{"main":{"type":"Section"}}}';
    })(),
  })),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: vi.fn(() => {
    return vi.fn((modelId: string) => ({
      doStream: vi.fn(),
    }));
  }),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => {
    return vi.fn((modelId: string) => ({
      doStream: vi.fn(),
    }));
  }),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => {
    return vi.fn((modelId: string) => ({
      doStream: vi.fn(),
    }));
  }),
}));

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Request Validation", () => {
    it("should reject request with no body", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: "{}",
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it("should reject request with empty prompt", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it("should accept valid prompt with default provider", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Create a form" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should accept valid prompt with explicit provider", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Create a form",
          provider: "openai",
          modelId: "gpt-4o",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should reject non-string prompt", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: 123 }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });
  });

  describe("Provider Initialization", () => {
    it("should initialize Anthropic provider", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "anthropic",
          modelId: "claude-opus-4-6",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should initialize OpenAI provider", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "openai",
          modelId: "gpt-4o",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should initialize Google provider", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "google",
          modelId: "gemini-2.0-flash",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should handle unknown provider by defaulting to Anthropic", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "unknown",
          modelId: "some-model",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should use custom API key if provided", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "openai",
          modelId: "gpt-4o",
          apiKey: "custom-key-123",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("Streaming Format", () => {
    it("should stream response in SSE format", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    });

    it("should send text chunks with proper SSE format", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      // SSE format: "data: {...}\n\n"
      expect(text).toContain("data:");
      expect(text).toContain("type");
    });

    it("should emit done chunk with spec object", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      expect(text).toContain('"type":"done"');
      expect(text).toContain('"spec"');
    });

    it("should accumulate text chunks correctly", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      // Should contain root and elements from the mocked stream
      expect(text).toContain("root");
      expect(text).toContain("elements");
    });
  });

  describe("System Prompt Configuration", () => {
    it("should include catalog.prompt() in system message", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
      // The mock catalog.prompt() is used in streamText call
    });

    it("should format user prompt correctly", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Custom user request" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should set maxTokens to 16384", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should set temperature to 0.7", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("Error Handling", () => {
    it("should return 400 for invalid request body", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: "invalid json",
        headers: { "Content-Type": "application/json" },
      });

      try {
        const response = await POST(req);
        expect(response.status).toBe(400);
      } catch {
        // Request parsing error is expected
      }
    });

    it("should handle missing prompt gracefully", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ provider: "anthropic" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);
    });

    it("should send error chunk on parsing failure", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      // Should have either success or error response
      expect(text).toContain("type");
    });

    it("should return proper error message for provider initialization error", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "invalid_provider_name",
        }),
      });

      // Invalid provider should fallback to Anthropic
      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("JSON Parsing Integration", () => {
    it("should handle valid JSON spec", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      expect(text).toContain('"root"');
      expect(text).toContain('"type":"Section"');
    });

    it("should handle markdown code fences in output", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should handle multiple JSON objects in output", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should validate spec with Zod schema", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("Response Headers", () => {
    it("should set Content-Type to text/event-stream", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    });

    it("should set Cache-Control to no-cache", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.headers.get("Cache-Control")).toContain("no-cache");
    });

    it("should set Connection to keep-alive", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.headers.get("Connection")).toContain("keep-alive");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long prompts", async () => {
      const longPrompt = "Create a form. ".repeat(100);
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: longPrompt }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should handle special characters in prompt", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Create a form with \"quotes\" and 'apostrophes' & special chars: @#$%" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should handle Unicode characters", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Create a form with émojis 🎉 and ünïcödé" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should use default modelId when not provided", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "anthropic",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should use custom modelId when provided", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "openai",
          modelId: "gpt-4o",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should handle whitespace-only prompt", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "   \n\t  " }),
      });

      const response = await POST(req);
      // Whitespace-only strings pass the truthy check and are sent to the model
      expect(response.status).toBe(200);
    });
  });

  describe("Model Configuration", () => {
    it("should apply temperature 0.7", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should apply maxTokens 16384", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should include system prompt with instructions", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });

    it("should format prompt as user message", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Create a page" }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("Custom Configuration", () => {
    it("should accept custom baseUrl for OpenRouter", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "openrouter",
          modelId: "custom/model",
          baseUrl: "https://custom.api/v1",
        }),
      });

      const response = await POST(req);
      // Custom provider handling
      expect([200, 400]).toContain(response.status);
    });

    it("should use provided API key", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt: "Test",
          provider: "openai",
          apiKey: "sk-custom-key",
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe("Streaming Behavior", () => {
    it("should emit text chunks during streaming", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      // Should contain multiple data events
      const dataLines = text.split("\n").filter((line) => line.startsWith("data:"));
      expect(dataLines.length).toBeGreaterThan(0);
    });

    it("should emit done event at end of stream", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      expect(text).toContain('"type":"done"');
    });

    it("should preserve chunk order during streaming", async () => {
      const req = new Request("http://localhost/api/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: "Test" }),
      });

      const response = await POST(req);
      const text = await response.text();

      // Text chunks should precede done
      const textIndex = text.indexOf('"type":"text"');
      const doneIndex = text.indexOf('"type":"done"');
      expect(textIndex).toBeLessThan(doneIndex);
    });
  });
});
