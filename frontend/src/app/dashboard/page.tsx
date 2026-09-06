"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SectionConfig, CareersPageResponse, JobResponse, ThemeConfig } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import {
  LayoutTemplate,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Eye,
  LogOut,
  Globe,
  ArrowRight,
  Pencil,
  Sparkles,
  Search,
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

// ─── Quality Score Engine ─────────────────────────────────────────────────────

interface QualityCheck {
  category: "content" | "jobs" | "branding" | "seo";
  label: string;
  passed: boolean;
  points: number;
  action?: string;
  actionHref?: string;
}

interface QualityResult {
  score: number;
  checks: QualityCheck[];
  grade: string;
  summary: string;
}

function computeQuality(
  sections: SectionConfig[],
  theme: ThemeConfig | undefined,
  jobs: JobResponse[],
  pageData: CareersPageResponse | null
): QualityResult {
  const checks: QualityCheck[] = [];
  const draftVersion = pageData?.draft_version;

  // ── CONTENT ────────────────────────────────────────────────────────────────
  const heroSection = sections.find((s) => s.type === "hero" && s.visible);
  const hasHeroContent = !!(heroSection?.data?.headline || heroSection?.data?.title);
  checks.push({
    category: "content",
    label: "Hero headline configured",
    passed: hasHeroContent,
    points: 15,
    action: hasHeroContent ? undefined : "Add a compelling headline to your hero section",
    actionHref: "/dashboard/builder",
  });

  const aboutSection = sections.find((s) => s.type === "about" && s.visible);
  checks.push({
    category: "content",
    label: "About / company story section",
    passed: !!aboutSection,
    points: 10,
    action: aboutSection ? undefined : "Add an About section to tell your story",
    actionHref: "/dashboard/builder",
  });

  const aboutHasImage = !!(aboutSection?.data?.imageUrl);
  checks.push({
    category: "content",
    label: "About section has an image",
    passed: aboutHasImage,
    points: 5,
    action: aboutHasImage ? undefined : "Add a team photo or office image to your About section",
    actionHref: "/dashboard/builder",
  });

  const hasCultureOrBenefits = sections.some(
    (s) => (s.type === "culture" || s.type === "benefits") && s.visible
  );
  checks.push({
    category: "content",
    label: "Culture or Benefits section",
    passed: hasCultureOrBenefits,
    points: 10,
    action: hasCultureOrBenefits ? undefined : "Add a Culture or Benefits section to attract candidates",
    actionHref: "/dashboard/builder",
  });

  const videoSection = sections.find((s) => s.type === "video" && s.visible);
  const videoHasMedia = !!(videoSection?.data?.videoUrl);
  if (videoSection) {
    checks.push({
      category: "content",
      label: "Video section has media",
      passed: videoHasMedia,
      points: 5,
      action: videoHasMedia ? undefined : "Add a video URL to your Video section",
      actionHref: "/dashboard/builder",
    });
  }

  // ── JOBS ───────────────────────────────────────────────────────────────────
  const openJobs = jobs.filter((j) => j.status === "open");
  checks.push({
    category: "jobs",
    label: "Open roles published",
    passed: openJobs.length > 0,
    points: 10,
    action: openJobs.length > 0 ? undefined : "Publish at least one open role",
    actionHref: "/dashboard/jobs",
  });

  const jobsWithLocation = openJobs.filter((j) => j.location).length;
  const allJobsHaveLocation = openJobs.length > 0 && jobsWithLocation === openJobs.length;
  checks.push({
    category: "jobs",
    label: "All open roles have a location",
    passed: allJobsHaveLocation,
    points: 5,
    action: allJobsHaveLocation
      ? undefined
      : `Add locations to ${openJobs.length - jobsWithLocation} open role${openJobs.length - jobsWithLocation !== 1 ? "s" : ""}`,
    actionHref: "/dashboard/jobs",
  });

  const jobsWithAppUrl = openJobs.filter((j) => j.application_url).length;
  const incompleteJobs = openJobs.length - jobsWithAppUrl;
  checks.push({
    category: "jobs",
    label: "Open roles have application links",
    passed: incompleteJobs === 0 && openJobs.length > 0,
    points: 5,
    action:
      incompleteJobs === 0
        ? undefined
        : `Add application URLs to ${incompleteJobs} role${incompleteJobs !== 1 ? "s" : ""}`,
    actionHref: "/dashboard/jobs",
  });

  // ── BRANDING ───────────────────────────────────────────────────────────────
  const hasLogo = !!(theme?.logo_url);
  checks.push({
    category: "branding",
    label: "Logo configured",
    passed: hasLogo,
    points: 10,
    action: hasLogo ? undefined : "Add your company logo in Branding settings",
    actionHref: "/dashboard/branding",
  });

  const hasCustomColor =
    !!(theme?.primary_color && theme.primary_color !== "#1E2330") ||
    !!(theme?.accent_color && theme.accent_color !== "#A9CBB7");
  checks.push({
    category: "branding",
    label: "Brand colors customized",
    passed: hasCustomColor,
    points: 5,
    action: hasCustomColor ? undefined : "Set your primary and accent colors in Branding",
    actionHref: "/dashboard/branding",
  });

  const hasFont = !!(theme?.font_family);
  checks.push({
    category: "branding",
    label: "Custom typography set",
    passed: hasFont,
    points: 5,
    action: hasFont ? undefined : "Choose a brand font in Branding settings",
    actionHref: "/dashboard/branding",
  });

  // ── SEO ────────────────────────────────────────────────────────────────────
  const hasTitle = !!(draftVersion && pageData?.title);
  checks.push({
    category: "seo",
    label: "Page title configured",
    passed: hasTitle,
    points: 5,
    action: hasTitle ? undefined : "Set a page title in the builder settings",
    actionHref: "/dashboard/builder",
  });

  const hasMetaDesc = !!(pageData?.meta_description);
  checks.push({
    category: "seo",
    label: "Meta description configured",
    passed: hasMetaDesc,
    points: 10,
    action: hasMetaDesc ? undefined : "Add a meta description for better search visibility",
    actionHref: "/dashboard/builder",
  });

  const isPublished = !!(pageData?.published_version);
  checks.push({
    category: "seo",
    label: "Page published and crawlable",
    passed: isPublished,
    points: 0,
    action: isPublished ? undefined : "Publish your careers page to make it discoverable",
    actionHref: "/dashboard/builder",
  });

  // Compute score
  const maxPoints = checks.reduce((acc, c) => acc + c.points, 0);
  const earned = checks.filter((c) => c.passed).reduce((acc, c) => acc + c.points, 0);
  const score = Math.min(100, Math.round((earned / maxPoints) * 100));

  const grade =
    score >= 90 ? "Excellent" :
    score >= 75 ? "Great foundation" :
    score >= 55 ? "Getting there" :
    score >= 35 ? "Needs attention" :
    "Just getting started";

  const failedChecks = checks.filter((c) => !c.passed && c.action);
  const summary =
    failedChecks.length === 0
      ? "Your careers page looks great. Keep your roles fresh!"
      : failedChecks.length === 1
      ? failedChecks[0].action!
      : `${failedChecks[0].action} — plus ${failedChecks.length - 1} more improvement${failedChecks.length > 2 ? "s" : ""}.`;

  return { score, checks, grade, summary };
}

