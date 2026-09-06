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
        return { width: "390px", borderRadius: "32px", minHeight: "100%" };
      case "tablet":
        return { width: "768px", borderRadius: "20px", minHeight: "100%" };
      case "desktop":
      default:
        return { width: "100%", borderRadius: "0", minHeight: "100%" };
    }
  };

  const containerStyle = getContainerStyle();
  const isNarrow = state.viewport !== "desktop";

  return (
    <div
      className={`flex-1 overflow-auto flex flex-col items-center ${
        isNarrow ? "py-8 px-4" : "p-0"
      }`}
      style={{ backgroundColor: "var(--canvas)" }}
    >
      {/* Viewport label */}
      {isNarrow && (
        <div className="mb-4 flex items-center gap-2">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--muted-ink)",
            }}
          >
            {state.viewport === "mobile" ? "390px · Mobile" : "768px · Tablet"}
          </span>
        </div>
      )}

      {/* Page frame */}
      <div
        className="overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out"
        style={{
          ...containerStyle,
          backgroundColor: "#ffffff",
          boxShadow: isNarrow
            ? "0 8px 40px rgba(30,35,48,0.14), 0 2px 8px rgba(30,35,48,0.06)"
            : "none",
          border: isNarrow ? "none" : "none",
        }}
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
