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

// ── Shared field primitives ───────────────────────────────────────────────────

const fieldInputClass = `w-full h-9 px-3 text-sm rounded-xl font-[inherit]
  transition-all outline-none`;

const fieldInputStyle = {
  backgroundColor: "var(--canvas)",
  border: "1.5px solid var(--border-subtle)",
  color: "var(--ink)",
};

const fieldInputFocusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--green)";
    e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-bg)";
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--border-subtle)";
    e.currentTarget.style.boxShadow = "none";
  },
};

// ── Section label ─────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-semibold mb-1.5"
      style={{ color: "var(--muted-ink)" }}
    >
      {children}
    </label>
  );
}

// ── Group header ──────────────────────────────────────────────────────────────

function GroupHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-2 text-eyebrow"
      style={{
        color: "var(--muted-ink)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Main RightPane ───────────────────────────────────────────────────────────

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
    <div
      className="w-72 shrink-0 flex flex-col h-full"
      style={{
        backgroundColor: "var(--surface)",
        borderLeft: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div
        className="px-3 py-2.5 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex p-0.5 rounded-xl"
          style={{
            backgroundColor: "var(--canvas)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {(["section", "theme"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{
                backgroundColor:
                  activeTab === tab ? "var(--surface)" : "transparent",
                color: activeTab === tab ? "var(--ink)" : "var(--muted-ink)",
                boxShadow:
                  activeTab === tab
                    ? "0 1px 3px rgba(30,35,48,0.08)"
                    : "none",
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "section" ? "Inspector" : "Theme"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
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

// ─── Section Inspector Tab ────────────────────────────────────────────────────

function SectionInspectorTab({
  selectedSection,
  onUpdate,
}: {
  selectedSection:
    | { id: string; type: string; data: Record<string, unknown> }
    | undefined;
  onUpdate: (data: Record<string, unknown>) => void;
}) {
  if (!selectedSection) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4 text-xl"
          style={{
            backgroundColor: "var(--canvas)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          ←
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>
          Select a section
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-ink)" }}>
          Click any section in the left panel to edit its content here.
        </p>
      </div>
    );
  }

  const def = sectionRegistry[selectedSection.type];
  if (!def) {
    return (
      <div className="p-4 text-xs" style={{ color: "var(--muted-ink)" }}>
        Unknown section type: {selectedSection.type}
      </div>
    );
  }

  const Inspector = def.Inspector;

  return (
    <div>
      {/* Section header — sticky */}
      <div
        className="px-4 py-3 sticky top-0 z-10"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-sm"
            style={{
              backgroundColor: "var(--lavender-bg)",
              color: "var(--ink)",
              border: "1px solid var(--lavender)",
            }}
          >
            {def.icon}
          </div>
          <div className="min-w-0">
            <h2
              className="text-sm font-semibold leading-tight"
              style={{ color: "var(--ink)" }}
            >
              {def.label}
            </h2>
            <p
              className="text-xs truncate leading-tight mt-0.5"
              style={{ color: "var(--muted-ink)" }}
            >
              {def.description}
            </p>
          </div>
        </div>
      </div>

      {/* Inspector fields */}
      <div className="p-4">
        <Inspector data={selectedSection.data} updateData={onUpdate} />
      </div>
    </div>
  );
}

// ─── Theme Tab ────────────────────────────────────────────────────────────────

function ThemeTab() {
  const { state, dispatch } = useBuilder();
  const theme = state.theme;

  const set = (key: string, value: string) => {
    dispatch({ type: "SET_THEME", payload: { [key]: value } });
  };

  return (
    <div>
      {/* Header */}
      <div
        className="px-4 py-3 sticky top-0 z-10"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Theme
        </h2>
        <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>
          Applied globally across all sections.
        </p>
      </div>

      {/* Colors group */}
      <GroupHeader>Colors</GroupHeader>
      <div className="px-4 py-3 space-y-4">
        <ColorField
          label="Primary color"
          value={theme.primary_color || "#18181b"}
          onChange={(v) => set("primary_color", v)}
          description="Buttons, headings, and key accents."
        />
        <ColorField
          label="Background color"
          value={theme.background_color || "#fafafa"}
          onChange={(v) => set("background_color", v)}
          description="Hero section background."
        />
      </div>

      {/* Typography group */}
      <GroupHeader>Typography</GroupHeader>
      <div className="px-4 py-3">
        <FieldLabel>Font family</FieldLabel>
        <select
          value={theme.font_family || ""}
          onChange={(e) => set("font_family", e.target.value)}
          {...fieldInputFocusHandlers}
          className={fieldInputClass}
          style={{ ...fieldInputStyle, height: "2.25rem", appearance: "auto" }}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Branding group */}
      <GroupHeader>Branding</GroupHeader>
      <div className="px-4 py-3">
        <FieldLabel>Logo URL</FieldLabel>
        <input
          type="url"
          value={theme.logo_url || ""}
          onChange={(e) => set("logo_url", e.target.value)}
          placeholder="https://..."
          {...fieldInputFocusHandlers}
          className={fieldInputClass}
          style={fieldInputStyle}
        />
        {theme.logo_url && (
          <div
            className="mt-2.5 p-3 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: "var(--canvas)",
              border: "1px solid var(--border-subtle)",
            }}
          >
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

// ─── ColorField ───────────────────────────────────────────────────────────────

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
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <div
          className="relative shrink-0 rounded-xl overflow-hidden"
          style={{
            width: "2.25rem",
            height: "2.25rem",
            border: "1.5px solid var(--border-subtle)",
          }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label={label}
          />
          <div
            className="w-full h-full rounded-xl pointer-events-none"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...fieldInputFocusHandlers}
          className={`flex-1 ${fieldInputClass} font-mono`}
          style={fieldInputStyle}
        />
      </div>
      {description && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-ink)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
