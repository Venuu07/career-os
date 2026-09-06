"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { BuilderProvider, useBuilder } from "@/contexts/BuilderContext";
import { TopBar } from "@/components/builder/TopBar";
import { LeftPane } from "@/components/builder/LeftPane";
import { CenterPane } from "@/components/builder/CenterPane";
import { RightPane } from "@/components/builder/RightPane";
import { SectionConfig, ThemeConfig } from "@/lib/types";

function BuilderLayout() {
  const { state } = useBuilder();

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ backgroundColor: "var(--canvas)", fontFamily: "var(--font-onest, Onest, system-ui, sans-serif)" }}
    >
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {!state.isCandidatePreview && <LeftPane />}
        <CenterPane />
        {!state.isCandidatePreview && <RightPane />}
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const [initialData, setInitialData] = useState<{ sections: SectionConfig[], theme: ThemeConfig } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDraft() {
      try {
        const pageData = await apiFetch("/api/career-page");
        const draft = pageData?.draft_version;
        setInitialData({
          sections: draft?.sections_config || [],
          theme: draft?.theme_config || {},
        });
      } catch (err) {
        console.error("Failed to load draft:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDraft();
  }, []);

  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--canvas)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "var(--ink)" }}
          >
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="text-sm font-medium" style={{ color: "var(--muted-ink)" }}>
            Loading builder…
          </span>
        </div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{ backgroundColor: "var(--canvas)" }}
      >
        <div className="text-center">
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
            Failed to load careers page data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs"
            style={{ color: "var(--muted-ink)" }}
          >
            Try reloading
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuilderProvider initialSections={initialData.sections} initialTheme={initialData.theme}>
      <BuilderLayout />
    </BuilderProvider>
  );
}
