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
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-black font-sans">
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
        // If a draft exists, use it. Otherwise, initialize empty arrays.
        // Wait, the API creates an empty draft if none exists when we call PUT /draft, 
        // but GET /api/career-page returns draft_version.
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
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-sm font-medium text-zinc-500 animate-pulse">Loading builder...</div>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-sm font-medium text-red-500">Failed to load careers page data.</div>
      </div>
    );
  }

  return (
    <BuilderProvider initialSections={initialData.sections} initialTheme={initialData.theme}>
      <BuilderLayout />
    </BuilderProvider>
  );
}
