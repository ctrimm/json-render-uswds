"use client";

import { useEffect, useState } from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import { registry } from "@/lib/registry";
import type { Spec } from "@/lib/spec-schema";

export default function PreviewPage() {
  const [spec, setSpec] = useState<Spec | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("preview-spec");
      if (raw) setSpec(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
        No spec found. Load a fixture or generate a page from the main app first.
      </div>
    );
  }

  return (
    <JSONUIProvider registry={registry} initialState={{}}>
      <Renderer spec={spec} registry={registry} />
    </JSONUIProvider>
  );
}
