"use client";

import { useBuilder } from "@/contexts/BuilderContext";
import { CareerPageRenderer } from "@/components/sections/CareerPageRenderer";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { JobItem } from "@/components/sections/registry";

export function CenterPane() {
  const { state } = useBuilder();
  const [jobs, setJobs] = useState<JobItem[]>([]);

  // Fetch real jobs from backend for the preview
  useEffect(() => {
    apiFetch("/api/jobs")
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch(() => setJobs([]));
  }, []);

  const getContainerStyle = (): React.CSSProperties => {
    switch (state.viewport) {
      case "mobile":
        return { width: "390px", borderRadius: "40px", minHeight: "100%" };
      case "tablet":
        return { width: "768px", borderRadius: "24px", minHeight: "100%" };
      case "desktop":
      default:
        return { width: "100%", borderRadius: "0", minHeight: "100%" };
    }
  };

  const containerStyle = getContainerStyle();
  const isNarrow = state.viewport !== "desktop";

  return (
    <div
      className={`flex-1 bg-zinc-100 dark:bg-zinc-900 overflow-auto flex flex-col items-center ${
        isNarrow ? "py-8 px-4" : "p-0"
      }`}
    >
      {/* Viewport label */}
      {isNarrow && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-400 bg-zinc-50 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
            {state.viewport === "mobile" ? "390px mobile" : "768px tablet"}
          </span>
        </div>
      )}

      <div
        className="bg-white dark:bg-zinc-950 shadow-2xl border border-zinc-200/50 dark:border-zinc-800/50 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
        style={containerStyle}
      >
        <CareerPageRenderer
          sections={state.sections}
          theme={state.theme}
          jobs={jobs}
        />
      </div>
    </div>
  );
}
