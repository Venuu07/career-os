"use client";

/**
 * AIAssistPanel — Reusable AI Career Copy Assistant panel.
 *
 * Designed to slot into any section Inspector without changing the existing
 * data flow. When the recruiter clicks "Use this", we call onApply() with the
 * generated fields — the caller updates local Builder state via updateData().
 * Nothing is saved or published here.
 *
 * Architecture constraints (from AGENTS.md):
 *   - Never auto-save or auto-publish.
 *   - Never expose GEMINI_API_KEY to the browser.
 *   - All Gemini calls go through backend POST /api/ai/career-copy.
 *   - Company name comes from the auth session (AuthContext), never from props.
 *   - This component owns NO state beyond UI transience (loading, result, error).
 *
 * Usage:
 *   <AIAssistPanel
 *     contentType="hero"
 *     context={{ headline: "...", description: "..." }}
 *     onApply={(result) => updateData({ ...data, headline: result.headline, ... })}
 *   />
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { Sparkles, Loader2, RotateCcw, Check, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AIContentType = "hero" | "about" | "culture" | "job_description";

export type AITone = "professional" | "friendly" | "bold" | "minimal";

const TONES: { value: AITone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly",     label: "Friendly"     },
  { value: "bold",         label: "Bold"          },
  { value: "minimal",      label: "Minimal"       },
];

export interface AIGeneratedResult {
  content_type: string;
  // Hero
  headline?: string | null;
  description?: string | null;
  cta?: string | null;
  // About
  body?: string | null;
  // Culture
  intro?: string | null;
  values?: { title: string; description: string }[] | null;
}

export interface AIAssistPanelProps {
  contentType: AIContentType;
  /** Context fields already present in the inspector — sent as-is to the backend. */
  context: Record<string, string | undefined | null>;
  /**
   * Called ONLY when the recruiter explicitly clicks "Use this".
   * The caller should merge the result into local Builder state via updateData().
   */
  onApply: (result: AIGeneratedResult) => void;
}

// ─── HTTP error helper ────────────────────────────────────────────────────────