// ─── Quality Score Panel ──────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  content: "Content",
  jobs: "Jobs",
  branding: "Branding",
  seo: "SEO",
};

function QualityScorePanel({
  sections,
  theme,
  jobs,
  pageData,
}: {
  sections: SectionConfig[];
  theme: ThemeConfig | undefined;
  jobs: JobResponse[];
  pageData: CareersPageResponse | null;
}) {
  const { score, checks, grade, summary } = computeQuality(sections, theme, jobs, pageData);

  const categories = ["content", "jobs", "branding", "seo"] as const;
  const scoreColor =
    score >= 80 ? "#2d6e4f" :
    score >= 55 ? "var(--ink)" :
    "#e04a00";

  const barColor =
    score >= 80 ? "var(--green)" :
    score >= 55 ? "var(--ink)" :
    "#FF934F";

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-start justify-between" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted-ink)" }}>
            Page Quality
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tabular-nums tracking-tight" style={{ color: scoreColor }}>
              {score}
            </span>
            <span className="text-lg font-semibold" style={{ color: "var(--muted-ink)" }}>/&nbsp;100</span>
          </div>
          <p className="text-sm font-medium mt-0.5" style={{ color: "var(--muted-ink)" }}>{grade}</p>
        </div>
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: score >= 80 ? "rgba(169,203,183,0.18)" : "var(--canvas)" }}
        >
          <Sparkles className="h-4 w-4" style={{ color: score >= 80 ? "#2d6e4f" : "var(--muted-ink)" }} />
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4 pb-1">
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--canvas)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: barColor }}
          />
        </div>
        {summary && (
          <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted-ink)" }}>{summary}</p>
        )}
      </div>

      {/* Check categories */}
      <div className="px-6 pb-5 pt-3 space-y-4">
        {categories.map((cat) => {
          const catChecks = checks.filter((c) => c.category === cat);
          if (catChecks.length === 0) return null;
          return (
            <div key={cat}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--muted-ink)" }}>
                {CATEGORY_LABELS[cat]}
              </p>
              <ul className="space-y-1.5">
                {catChecks.map((check) => (
                  <li key={check.label} className="flex items-start gap-2.5">
                    {check.passed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "var(--green)" }} />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "#FF934F" }} />
                    )}
                    <span className="text-xs flex-1 leading-relaxed" style={{ color: check.passed ? "var(--ink)" : "var(--muted-ink)" }}>
                      {check.passed ? check.label : check.action}
                    </span>
                    {!check.passed && check.actionHref && (
                      <Link
                        href={check.actionHref}
                        className="shrink-0 text-xs font-semibold hover:opacity-70 transition-opacity"
                        style={{ color: "var(--ink)" }}
                      >
                        Fix →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SEO Preview Panel ────────────────────────────────────────────────────────

function SEOPreviewPanel({
  pageData,
  companySlug,
  openJobCount,
}: {
  pageData: CareersPageResponse | null;
  companySlug: string | undefined;
  openJobCount: number;
}) {
  const title = pageData?.title || (companySlug ? `${companySlug} Careers` : "Careers Page");
  const url = companySlug ? `careeros.app/${companySlug}/careers` : "yourcompany/careers";
  const description =
    pageData?.meta_description ||
    (companySlug && openJobCount > 0
      ? `Join us. Browse ${openJobCount} open role${openJobCount !== 1 ? "s" : ""} and learn about our culture.`
      : null);

  const hasTitle = !!pageData?.title;
  const hasDesc = !!pageData?.meta_description;
  const isPublished = !!pageData?.published_version;

  const seoChecks = [
    { label: "Page title", ok: hasTitle, fix: "Add a title", href: "/dashboard/builder" },
    { label: "Meta description", ok: hasDesc, fix: "Add a description", href: "/dashboard/builder" },
    { label: "Crawlable (published)", ok: isPublished, fix: "Publish your page", href: "/dashboard/builder" },
    { label: "JobPosting structured data", ok: isPublished && openJobCount > 0, fix: "Publish with open jobs", href: "/dashboard/jobs" },
  ];

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "var(--surface)", border: "1px solid var(--border-subtle)" }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Search className="h-3.5 w-3.5" style={{ color: "var(--muted-ink)" }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--muted-ink)" }}>
          SEO Preview
        </p>
        <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "var(--canvas)", color: "var(--muted-ink)" }}>
          Preview only — not a ranking signal
        </span>
      </div>

      <div className="px-6 py-5">
        {/* Google result mock */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ backgroundColor: "var(--canvas)", border: "1px solid var(--border-subtle)" }}
        >
          {/* Favicon + URL row */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
            >
              C
            </div>
            <span className="text-xs truncate" style={{ color: "var(--muted-ink)" }}>{url}</span>
            <span className="text-xs ml-1" style={{ color: "var(--muted-ink)", opacity: 0.5 }}>▾</span>
          </div>
          {/* Title */}
          <p className="text-base font-semibold leading-tight mb-1" style={{ color: "#1a0dab" }}>
            {title}
          </p>
          {/* Description */}
          {description ? (
            <p className="text-sm leading-relaxed" style={{ color: "#4d5156" }}>
              {description.slice(0, 160)}{description.length > 160 ? "…" : ""}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: "#4d5156", opacity: 0.6 }}>
              No meta description — add one for better discoverability.
            </p>
          )}
        </div>

        {/* SEO checklist */}
        <ul className="space-y-2">
          {seoChecks.map((c) => (
            <li key={c.label} className="flex items-center gap-2.5">
              {c.ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--green)" }} />
              ) : (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" style={{ color: "#FF934F" }} />
              )}
              <span className="text-xs flex-1" style={{ color: c.ok ? "var(--ink)" : "var(--muted-ink)" }}>
                {c.ok ? c.label : c.fix}
              </span>
              {!c.ok && (
                <Link href={c.href} className="text-xs font-semibold hover:opacity-70" style={{ color: "var(--ink)" }}>
                  Fix →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
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
  const theme = draftVersion?.theme_config;
  const openJobs = jobs.filter((j) => j.status === "open");

  const firstName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  // ── Loading ───────────────────────────────────────────────────────────────

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen bg-canvas">
        <AppHeader companyName={company?.name} onLogout={logout} />
        <main className="max-w-5xl mx-auto px-4 pt-10 pb-16 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-52 rounded-xl" style={{ backgroundColor: "var(--border-subtle)" }} />
            <div className="h-4 w-36 rounded-lg" style={{ backgroundColor: "var(--border-subtle)", opacity: 0.6 }} />
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-3xl"
                  style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }} />
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
        <AppHeader companyName={company?.name} onLogout={logout} />
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
      <AppHeader companyName={company?.name} onLogout={logout} />

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
              <a
                href={`/${company.slug}/careers`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-5 text-sm font-mono truncate transition-opacity hover:opacity-80"
                style={{
                  background: "var(--green-bg)",
                  border: "1px solid var(--green)",
                  color: "var(--muted-ink)",
                }}
                aria-label={`Open live careers page for ${company.slug}`}
              >
                <Globe className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span className="truncate">/{company.slug}/careers</span>
                <ExternalLink className="h-3 w-3 shrink-0 ml-auto opacity-50" />
              </a>
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

        {/* ── Quality + SEO row ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          <QualityScorePanel
            sections={sections}
            theme={theme}
            jobs={jobs}
            pageData={pageData}
          />
          <SEOPreviewPanel
            pageData={pageData}
            companySlug={company?.slug}
            openJobCount={openJobs.length}
          />
        </div>

        {/* ── Jobs panel ───────────────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden"
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
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Open Roles
              </p>
            </div>
            <div className="flex items-center gap-2">
              {openJobs.length > 0 && (
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--green-bg)", color: "var(--ink)" }}
                >
                  {openJobs.length} active
                </span>
              )}
              <Link
                href="/dashboard/jobs"
                className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: "var(--muted-ink)" }}
              >
                All jobs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
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
                <Briefcase className="h-5 w-5" style={{ color: "var(--muted-ink)" }} />
              </div>
              <p className="font-semibold text-sm mb-1" style={{ color: "var(--ink)" }}>
                No open roles yet
              </p>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--muted-ink)" }}>
                Add jobs from the Jobs section. They&apos;ll appear automatically on your careers page.
              </p>
              <Link
                href="/dashboard/jobs"
                className="btn-pill btn-pill-ghost text-sm mt-5 px-5 py-2"
              >
                Manage Jobs <ArrowRight className="h-3.5 w-3.5" />
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
                  <Link href="/dashboard/jobs" className="hover:underline">
                    +{jobs.length - 6} more roles — view all
                  </Link>
                </li>
              )}
            </ul>
          )}
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
        style={{ color: "var(--ink)" }}
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
