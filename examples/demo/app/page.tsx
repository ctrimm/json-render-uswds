"use client";

import { useState, useRef } from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import { registry } from "@/lib/registry";
import type { Spec } from "@/lib/spec-schema";
import { FIXTURES, getFixtureGroups, type Fixture } from "@/lib/fixtures";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const EXAMPLE_PROMPTS = [
  "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
  "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
  "Design a Driver's License Renewal application with fields for license number, address, eye color, and renewal type. Add a step indicator showing progress, alerts for missing fields, and a final confirmation card.",
  "Build a Service Status Dashboard showing the operational status of 6 government services with colored status indicators and accordion sections for details.",
  "Create a Federal Grant Application form with multiple sections: project description, budget overview, timeline, and team information. Include form validation, inline help text, and a summary card at the bottom.",
  "Design an Agency Directory page with a hero header, search functionality, and cards for each department showing contact info, hours, and a link to services. Include a breadcrumb navigation.",
  "Build a Voter Registration page with a form collecting personal information, residency confirmation, and party preference. Include a hero section with voting information and an alert about registration deadlines.",
  "Create a Complaint & Feedback form for a federal agency with fields for category, description, contact info, and attachment. Include a confirmation step and success message with case number.",
];

type Tab = "render" | "source";
type Provider = "anthropic" | "openai" | "google" | "openrouter" | "ollama" | "lmstudio" | "custom";

interface ProviderConfig {
  label: string;
  defaultModel: string;
  suggestions: string[];
  needsBaseUrl: boolean;
  defaultBaseUrl?: string;
  needsApiKey: boolean;
}

const PROVIDERS: Record<Provider, ProviderConfig> = {
  anthropic: {
    label: "Anthropic",
    defaultModel: "claude-opus-4-6",
    suggestions: ["claude-opus-4-6", "claude-sonnet-4-6", "claude-haiku-4-5-20251001"],
    needsBaseUrl: false,
    needsApiKey: false,
  },
  openai: {
    label: "OpenAI",
    defaultModel: "gpt-4o",
    suggestions: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
    needsBaseUrl: false,
    needsApiKey: true,
  },
  google: {
    label: "Google",
    defaultModel: "gemini-2.0-flash",
    suggestions: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    needsBaseUrl: false,
    needsApiKey: true,
  },
  openrouter: {
    label: "OpenRouter",
    defaultModel: "anthropic/claude-opus-4-6",
    suggestions: [
      "anthropic/claude-opus-4-6",
      "openai/gpt-4o",
      "google/gemini-2.0-flash-001",
      "meta-llama/llama-4-maverick",
      "mistralai/mistral-large",
    ],
    needsBaseUrl: false,
    needsApiKey: true,
  },
  ollama: {
    label: "Ollama (local)",
    defaultModel: "llama3.1",
    suggestions: ["llama3.1", "llama3.1:70b", "mistral", "gemma2", "qwen2.5-coder"],
    needsBaseUrl: true,
    defaultBaseUrl: "http://localhost:11434/v1",
    needsApiKey: false,
  },
  lmstudio: {
    label: "LM Studio (local)",
    defaultModel: "local-model",
    suggestions: ["local-model"],
    needsBaseUrl: true,
    defaultBaseUrl: "http://localhost:1234/v1",
    needsApiKey: false,
  },
  custom: {
    label: "Custom (OpenAI-compatible)",
    defaultModel: "",
    suggestions: [],
    needsBaseUrl: true,
    defaultBaseUrl: "",
    needsApiKey: true,
  },
};