function httpErrorMessage(status: number | undefined): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 422) return "Invalid request. Please check your content and try again.";
  if (status === 503) return "AI assistance is currently unavailable. You can continue editing manually.";
  return "We couldn't generate copy right now. Please try again.";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AIAssistPanel({ contentType, context, onApply }: AIAssistPanelProps) {
  useAuth(); // ensures auth context is present; company resolved server-side from cookie

  const [open, setOpen]       = useState(false);
  const [tone, setTone]       = useState<AITone>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [result, setResult]   = useState<AIGeneratedResult | null>(null);

  // Editable preview fields (recruiter can tweak before accepting)
  const [editHeadline,    setEditHeadline]    = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCta,         setEditCta]         = useState("");
  const [editBody,        setEditBody]        = useState("");
  // Culture
  const [editIntro,       setEditIntro]       = useState("");
  // Job Description
  const [editJobDesc,     setEditJobDesc]     = useState("");

  const reset = () => {
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiFetch("/api/ai/career-copy", {
        method: "POST",
        body: JSON.stringify({
          content_type: contentType,
          tone,
          context: {
            ...context,
            // company_name is intentionally NOT sent — backend resolves from auth session
          },
        }),
      });

      if (!data) throw new Error("Empty response");

      // Lightweight frontend validation
      if (contentType === "hero" && !data.headline) throw new Error("AI returned empty headline.");
      if (contentType === "about" && !data.body) throw new Error("AI returned empty body.");
      if (contentType === "culture" && !data.headline && !data.intro) throw new Error("AI returned empty culture copy.");
      if (contentType === "job_description" && !data.description) throw new Error("AI returned empty job description.");

      setResult(data as AIGeneratedResult);

      // Seed editable fields
      setEditHeadline(data.headline ?? "");
      setEditDescription(data.description ?? "");
      setEditCta(data.cta ?? "");
      setEditBody(data.body ?? "");
      setEditIntro(data.intro ?? "");
      setEditJobDesc(data.description ?? "");
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      setError(httpErrorMessage(status));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    // Build an edited result from the recruiter's edited fields
    const applied: AIGeneratedResult = {
      ...result,
      headline:    editHeadline    || result.headline    || undefined,
      description: (contentType === "job_description" ? editJobDesc : editDescription)
                    || result.description || undefined,
      cta:         editCta         || result.cta         || undefined,
      body:        editBody        || result.body        || undefined,
      intro:       editIntro       || result.intro       || undefined,
    };
    onApply(applied);
    handleClose();
  };

  // ── Trigger button ─────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
        style={{
          backgroundColor: "var(--canvas)",
          border: "1.5px dashed var(--border-subtle)",
          color: "var(--muted-ink)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--green)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--ink)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--muted-ink)";
        }}
        aria-label="Open AI copy assistant"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Generate with AI
      </button>
    );
  }

  // ── Expanded panel ────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        border: "1.5px solid var(--border-subtle)",
        backgroundColor: "var(--canvas)",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--green)" }} aria-hidden="true" />
          <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>
            AI Career Assistant
          </span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="rounded-lg p-1 transition-colors hover:opacity-60"
          aria-label="Close AI assistant"
        >
          <X className="h-3.5 w-3.5" style={{ color: "var(--muted-ink)" }} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Tone selector */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--muted-ink)" }}>
            Tone
          </label>
          <div
            className="flex p-0.5 rounded-xl gap-0.5"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {TONES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                disabled={loading}
                className="flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition-all"
                style={{
                  backgroundColor: tone === t.value ? "var(--canvas)" : "transparent",
                  color: tone === t.value ? "var(--ink)" : "var(--muted-ink)",
                  boxShadow: tone === t.value ? "0 1px 3px rgba(30,35,48,0.08)" : "none",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context preview (read-only) — shows recruiter what we're sending */}
        {!result && !loading && (
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--muted-ink)" }}>
              Using your existing content
            </label>
            <div
              className="rounded-xl px-3 py-2.5 text-xs leading-relaxed"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-subtle)",
                color: "var(--muted-ink)",
              }}
            >
              {Object.entries(context)
                .filter(([, v]) => v)
                .slice(0, 2)
                .map(([k, v]) => (
                  <p key={k} className="truncate">
                    <span className="font-semibold capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                    {String(v).slice(0, 80)}{String(v).length > 80 ? "…" : ""}
                  </p>
                ))}
              {Object.values(context).filter(Boolean).length === 0 && (
                <p className="italic">No existing content — AI will generate from scratch.</p>
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-6">
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--green)" }} />
            <span className="text-xs" style={{ color: "var(--muted-ink)" }}>Generating…</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div
            className="rounded-xl px-3 py-3 text-xs leading-relaxed"
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#DC2626",
            }}
          >
            {error}
          </div>
        )}

        {/* Generated result — editable before accept */}
        {result && !loading && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--border-subtle)" }}
              />
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--green)" }}>
                AI suggestion
              </span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "var(--border-subtle)" }}
              />
            </div>

            {/* Hero: headline + description + cta */}
            {contentType === "hero" && (
              <div className="space-y-2.5">
                {result.headline !== undefined && (
                  <EditableField
                    label="Headline"
                    value={editHeadline}
                    onChange={setEditHeadline}
                    rows={2}
                  />
                )}
                {result.description !== undefined && (
                  <EditableField
                    label="Subheadline"
                    value={editDescription}
                    onChange={setEditDescription}
                    rows={3}
                  />
                )}
                {result.cta !== undefined && result.cta && (
                  <EditableField
                    label="CTA text"
                    value={editCta}
                    onChange={setEditCta}
                    rows={1}
                  />
                )}
              </div>
            )}

            {/* About: headline + body */}
            {contentType === "about" && (
              <div className="space-y-2.5">
                {result.headline !== undefined && (
                  <EditableField
                    label="Title"
                    value={editHeadline}
                    onChange={setEditHeadline}
                    rows={1}
                  />
                )}
                {result.body !== undefined && (
                  <EditableField
                    label="Content"
                    value={editBody}
                    onChange={setEditBody}
                    rows={5}
                  />
                )}
              </div>
            )}

            {/* Culture: headline + intro (values are read-only preview) */}
            {contentType === "culture" && (
              <div className="space-y-2.5">
                {result.headline !== undefined && (
                  <EditableField
                    label="Section title"
                    value={editHeadline}
                    onChange={setEditHeadline}
                    rows={1}
                  />
                )}
                {result.intro !== undefined && (
                  <EditableField
                    label="Introduction"
                    value={editIntro}
                    onChange={setEditIntro}
                    rows={3}
                  />
                )}
                {result.values && result.values.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-ink)" }}>
                      Values preview
                    </p>
                    <div className="space-y-1.5">
                      {result.values.slice(0, 4).map((v, i) => (
                        <div
                          key={i}
                          className="rounded-lg px-2.5 py-2 text-xs"
                          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }}
                        >
                          <span className="font-semibold" style={{ color: "var(--ink)" }}>{v.title}</span>
                          {v.description && (
                            <span style={{ color: "var(--muted-ink)" }}> — {v.description.slice(0, 60)}{v.description.length > 60 ? "…" : ""}</span>
                          )}
                        </div>
                      ))}
                      {result.values.length > 4 && (
                        <p className="text-[10px]" style={{ color: "var(--muted-ink)" }}>+{result.values.length - 4} more values</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Job Description: single editable textarea */}
            {contentType === "job_description" && (
              <div>
                <EditableField
                  label="Job description"
                  value={editJobDesc}
                  onChange={setEditJobDesc}
                  rows={7}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleApply}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                style={{
                  backgroundColor: "var(--ink)",
                  color: "var(--canvas)",
                }}
              >
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Use this
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={loading}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-70"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--muted-ink)",
                }}
                aria-label="Regenerate"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Regenerate
              </button>
            </div>

            <p className="text-[10px] text-center leading-relaxed" style={{ color: "var(--muted-ink)", opacity: 0.7 }}>
              Generated from your workspace. Review before saving.
            </p>
          </div>
        )}

        {/* Generate / Retry button — shown when no result yet */}
        {!result && !loading && (
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--canvas)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {error ? "Try again" : "Generate ✨"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── EditableField ─────────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-ink)" }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 text-xs rounded-xl resize-none outline-none transition-all"
        style={{
          backgroundColor: "var(--surface)",
          border: "1.5px solid var(--border-subtle)",
          color: "var(--ink)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--green)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--green-bg)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-subtle)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
