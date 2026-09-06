"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SectionConfig, CareersPageResponse, JobResponse } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import {
  LayoutTemplate,
  ExternalLink,
  CheckCircle2,
  CircleDashed,
  Briefcase,
  Eye,
  LogOut,
  Globe,
  ArrowRight,
  Pencil,
  Sparkles,
} from "lucide-react";

// ─── Shared Header ────────────────────────────────────────────────────────────

function AppHeader({
  companyName,
  onLogout,
}: {
  companyName?: string;
  onLogout: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 flex justify-center px-4 pt-4">
      <header
        className="w-full max-w-5xl flex items-center justify-between h-12 px-4 rounded-2xl backdrop-blur-md shadow-sm"
        style={{
          backgroundColor: "rgba(255,255,255,0.92)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0 transition-opacity group-hover:opacity-80"
              style={{ backgroundColor: "var(--ink)" }}
            >
              <span className="text-white text-xs font-bold tracking-tight">C</span>
            </div>
            <span
              className="font-bold text-sm tracking-tight"
              style={{ color: "var(--ink)" }}
            >
              CareerOS
            </span>
          </Link>
          {companyName && (
            <>
              <span style={{ color: "var(--border-subtle)" }} className="select-none">
                /
              </span>
              <span
                className="text-sm font-medium truncate max-w-36 hidden sm:block"
                style={{ color: "var(--muted-ink)" }}
              >
                {companyName}
              </span>
            </>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/jobs"
            className="btn-pill text-xs px-3 py-1.5 hidden sm:inline-flex"
            style={{ color: "var(--muted-ink)" }}
          >
            <Briefcase className="h-3 w-3" /> Jobs
          </Link>
          <Link
            href="/dashboard/branding"
            className="btn-pill text-xs px-3 py-1.5 hidden sm:inline-flex"
            style={{ color: "var(--muted-ink)" }}
          >
            Branding
          </Link>
          <Link
            href="/dashboard/builder"
            className="btn-pill btn-pill-primary text-xs px-3 py-1.5 hidden sm:inline-flex"
          >
            <Pencil className="h-3 w-3" /> Edit Page
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70"
            style={{ color: "var(--muted-ink)" }}
            aria-label="Log out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, company, logout, isLoading: authLoading } = useAuth();
  const [pageData, setPageData] = useState<CareersPageResponse | null>(null);
  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    async function load() {
      try {
        const [pd, jd] = await Promise.all([
          apiFetch("/api/career-page"),
          apiFetch("/api/jobs"),
        ]);
        setPageData(pd);
        setJobs(Array.isArray(jd) ? jd : []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data."
        );
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [authLoading]);

  const isPublished = !!pageData?.published_version;
  const draftVersion = pageData?.draft_version;
  const sections: SectionConfig[] = draftVersion?.sections_config || [];
  const openJobs = jobs.filter((j) => j.status === "open");

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  const checklist = [
    { label: "Hero section added", done: sections.some((s) => s.type === "hero") },
    { label: "Company story added", done: sections.some((s) => s.type === "about") },
    { label: "Jobs posted", done: jobs.length > 0 },
    { label: "Page published", done: isPublished },
  ];
  const completedCount = checklist.filter((i) => i.done).length;
  const readiness = Math.round((completedCount / checklist.length) * 100);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-canvas">
        <AppHeader
          companyName={company?.name}
          onLogout={logout}
        />
        <main className="max-w-5xl mx-auto px-4 pt-10 pb-16 space-y-6">
          <div className="animate-pulse space-y-4">
            <div
              className="h-8 w-52 rounded-xl"
              style={{ backgroundColor: "var(--border-subtle)" }}
            />
            <div
              className="h-4 w-36 rounded-lg"
              style={{ backgroundColor: "var(--border-subtle)", opacity: 0.6 }}
            />
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen bg-canvas">
        <AppHeader
          companyName={company?.name}
          onLogout={logout}
        />
        <main className="flex-1 flex items-center justify-center p-10">
          <div className="text-center max-w-sm">
            <div
              className="h-12 w-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--orange-bg)", color: "var(--orange)" }}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="font-medium mb-1" style={{ color: "var(--ink)" }}>
              Something went wrong
            </p>
            <p className="text-sm mb-4" style={{ color: "var(--muted-ink)" }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-pill btn-pill-ghost text-sm"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader
        companyName={company?.name}
        onLogout={logout}
      />

      <main className="max-w-5xl mx-auto px-4 pt-8 pb-20">
        {/* ── Greeting ──────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-base" style={{ color: "var(--muted-ink)" }}>
            {company?.name
              ? `Here's the state of ${company.name}'s careers page.`
              : "Here's the state of your careers page."}
          </p>
        </div>

        {/* ── Primary surface — Careers Page Card ──────────────────────── */}
        <div
          className="rounded-3xl p-7 mb-5 relative overflow-hidden"
          style={{
            background:
              isPublished
                ? "linear-gradient(135deg, var(--green-bg) 0%, var(--surface) 70%)"
                : "var(--surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {/* Decorative accent blob */}
          {isPublished && (
            <div
              className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{ backgroundColor: "var(--green)" }}
            />
          )}

          <div className="relative">
            {/* Row 1: title + status */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isPublished ? "var(--green-bg)" : "var(--canvas)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <LayoutTemplate
                    className="h-5 w-5"
                    style={{ color: isPublished ? "var(--green)" : "var(--muted-ink)" }}
                  />
                </div>
                <div>
                  <p className="text-xs text-eyebrow mb-0.5" style={{ color: "var(--muted-ink)" }}>
                    Careers Page
                  </p>
                  <p className="font-semibold text-base" style={{ color: "var(--ink)" }}>
                    {company?.name || "Your Company"}
                  </p>
                </div>
              </div>
              <PageStatusBadge published={isPublished} />
            </div>

            {/* Row 2: stats strip */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <StatTile
                label="Sections"
                value={sections.length.toString()}
                sub={sections.length === 0 ? "none yet" : "configured"}
              />
              <StatTile
                label="Open Roles"
                value={openJobs.length.toString()}
                sub={openJobs.length === 1 ? "position" : "positions"}
                accent={openJobs.length > 0}
              />
              <StatTile
                label="Status"
                value={isPublished ? "Live" : "Draft"}
                sub={isPublished ? "visible to candidates" : "not yet published"}
                accent={isPublished}
              />
            </div>

            {/* Public URL */}
            {isPublished && company?.slug && (
              <div
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-5 text-sm font-mono truncate"
                style={{
                  background: "var(--green-bg)",
                  border: "1px solid var(--green)",
                  color: "var(--muted-ink)",
                }}
              >
                <Globe className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span className="truncate">
                  /{company.slug}/careers
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/dashboard/builder"
                className="btn-pill btn-pill-primary text-sm px-5 py-2.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Page
              </Link>
              <Link
                href="/dashboard/builder"
                className="btn-pill btn-pill-ghost text-sm px-5 py-2.5"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Link>
              {isPublished && company?.slug && (
                <a
                  href={`/${company.slug}/careers`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill btn-pill-ghost text-sm px-5 py-2.5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Live
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Bottom grid: Readiness + Jobs ─────────────────────────────── */}
        <div className="grid md:grid-cols-5 gap-5">
          {/* Readiness checklist */}
          <div
            className="md:col-span-2 rounded-3xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>
                Page readiness
              </p>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: readiness === 100 ? "var(--green)" : "var(--ink)" }}
              >
                {readiness}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-1.5 rounded-full mb-5 overflow-hidden"
              style={{ backgroundColor: "var(--canvas)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${readiness}%`,
                  backgroundColor: readiness === 100 ? "var(--green)" : "var(--ink)",
                }}
              />
            </div>

            {/* Checklist */}
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  {item.done ? (
                    <CheckCircle2
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--green)" }}
                    />
                  ) : (
                    <CircleDashed
                      className="h-4 w-4 shrink-0"
                      style={{ color: "var(--border-subtle)" }}
                    />
                  )}
                  <span
                    style={{
                      color: item.done ? "var(--ink)" : "var(--muted-ink)",
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {readiness < 100 && (
              <Link
                href="/dashboard/builder"
                className="mt-5 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--ink)" }}
              >
                Continue building <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {/* Jobs panel */}
          <div
            className="md:col-span-3 rounded-3xl overflow-hidden"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="h-7 w-7 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--lavender-bg)" }}
                >
                  <Briefcase
                    className="h-3.5 w-3.5"
                    style={{ color: "var(--lavender)" }}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    Open Roles
                  </p>
                </div>
              </div>
              {openJobs.length > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--green-bg)",
                    color: "var(--ink)",
                  }}
                >
                  {openJobs.length} active
                </span>
              )}
            </div>

            {/* Body */}
            {jobs.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center px-6">
                <div
                  className="h-12 w-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{
                    backgroundColor: "var(--canvas)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <Briefcase
                    className="h-5 w-5"
                    style={{ color: "var(--muted-ink)" }}
                  />
                </div>
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--ink)" }}
                >
                  No open roles yet
                </p>
                <p
                  className="text-sm leading-relaxed max-w-xs"
                  style={{ color: "var(--muted-ink)" }}
                >
                  Add jobs from the builder&apos;s Open Roles section. They&apos;ll appear
                  automatically on your careers page.
                </p>
                <Link
                  href="/dashboard/builder"
                  className="btn-pill btn-pill-ghost text-sm mt-5 px-5 py-2"
                >
                  Open Builder <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <ul>
                {jobs.slice(0, 6).map((job, i) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-canvas"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--border-subtle)" : undefined,
                    }}
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--ink)" }}
                      >
                        {job.title}
                      </p>
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{ color: "var(--muted-ink)" }}
                      >
                        {[job.department, job.location, job.job_type?.replace(/_/g, " ")]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <JobStatusPill status={job.status} />
                  </li>
                ))}
                {jobs.length > 6 && (
                  <li
                    className="px-6 py-3 text-xs text-center"
                    style={{
                      borderTop: "1px solid var(--border-subtle)",
                      color: "var(--muted-ink)",
                    }}
                  >
                    +{jobs.length - 6} more roles
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: accent ? "var(--green-bg)" : "var(--canvas)",
        border: `1px solid ${accent ? "var(--green)" : "var(--border-subtle)"}`,
      }}
    >
      <p className="text-xs mb-1.5" style={{ color: "var(--muted-ink)" }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold tracking-tight tabular-nums"
        style={{ color: accent ? "var(--ink)" : "var(--ink)" }}
      >
        {value}
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>
        {sub}
      </p>
    </div>
  );
}

function PageStatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={
        published
          ? {
              background: "var(--green-bg)",
              color: "var(--ink)",
              border: "1.5px solid var(--green)",
            }
          : {
              background: "var(--canvas)",
              color: "var(--muted-ink)",
              border: "1.5px solid var(--border-subtle)",
            }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: published ? "var(--green)" : "var(--muted-ink)" }}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function JobStatusPill({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    open: { bg: "var(--green-bg)", color: "var(--ink)" },
    draft: { bg: "var(--canvas)", color: "var(--muted-ink)" },
    closed: { bg: "var(--orange-bg)", color: "var(--orange)" },
  };
  const s = styles[status] ?? styles.draft;
  return (
    <span
      className="shrink-0 ml-3 text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