const PROVIDER_BADGES: Record<string, string> = {
  anthropic: "bg-orange-100 text-orange-700 border-orange-200",
  openai: "bg-green-100 text-green-700 border-green-200",
  google: "bg-blue-100 text-blue-700 border-blue-200",
  openrouter: "bg-purple-100 text-purple-700 border-purple-200",
  ollama: "bg-gray-100 text-gray-700 border-gray-200",
  lmstudio: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("render");
  const [streamingJSON, setStreamingJSON] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [modelId, setModelId] = useState(PROVIDERS.anthropic.defaultModel);
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  // Compare mode: slot A and/or slot B — any fixtures from any group
  const [compareSlots, setCompareSlots] = useState<[string | null, string | null]>([null, null]);
  // Track which fixture is currently loaded (for tab bar badge)
  const [loadedFixture, setLoadedFixture] = useState<Fixture | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const comparePanelRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const isSyncingScroll = useRef(false);

  // Derived: are we in compare view? (any slot set)
  const isCompareActive = compareSlots[0] !== null || compareSlots[1] !== null;

  const handleCompareScroll = (sourceIndex: number) => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    const source = comparePanelRefs.current[sourceIndex];
    const target = comparePanelRefs.current[1 - sourceIndex];
    if (source && target) target.scrollTop = source.scrollTop;
    requestAnimationFrame(() => { isSyncingScroll.current = false; });
  };

  const downloadJSON = () => {
    if (!spec) return;
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uswds-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHTML = () => {
    if (!previewRef.current) return;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>USWDS Page</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uswds/3.8.2/css/uswds.min.css">
</head>
<body>
${previewRef.current.innerHTML}
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "uswds-page.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const providerConfig = PROVIDERS[provider];

  const handleProviderChange = (newProvider: Provider) => {
    const config = PROVIDERS[newProvider];
    setProvider(newProvider);
    setModelId(config.defaultModel);
    setBaseUrl(config.defaultBaseUrl || "");
    setApiKey("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSpec(null);
    setStreamingJSON("");
    setActiveTab("source");
    setLoadedFixture(null);
    setCompareSlots([null, null]);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider, modelId, baseUrl: baseUrl || undefined, apiKey: apiKey || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate page");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let jsonBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                jsonBuffer += data.text;
                setStreamingJSON(jsonBuffer);
              } else if (data.type === "done") {
                setSpec(data.spec);
                setActiveTab("render");
                setSidebarOpen(false);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch {
              // Skip malformed data lines
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setActiveTab("source");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="bg-sidebar border-b border-sidebar-border px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition p-1.5 rounded-md hover:bg-sidebar-accent"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-sidebar-foreground/50 font-mono">@cdt5058/</span>
                <span className="text-sm font-semibold text-sidebar-foreground">json-render-uswds</span>
              </div>
              <p className="text-xs text-sidebar-foreground/50 hidden sm:block leading-none mt-0.5">
                Generate USWDS pages from plain English
              </p>
            </div>
          </div>
          <a
            href="https://github.com/ctrimm/json-render-uswds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground transition shrink-0 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden shrink-0 ${sidebarOpen ? "w-80" : "w-0"}`}>
          <ScrollArea className="flex-1 w-80">
            <div className="flex flex-col gap-5 p-4">

              {/* Generate form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
                    Describe your page
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Create a contact form for a federal agency..."
                    className="h-32 resize-none text-sm bg-background/60"
                  />
                </div>

                {/* Model picker */}
                <div className="rounded-lg border border-sidebar-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowModelPicker((v) => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-sidebar-accent transition"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${PROVIDER_BADGES[provider] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {providerConfig.label}
                      </span>
                      <span className="font-mono text-sidebar-foreground/60 truncate">{modelId || "no model"}</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 shrink-0 text-sidebar-foreground/40 transition-transform ${showModelPicker ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {showModelPicker && (
                    <div className="border-t border-sidebar-border p-3 space-y-3 bg-background/40">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Provider</label>
                        <Select value={provider} onValueChange={(v) => handleProviderChange(v as Provider)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(PROVIDERS) as Provider[]).map((p) => (
                              <SelectItem key={p} value={p} className="text-xs">{PROVIDERS[p].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Model</label>
                        <Input
                          value={modelId}
                          onChange={(e) => setModelId(e.target.value)}
                          placeholder="Model ID"
                          className="h-8 text-xs font-mono"
                        />
                        {providerConfig.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {providerConfig.suggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setModelId(s)}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-mono border transition ${
                                  modelId === s
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {providerConfig.needsBaseUrl && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Base URL</label>
                          <Input
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder={providerConfig.defaultBaseUrl || "http://localhost:11434/v1"}
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      )}

                      {providerConfig.needsApiKey && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">
                            API Key <span className="text-muted-foreground/60 font-normal">(server-side only)</span>
                          </label>
                          <Input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            autoComplete="off"
                            className="h-8 text-xs font-mono"
                          />
                        </div>
                      )}

                      {(provider === "ollama" || provider === "lmstudio") && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {provider === "ollama"
                            ? "Make sure Ollama is running. Pull a model with: ollama pull llama3.1"
                            : "Make sure LM Studio is running with the local server enabled."}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isLoading || !prompt.trim()} className="w-full">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </span>
                  ) : "Generate Page"}
                </Button>
              </form>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-xs text-destructive font-medium">{error}</p>
                </div>
              )}

              <Separator className="bg-sidebar-border" />

              {/* Fixtures */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                    Load fixture
                  </p>
                  {(compareSlots[0] || compareSlots[1]) && (
                    <button
                      className="text-[10px] text-muted-foreground hover:text-foreground transition"
                      onClick={() => setCompareSlots([null, null])}
                    >
                      Clear A/B
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {getFixtureGroups().map((group) => (
                    <div key={group.groupId} className="rounded-lg border border-sidebar-border bg-background/60 overflow-hidden">
                      <div className="px-3 pt-2.5 pb-1.5">
                        <p className="text-xs font-semibold text-sidebar-foreground">{group.label}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{group.description}</p>
                      </div>
                      <div className="divide-y divide-sidebar-border">
                        {group.variants.map((v) => (
                          <div key={v.id} className="flex items-center gap-1.5 px-3 py-1.5">
                            <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-sans ${PROVIDER_BADGES[v.provider] ?? "bg-muted text-muted-foreground border-border"}`}>
                              {v.provider}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground flex-1 truncate min-w-0">{v.model}</span>
                            {/* A slot */}
                            <button
                              title="Assign to slot A"
                              onClick={() => setCompareSlots([v.id, compareSlots[1]])}
                              className={`w-5 h-5 rounded text-[10px] font-bold border transition shrink-0 ${compareSlots[0] === v.id ? "bg-blue-500 text-white border-blue-600" : "border-border text-muted-foreground hover:bg-sidebar-accent"}`}
                            >A</button>
                            {/* B slot */}
                            <button
                              title="Assign to slot B"
                              onClick={() => setCompareSlots([compareSlots[0], v.id])}
                              className={`w-5 h-5 rounded text-[10px] font-bold border transition shrink-0 ${compareSlots[1] === v.id ? "bg-green-500 text-white border-green-600" : "border-border text-muted-foreground hover:bg-sidebar-accent"}`}
                            >B</button>
                            {/* Load */}
                            <button
                              title="Load this fixture"
                              onClick={() => {
                                setSpec(v.spec);
                                setPrompt(v.prompt);
                                setActiveTab("render");
                                setCompareSlots([null, null]);
                                setLoadedFixture(v);
                              }}
                              className="text-[11px] text-primary hover:text-primary/80 font-medium transition shrink-0"
                            >
                              Load
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-sidebar-border" />

              {/* Example prompts */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                  Try an example
                </p>
                <div className="space-y-1.5">
                  {EXAMPLE_PROMPTS.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-md border border-transparent hover:border-sidebar-border hover:bg-sidebar-accent transition text-sidebar-foreground/70 hover:text-sidebar-foreground leading-relaxed"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Tab bar */}
          <div className="border-b border-border flex items-center px-2 bg-card shrink-0">
            {isCompareActive ? (
              (() => {
                const fixtureA = compareSlots[0] ? FIXTURES.find((f) => f.id === compareSlots[0]) : null;
                const fixtureB = compareSlots[1] ? FIXTURES.find((f) => f.id === compareSlots[1]) : null;
                return (
                  <>
                    <div className="flex items-center gap-2 px-2 py-2.5 min-w-0 overflow-hidden">
                      <span className="w-4 h-4 rounded text-[10px] font-bold bg-blue-500 text-white flex items-center justify-center shrink-0">A</span>
                      {fixtureA ? (
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${PROVIDER_BADGES[fixtureA.provider] ?? ""}`}>
                          {fixtureA.provider} / {fixtureA.model}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic shrink-0">not set</span>
                      )}
                      {fixtureB && (
                        <>
                          <span className="text-xs text-muted-foreground shrink-0">vs</span>
                          <span className="w-4 h-4 rounded text-[10px] font-bold bg-green-500 text-white flex items-center justify-center shrink-0">B</span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${PROVIDER_BADGES[fixtureB.provider] ?? ""}`}>
                            {fixtureB.provider} / {fixtureB.model}
                          </span>
                        </>
                      )}
                      {!fixtureB && (
                        <span className="text-[10px] text-muted-foreground italic shrink-0">— pick B to compare</span>
                      )}
                    </div>
                    <div className="ml-auto pr-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground"
                        onClick={() => setCompareSlots([null, null])}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Exit compare
                      </Button>
                    </div>
                  </>
                );
              })()
            ) : (spec || isLoading) ? (
              <>
                <button
                  onClick={() => setActiveTab("render")}
                  disabled={isLoading}
                  className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                    activeTab === "render"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("source")}
                  className={`px-4 py-3 text-sm font-medium transition border-b-2 -mb-px ${
                    activeTab === "source"
                      ? "text-primary border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  JSON
                </button>
                {loadedFixture && (
                  <div className="flex items-center gap-1.5 ml-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PROVIDER_BADGES[loadedFixture.provider] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {loadedFixture.provider}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{loadedFixture.model}</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadJSON}
                    disabled={!spec}
                    className="h-7 text-xs gap-1.5 text-muted-foreground"
                    title="Download JSON spec"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    JSON
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={downloadHTML}
                    disabled={!spec || activeTab !== "render"}
                    className="h-7 text-xs gap-1.5 text-muted-foreground"
                    title="Download rendered HTML (switch to Preview tab first)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    HTML
                  </Button>
                  <div className="w-px h-4 bg-border mx-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (spec) {
                        localStorage.setItem("preview-spec", JSON.stringify(spec));
                        window.open("/preview", "_blank");
                      }
                    }}
                    disabled={!spec}
                    className="h-7 text-xs gap-1.5 text-muted-foreground"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    Full page
                  </Button>
                </div>
              </>
            ) : (
              <div className="py-3 px-4 text-sm text-muted-foreground">
                {sidebarOpen ? "Enter a prompt to get started" : (
                  <button onClick={() => setSidebarOpen(true)} className="text-primary hover:text-primary/80 font-medium transition">
                    ← Open sidebar to generate a page
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-hidden flex">
            {/* Compare view — single panel (A only) or split (A + B) */}
            {isCompareActive && (() => {
              const fixtureA = compareSlots[0] ? FIXTURES.find((f) => f.id === compareSlots[0]) : null;
              const fixtureB = compareSlots[1] ? FIXTURES.find((f) => f.id === compareSlots[1]) : null;
              const slotColors = [
                { bg: "bg-blue-500", label: "A" },
                { bg: "bg-green-500", label: "B" },
              ];
              const panels = [fixtureA, fixtureB].filter(Boolean) as Fixture[];
              return (
                <>
                  {panels.map((fixture, index) => (
                    <div
                      key={fixture.id}
                      ref={(el) => { comparePanelRefs.current[index] = el; }}
                      onScroll={() => handleCompareScroll(index)}
                      className="flex-1 min-w-0 border-r-2 border-border last:border-r-0 overflow-auto relative"
                    >
                      <div className="sticky top-0 z-10 flex items-center gap-2 px-3 py-2 bg-card border-b border-border">
                        <span className={`w-4 h-4 rounded text-[10px] font-bold ${slotColors[index].bg} text-white flex items-center justify-center shrink-0`}>
                          {slotColors[index].label}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${PROVIDER_BADGES[fixture.provider] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {fixture.provider}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground truncate">{fixture.model}</span>
                      </div>
                      <JSONUIProvider registry={registry} initialState={{}}>
                        <Renderer spec={fixture.spec} registry={registry} />
                      </JSONUIProvider>
                    </div>
                  ))}
                </>
              );
            })()}

            {/* Normal content (hidden in compare mode) */}
            {!isCompareActive && (
              <div className="flex-1 overflow-auto">
                {isLoading && activeTab === "source" && (
                  <pre className="text-xs bg-zinc-950 text-zinc-300 p-4 font-mono min-h-full leading-relaxed">
                    {streamingJSON || "Generating JSON..."}
                  </pre>
                )}

                {isLoading && activeTab === "render" && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <svg className="animate-spin w-8 h-8 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <p className="text-sm text-muted-foreground">Building your USWDS page...</p>
                    </div>
                  </div>
                )}

                {!isLoading && spec && activeTab === "render" && (
                  <div ref={previewRef}>
                    <JSONUIProvider registry={registry} initialState={{}}>
                      <Renderer spec={spec} registry={registry} />
                    </JSONUIProvider>
                  </div>
                )}

                {!isLoading && spec && activeTab === "source" && (
                  <pre className="text-xs bg-zinc-950 text-zinc-300 p-4 font-mono min-h-full leading-relaxed">
                    {JSON.stringify(spec, null, 2)}
                  </pre>
                )}

                {!isLoading && !spec && !error && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3 max-w-sm px-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18M9 21V9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">No page generated yet</p>
                        <p className="text-xs text-muted-foreground mt-1">Describe a government page in the sidebar, load a fixture, or try an example prompt.</p>
                      </div>
                      {!sidebarOpen && (
                        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
                          Open sidebar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
