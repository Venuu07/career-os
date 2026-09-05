"use client";

import { useState } from "react";
import { useBuilder } from "@/contexts/BuilderContext";
import { sectionRegistry } from "@/components/sections/registry";

type Tab = "section" | "theme";

const FONT_OPTIONS = [
  { label: "System default", value: "" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
];

export function RightPane() {
  const { state, dispatch } = useBuilder();
  const [activeTab, setActiveTab] = useState<Tab>("section");

  const selectedSection = state.sections.find(
    (s) => s.id === state.selectedSectionId
  );

  const handleUpdate = (newData: Record<string, unknown>) => {
    if (!selectedSection) return;
    dispatch({
      type: "UPDATE_SECTION",
      payload: { id: selectedSection.id, data: { data: newData } },
    });
  };

  return (
    <div className="w-72 shrink-0 bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-100 dark:border-zinc-900">
        <button
          type="button"
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "section"
              ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("section")}
        >
          Inspector
        </button>
        <button
          type="button"
          className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === "theme"
              ? "text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100"
              : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          }`}
          onClick={() => setActiveTab("theme")}
        >
          Theme
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "section" ? (
          <SectionInspectorTab
            selectedSection={selectedSection}
            onUpdate={handleUpdate}
          />
        ) : (
          <ThemeTab />
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// Section Inspector Tab
// ————————————————————————————————————————

function SectionInspectorTab({
  selectedSection,
  onUpdate,
}: {
  selectedSection: { id: string; type: string; data: Record<string, unknown> } | undefined;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  if (!selectedSection) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-3 text-lg">
          ←
        </div>
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Select a section
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">
          Click a section in the left panel to edit its content.
        </p>
      </div>
    );
  }

  const def = sectionRegistry[selectedSection.type];
  if (!def) {
    return (
      <div className="p-4 text-sm text-zinc-400">
        Unknown section type: {selectedSection.type}
      </div>
    );
  }

  const Inspector = def.Inspector;

  return (
    <div>
      <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <span className="text-base">{def.icon}</span>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {def.label}
            </h2>
            <p className="text-xs text-zinc-400 truncate">{def.description}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Inspector data={selectedSection.data} updateData={onUpdate} />
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// Theme Tab
// ————————————————————————————————————————

function ThemeTab() {
  const { state, dispatch } = useBuilder();
  const theme = state.theme;

  const set = (key: string, value: string) => {
    dispatch({ type: "SET_THEME", payload: { [key]: value } });
  };

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Theme
        </h2>
        <p className="text-xs text-zinc-400">
          These settings apply across all sections of your careers page.
        </p>
      </div>

      <ColorField
        label="Primary color"
        value={theme.primary_color || "#18181b"}
        onChange={(v) => set("primary_color", v)}
        description="Used for buttons, headings, and accents."
      />

      <ColorField
        label="Background color"
        value={theme.background_color || "#fafafa"}
        onChange={(v) => set("background_color", v)}
        description="Used for the Hero section background."
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Font family
        </label>
        <select
          value={theme.font_family || ""}
          onChange={(e) => set("font_family", e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Logo URL
        </label>
        <input
          type="url"
          value={theme.logo_url || ""}
          onChange={(e) => set("logo_url", e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition"
        />
        {theme.logo_url && (
          <div className="mt-2 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme.logo_url}
              alt="Logo preview"
              className="h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  description?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer shrink-0"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 px-3 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition"
        />
      </div>
      {description && (
        <p className="text-xs text-zinc-400">{description}</p>
      )}
    </div>
  );
}
