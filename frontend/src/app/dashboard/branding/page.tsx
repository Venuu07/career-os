"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { ThemeConfig, CareersPageResponse, SectionConfig } from "@/lib/types";
import {
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  X,
} from "lucide-react";

// ─── Design tokens (mirrors CareerOS V1) ─────────────────────────────────────

const DEFAULTS: Required<ThemeConfig> = {
  primary_color: "#1E2330",
  accent_color: "#A9CBB7",
  background_color: "#F3F3F1",
  font_family: "",
  logo_url: "",
};

const FONT_OPTIONS = [
  { label: "System default", value: "" },
  { label: "Onest", value: "'Onest', sans-serif" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "DM Sans", value: "'DM Sans', sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function mergeTheme(raw: Record<string, unknown>): Required<ThemeConfig> {
  return {
    primary_color: (raw.primary_color as string) || DEFAULTS.primary_color,
    accent_color: (raw.accent_color as string) || DEFAULTS.accent_color,
    background_color: (raw.background_color as string) || DEFAULTS.background_color,
    font_family: (raw.font_family as string) || DEFAULTS.font_family,
    logo_url: (raw.logo_url as string) || DEFAULTS.logo_url,
  };
}

// ─── App Header ───────────────────────────────────────────────────────────────

function AppHeader({ companyName, onLogout }: { companyName?: string; onLogout: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex justify-center px-4 pt-4">
      <header
        className="w-full max-w-6xl flex items-center justify-between h-12 px-4 rounded-2xl backdrop-blur-md shadow-sm"
        style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--ink)" }}>
              <span className="text-white text-xs font-bold tracking-tight">C</span>
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: "var(--ink)" }}>CareerOS</span>
          </Link>
          {companyName && (
            <>
              <span style={{ color: "var(--border-subtle)" }} className="select-none">/</span>
              <span className="text-sm font-medium truncate max-w-36 hidden sm:block" style={{ color: "var(--muted-ink)" }}>{companyName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Dashboard</Link>
          <Link href="/dashboard/jobs" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Jobs</Link>
          <Link href="/dashboard/builder" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Builder</Link>
          <button onClick={onLogout} className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
    </div>
  );
}

// ─── ColorField ───────────────────────────────────────────────────────────────

function ColorField({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawHex, setRawHex] = useState(value);
  const syncedRef = useRef(value);

  // When the authoritative value changes (e.g. Reset button), update the text input.
  // Done via a ref comparison during render — safe because we only read syncedRef.current
  // and call setRawHex (which schedules a re-render, it does not setState synchronously).
  // eslint-disable-next-line react-hooks/refs
  if (syncedRef.current !== value) {
    // eslint-disable-next-line react-hooks/refs
    syncedRef.current = value;
    // Calling setState during render (before commit) is explicitly allowed by React
    // when the update is triggered by a prop change — this is the recommended
    // "getDerivedStateFromProps" pattern in function components.
    setRawHex(value);

  }

  function commitHex(v: string) {
    const trimmed = v.trim();
    if (isValidHex(trimmed)) onChange(trimmed);
  }

  const displayColor = isValidHex(rawHex) ? rawHex : value;

  return (
    <div className="flex items-start gap-4">
      {/* Swatch / picker */}
      <div className="shrink-0 mt-0.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-10 w-10 rounded-xl border-2 transition-all hover:scale-105"
          style={{ backgroundColor: displayColor, borderColor: "var(--border)" }}
          aria-label={`Pick ${label}`}
        />
        <input
          ref={inputRef}
          type="color"
          className="sr-only"
          value={displayColor}
          onChange={(e) => { setRawHex(e.target.value); onChange(e.target.value); }}
          aria-label={label}
        />
      </div>

      {/* Text info + hex input */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{label}</label>
          <input
            type="text"
            value={rawHex}
            onChange={(e) => setRawHex(e.target.value)}
            onBlur={(e) => commitHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitHex(rawHex); }}
            maxLength={7}
            className="w-24 h-7 px-2 rounded-lg text-xs font-mono border outline-none transition-all"
            style={{
              borderColor: isValidHex(rawHex) ? "var(--border)" : "#e04a00",
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
            }}
            aria-label={`Hex value for ${label}`}
          />
        </div>
        <p className="text-xs" style={{ color: "var(--muted-ink)" }}>{description}</p>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-ink)" }}>{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── Live Mini Preview ────────────────────────────────────────────────────────

function MiniPreview({ theme, companyName }: { theme: Required<ThemeConfig>; companyName: string }) {
  const fontStyle = theme.font_family ? { fontFamily: theme.font_family } : {};

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ backgroundColor: theme.background_color, borderColor: "var(--border)", ...fontStyle }}
    >
      {/* Nav bar */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${theme.primary_color}22` }}
      >
        <div className="flex items-center gap-2">
          {theme.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logo_url}
              alt="Logo"
              className="h-5 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="h-5 w-5 rounded flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: theme.primary_color, color: theme.background_color }}>
              {companyName[0] || "C"}
            </div>
          )}
          <span className="text-xs font-bold truncate max-w-24" style={{ color: theme.primary_color }}>{companyName}</span>
        </div>
        <div className="h-5 px-3 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: theme.primary_color, color: theme.background_color }}>
          Open roles
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 py-6">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: theme.accent_color }}>Careers</p>
        <h2 className="text-lg font-bold leading-tight mb-2" style={{ color: theme.primary_color }}>
          Build something great with us.
        </h2>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: theme.primary_color, opacity: 0.65 }}>
          We are looking for passionate people to join our mission.
        </p>
        <div
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ backgroundColor: theme.accent_color, color: theme.primary_color }}
        >
          See open roles →
        </div>
      </div>

      {/* Sample job row */}
      <div className="px-4 pb-4">
        <div
          className="rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: `${theme.primary_color}0d`, border: `1px solid ${theme.primary_color}18` }}
        >
          <div>
            <p className="text-xs font-semibold" style={{ color: theme.primary_color }}>Senior Frontend Engineer</p>
            <p className="text-xs" style={{ color: theme.primary_color, opacity: 0.55 }}>Engineering · Remote</p>
          </div>
          <div className="h-5 px-2.5 rounded-full text-xs font-semibold flex items-center" style={{ backgroundColor: `${theme.accent_color}33`, color: theme.primary_color }}>
            Open
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Save status indicator ────────────────────────────────────────────────────

function SaveStatus({ status }: { status: "idle" | "saving" | "saved" | "error" | "unsaved" }) {
  if (status === "saving") return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-ink)" }}>
      <Loader2 className="h-3.5 w-3.5 animate-spin" />Saving…
    </span>
  );
  if (status === "saved") return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: "#2d6e4f" }}>
      <CheckCircle2 className="h-3.5 w-3.5" />Saved to draft
    </span>
  );
  if (status === "error") return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: "#e04a00" }}>
      <AlertCircle className="h-3.5 w-3.5" />Save failed
    </span>
  );
  if (status === "unsaved") return (
    <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted-ink)" }}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#FF934F", display: "inline-block" }} />
      Unsaved changes
    </span>
  );
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrandingPage() {
  const { company, logout } = useAuth();
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // The current draft theme — what we're editing
  const [theme, setTheme] = useState<Required<ThemeConfig>>(DEFAULTS);
  // What the draft version originally had (for dirty detection)
  const [savedTheme, setSavedTheme] = useState<Required<ThemeConfig>>(DEFAULTS);
  // The sections — needed for PUT /draft (we always include them, unchanged)
  const [sections, setSections] = useState<SectionConfig[]>([]);

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "unsaved">("idle");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState("");

  // Logo URL error state
  const [logoError, setLogoError] = useState(false);

  const isDirty = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  // ── Load draft ──────────────────────────────────────────────────────────────
  const loadDraft = useCallback(async () => {
    setPageLoading(true);
    setFetchError("");
    try {
      const data: CareersPageResponse = await apiFetch("/api/career-page");
      const raw = (data.draft_version?.theme_config ?? {}) as Record<string, unknown>;
      const t = mergeTheme(raw);
      setTheme(t);
      setSavedTheme(t);
      setSections((data.draft_version?.sections_config as SectionConfig[]) ?? []);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to load branding settings.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() { await loadDraft(); }
    init();
  }, [loadDraft]);

  // Derive dirty state inline — no effect needed

  // ── Set a single theme field ─────────────────────────────────────────────
  function setField<K extends keyof Required<ThemeConfig>>(key: K, value: Required<ThemeConfig>[K]) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  // ── Save draft ───────────────────────────────────────────────────────────
  async function saveDraft() {
    setSaveStatus("saving");
    try {
      await apiFetch("/api/career-page/draft", {
        method: "PUT",
        body: JSON.stringify({
          sections_config: sections,
          theme_config: {
            primary_color: theme.primary_color || null,
            accent_color: theme.accent_color || null,
            background_color: theme.background_color || null,
            font_family: theme.font_family || null,
            logo_url: theme.logo_url || null,
          },
        }),
      });
      setSavedTheme(theme);
      setSaveStatus("saved");
      return true;
    } catch {
      setSaveStatus("error");
      return false;
    }
  }

  // ── Publish ──────────────────────────────────────────────────────────────
  async function handlePublish() {
    setIsPublishing(true);
    try {
      if (isDirty) {
        const ok = await saveDraft();
        if (!ok) { setIsPublishing(false); return; }
      }
      const result = await apiFetch("/api/career-page/publish", { method: "POST" });
      const slug = result?.slug || company?.slug || "";
      setPublishedSlug(slug);
      // Re-fetch to reflect the new published version
      await loadDraft();
    } catch {
      setSaveStatus("error");
    } finally {
      setIsPublishing(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--canvas)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "var(--ink)" }}>
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--muted-ink)" }} />
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
        <AppHeader companyName={company?.name} onLogout={() => { logout(); router.push("/login"); }} />
        <main className="max-w-2xl mx-auto px-4 py-20 text-center">
          <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>Failed to load branding settings</p>
          <p className="text-xs mb-5" style={{ color: "var(--muted-ink)" }}>{fetchError}</p>
          <button onClick={loadDraft} className="btn-pill btn-pill-primary px-5 py-2 text-sm inline-flex items-center gap-2 mx-auto">
            <RefreshCw className="h-3.5 w-3.5" />Try again
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
      <AppHeader companyName={company?.name} onLogout={() => { logout(); router.push("/login"); }} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted-ink)" }}>Branding</p>
            <h1 className="text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--ink)" }}>Theme & identity</h1>
            <p className="text-sm" style={{ color: "var(--muted-ink)" }}>
              Customize how your careers page looks. Changes flow through the builder to your published page.
            </p>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-3 shrink-0 mt-1">
            <SaveStatus status={isDirty && saveStatus !== "saving" && saveStatus !== "error" ? "unsaved" : saveStatus} />

            <button
              onClick={saveDraft}
              disabled={!isDirty || saveStatus === "saving"}
              className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-40 hover:opacity-80"
              style={{ borderColor: "var(--border)", color: "var(--ink)", backgroundColor: "var(--surface)" }}
            >
              Save draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="btn-pill btn-pill-primary px-5 py-2 text-sm disabled:opacity-50"
            >
              {isPublishing ? (
                <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" />Publishing…</span>
              ) : "Publish"}
            </button>
          </div>
        </div>

        {/* Published success banner */}
        {publishedSlug && (
          <div
            className="mb-6 px-5 py-3.5 rounded-2xl flex items-center justify-between"
            style={{ background: "rgba(169,203,183,0.2)", border: "1.5px solid #A9CBB7" }}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#2d6e4f" }} />
              <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                Theme published to <span className="font-bold">/{publishedSlug}/careers</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/${publishedSlug}/careers`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold hover:opacity-70" style={{ color: "var(--ink)" }}>
                <ExternalLink className="h-3.5 w-3.5" />View live
              </Link>
              <button onClick={() => setPublishedSlug("")} className="ml-2 hover:opacity-70" style={{ color: "var(--muted-ink)" }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* ── LEFT: settings ─────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Identity */}
            <Card title="Identity">
              <div className="space-y-5">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Logo URL</label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      className="flex-1 h-10 px-3 rounded-xl text-sm border outline-none transition-all"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--canvas)", color: "var(--ink)" }}
                      placeholder="https://example.com/logo.png"
                      value={theme.logo_url}
                      onChange={(e) => { setField("logo_url", e.target.value); setLogoError(false); }}
                    />
                    {theme.logo_url && (
                      <button
                        onClick={() => { setField("logo_url", ""); setLogoError(false); }}
                        className="h-10 w-10 rounded-xl flex items-center justify-center border transition-all hover:opacity-70"
                        style={{ borderColor: "var(--border)", color: "var(--muted-ink)" }}
                        aria-label="Remove logo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Logo preview */}
                  {theme.logo_url && (
                    <div
                      className="mt-3 p-4 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: "var(--canvas)", border: "1px solid var(--border)" }}
                    >
                      {logoError ? (
                        <div className="flex flex-col items-center gap-2">
                          <ImageIcon className="h-6 w-6" style={{ color: "var(--muted-ink)" }} />
                          <p className="text-xs" style={{ color: "var(--muted-ink)" }}>Could not load image</p>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={theme.logo_url}
                          alt="Logo preview"
                          className="max-h-12 max-w-full object-contain"
                          onError={() => setLogoError(true)}
                          onLoad={() => setLogoError(false)}
                        />
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-2" style={{ color: "var(--muted-ink)" }}>
                    Use a publicly accessible image URL. PNG or SVG with transparent background works best.
                  </p>
                </div>
              </div>
            </Card>

            {/* Colors */}
            <Card title="Colors">
              <div className="space-y-5">
                <ColorField
                  label="Primary"
                  description="Main brand color — used for headings, buttons, and UI chrome."
                  value={theme.primary_color}
                  onChange={(v) => setField("primary_color", v)}
                />
                <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
                <ColorField
                  label="Accent"
                  description="Secondary highlight color — used for CTAs, badges, and decorative elements."
                  value={theme.accent_color}
                  onChange={(v) => setField("accent_color", v)}
                />
                <div style={{ height: "1px", backgroundColor: "var(--border)" }} />
                <ColorField
                  label="Background"
                  description="Page canvas color — applied to the hero and page backgrounds."
                  value={theme.background_color}
                  onChange={(v) => setField("background_color", v)}
                />
              </div>
            </Card>

            {/* Typography */}
            <Card title="Typography">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>Font family</label>
                <select
                  className="w-full h-10 px-3 rounded-xl text-sm border outline-none appearance-none transition-all"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--canvas)", color: "var(--ink)" }}
                  value={theme.font_family}
                  onChange={(e) => setField("font_family", e.target.value)}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <p className="text-xs mt-2" style={{ color: "var(--muted-ink)" }}>
                  Applied to the public careers page. The builder uses Onest by default.
                </p>
              </div>
            </Card>

            {/* Builder integration note */}
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: "rgba(169,203,183,0.12)", border: "1.5px solid rgba(169,203,183,0.4)" }}
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#2d6e4f" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>Synced with builder</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>
                  Theme changes saved here flow directly into the career page builder.{" "}
                  <Link href="/dashboard/builder" className="underline underline-offset-2 hover:opacity-70" style={{ color: "var(--ink)" }}>
                    Open builder →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: live preview ──────────────────────────────────────── */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--muted-ink)" }}>Live preview</p>
              <MiniPreview theme={theme} companyName={company?.name || "Your Company"} />
            </div>

            {/* Current state info */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-ink)" }}>Current theme values</p>
              {[
                { label: "Primary", key: "primary_color" },
                { label: "Accent", key: "accent_color" },
                { label: "Background", key: "background_color" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--muted-ink)" }}>{label}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: theme[key as keyof typeof theme] as string, borderColor: "var(--border)" }}
                    />
                    <span className="text-xs font-mono" style={{ color: "var(--ink)" }}>
                      {theme[key as keyof typeof theme] as string}
                    </span>
                  </div>
                </div>
              ))}
              {theme.font_family && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--muted-ink)" }}>Font</span>
                  <span className="text-xs" style={{ color: "var(--ink)" }}>
                    {FONT_OPTIONS.find(f => f.value === theme.font_family)?.label ?? theme.font_family}
                  </span>
                </div>
              )}

              <div style={{ height: "1px", backgroundColor: "var(--border)" }} />

              {/* Reset to defaults */}
              <button
                onClick={() => {
                  setTheme(DEFAULTS);
                }}
                className="w-full text-xs font-medium py-2 rounded-xl border transition-all hover:opacity-70"
                style={{ borderColor: "var(--border)", color: "var(--muted-ink)" }}
              >
                Reset to defaults
              </button>
            </div>

            {/* Public page link */}
            {company?.slug && (
              <Link
                href={`/${company.slug}/careers`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl border transition-all hover:opacity-70"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>View published page</span>
                <ExternalLink className="h-3.5 w-3.5" style={{ color: "var(--muted-ink)" }} />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
