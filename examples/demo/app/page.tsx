"use client";

import { useState } from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import { registry } from "@/lib/registry";
import type { Spec } from "@/lib/spec-schema";
import publicRecordsFixture from "@/lib/fixtures/public-records.json";
import federalBenefitsFixture from "@/lib/fixtures/federal-benefits.json";

const EXAMPLE_PROMPTS = [
  "Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.",
  "Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.",
  "Design a Driver's License Renewal application with fields for license number, address, eye color, and renewal type. Add a step indicator showing progress, alerts for missing fields, and a final confirmation card.",
  "Build a Service Status Dashboard showing the operational status of 6 government services (applications processing, passport processing, permit issuance, etc.) with colored status indicators and accordion sections for details.",
  "Create a Federal Grant Application form with multiple sections: project description, budget overview, timeline, and team information. Include form validation, inline help text, and a summary card at the bottom.",
  "Design an Agency Directory page with a hero header, search functionality, and cards for each department showing contact info, hours, and a link to services. Include a breadcrumb navigation.",
  "Build a Voter Registration page with a form collecting personal information, residency confirmation, and party preference. Include a hero section with voting information and an alert about registration deadlines.",
  "Create a Complaint & Feedback form for a federal agency with fields for category, description, contact info, and attachment. Include a confirmation step and success message with case number.",
];

type Tab = "render" | "source";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [spec, setSpec] = useState<Spec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("render");
  const [streamingJSON, setStreamingJSON] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSpec(null);
    setStreamingJSON("");
    setActiveTab("source");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
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
            } catch (parseErr) {
              // Skip malformed data lines
            }
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setActiveTab("source");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-3 shadow">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-gray-400 hover:text-white transition p-1 rounded"
              title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              )}
            </button>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-400 font-mono">@cdt5058/</span>
                <span className="text-base font-semibold">json-render-uswds</span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">
                Generate USWDS pages from plain English
              </p>
            </div>
          </div>
          <a
            href="https://github.com/cdt5058/json-render-uswds"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white text-sm transition shrink-0"
          >
            GitHub →
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">

        {/* Left Sidebar */}
        <div
          className={`flex flex-col bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden shrink-0 ${
            sidebarOpen ? "w-80" : "w-0"
          }`}
        >
          <div className="flex flex-col gap-4 p-5 w-80 overflow-y-auto h-full">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Describe your page
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Create a contact form for a federal agency..."
                  className="w-full h-36 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⟳</span>
                    Generating...
                  </span>
                ) : (
                  "Generate Page"
                )}
              </button>
            </form>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Load fixture */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Load fixture
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSpec(publicRecordsFixture as Spec);
                    setPrompt("Create a public records request page with a hero section explaining the process, a table showing recent requests and their status, and a button to start a new request. Include site alert for any current service advisories.");
                    setActiveTab("render");
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition text-blue-800 leading-relaxed font-medium"
                >
                  Public Records Request page
                </button>
                <button
                  onClick={() => {
                    setSpec(federalBenefitsFixture as Spec);
                    setPrompt("Build a Federal Benefits Application form with sections for applicant information, income verification, and document upload. Include a header with agency branding, a process list showing the 4 steps, and navigation.");
                    setActiveTab("render");
                    setSidebarOpen(false);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition text-blue-800 leading-relaxed font-medium"
                >
                  Federal Benefits Application form
                </button>
              </div>
            </div>

            {/* Example Prompts */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Try an example
              </p>
              <div className="space-y-2">
                {EXAMPLE_PROMPTS.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left text-xs p-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition text-gray-700 leading-relaxed"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs bar */}
          <div className="border-b border-gray-200 flex items-center bg-white px-2">
            {(spec || isLoading) ? (
              <>
                <button
                  onClick={() => setActiveTab("render")}
                  disabled={isLoading}
                  className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                    activeTab === "render"
                      ? "text-blue-700 border-blue-700"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("source")}
                  className={`px-4 py-3 text-sm font-medium transition border-b-2 ${
                    activeTab === "source"
                      ? "text-blue-700 border-blue-700"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  Source Code
                </button>
                <div className="ml-auto">
                  <button
                    onClick={() => {
                      if (spec) {
                        localStorage.setItem("preview-spec", JSON.stringify(spec));
                        window.open("/preview", "_blank");
                      }
                    }}
                    disabled={!spec}
                    className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Open preview in new window"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    New window
                  </button>
                </div>
              </>
            ) : (
              <div className="py-3 px-4 text-sm text-gray-400">
                {sidebarOpen ? "Enter a prompt to get started" : (
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    ← Open sidebar to generate a page
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-white">
            {isLoading && activeTab === "source" && (
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 font-mono min-h-full">
                {streamingJSON || "Generating JSON..."}
              </pre>
            )}

            {isLoading && activeTab === "render" && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-3">
                  <div className="text-4xl animate-spin">⟳</div>
                  <p className="text-gray-500 text-sm">Building your USWDS page...</p>
                </div>
              </div>
            )}

            {!isLoading && spec && activeTab === "render" && (
              <JSONUIProvider registry={registry} initialState={{}}>
                <Renderer spec={spec} registry={registry} />
              </JSONUIProvider>
            )}

            {!isLoading && spec && activeTab === "source" && (
              <pre className="text-xs bg-gray-900 text-gray-100 p-4 font-mono min-h-full">
                {JSON.stringify(spec, null, 2)}
              </pre>
            )}

            {!isLoading && !spec && !error && !sidebarOpen && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <p className="text-gray-400 text-sm">No page generated yet.</p>
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    ← Open sidebar to get started
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
