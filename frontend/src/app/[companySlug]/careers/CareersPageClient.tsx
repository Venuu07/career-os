"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CareerPageRenderer } from "@/components/sections/CareerPageRenderer";
import { PublicCareerPageResponse, JobResponse, WorkPolicy, SocialLinks } from "@/lib/types";
import { Search, MapPin, Briefcase, ArrowRight, Globe2, X } from "lucide-react";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExperience(level: string): string {
  if (level === "mid") return "Mid level";
  return level.charAt(0).toUpperCase() + level.slice(1) + " level";
}

function formatWorkPolicy(policy: string): string {
  const map: Record<string, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site" };
  return map[policy] ?? policy;
}


function getFreshness(dateString: string | null | undefined): { label: string; muted: boolean } | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return { label: "Posted today", muted: false };
  if (diffDays === 1) return { label: "Posted yesterday", muted: false };
  if (diffDays < 7) return { label: `Posted ${diffDays} days ago`, muted: false };
  if (diffDays < 14) return { label: "Posted last week", muted: true };
  if (diffDays < 30) return { label: `Posted ${Math.floor(diffDays / 7)} weeks ago`, muted: true };
  if (diffDays < 90) return { label: `Posted ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`, muted: true };
  return null;
}

function groupByDepartment(jobs: JobResponse[]): Record<string, JobResponse[]> {
  const groups: Record<string, JobResponse[]> = {};
  for (const job of jobs) {
    const dept = job.department || "Other";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(job);
  }
  return groups;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function PublicNav({
  companyName,
  logoUrl,
  openRoleCount,
  slug,
  sections,
}: {
  companyName: string;
  logoUrl?: string;
  openRoleCount: number;
  slug: string;
  sections: { type: string; visible: boolean }[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Only surface nav links for sections that are actually visible on the page
  const hasAbout    = sections.some((s) => s.type === "about"    && s.visible);
  const hasCulture  = sections.some((s) => s.type === "culture"  && s.visible);
  const hasBenefits = sections.some((s) => s.type === "benefits" && s.visible);

  const navLinks = [
    hasAbout    && { href: "#about",    label: "About" },
    hasCulture  && { href: "#culture",  label: "Culture" },
    hasBenefits && { href: "#benefits", label: "Benefits" },
  ].filter(Boolean) as { href: string; label: string }[];

  const roleLabel =
    openRoleCount > 0
      ? `${openRoleCount} Open Role${openRoleCount > 1 ? "s" : ""}`
      : "Open Roles";

  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        backgroundColor: "rgba(243,243,241,0.94)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Main row ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand: logo + name always visible */}
        <Link
          href={`/${slug}/careers`}
          className="flex items-center gap-2.5 font-bold text-sm tracking-tight transition-opacity hover:opacity-70 shrink-0"
          style={{ color: "var(--ink)" }}
        >
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={companyName}
              className="h-6 object-contain shrink-0"
            />
          )}
          <span>{companyName}</span>
        </Link>

        {/* Desktop nav — only rendered if nav links exist */}
        {navLinks.length > 0 && (
          <nav
            className="hidden md:flex items-center gap-5 text-sm"
            aria-label="Careers navigation"
          >
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="font-medium transition-opacity hover:opacity-60"
                style={{ color: "var(--muted-ink)" }}
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* Right: Open Roles CTA + mobile hamburger */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="#jobs"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition-all hover:opacity-80"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
          >
            {roleLabel}
          </a>

          {/* Mobile hamburger — only shown if there are nav links */}
          {navLinks.length > 0 && (
            <button
              type="button"
              className="md:hidden flex flex-col justify-center items-center h-8 w-8 gap-1.5 rounded-lg transition-opacity hover:opacity-60"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--ink)",
                  transform: menuOpen
                    ? "rotate(45deg) translate(3px, 3px)"
                    : "none",
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--ink)",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-0.5 w-5 rounded-full transition-all"
                style={{
                  backgroundColor: "var(--ink)",
                  transform: menuOpen
                    ? "rotate(-45deg) translate(3px, -3px)"
                    : "none",
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile dropdown ──────────────────────────────────────────── */}
      {menuOpen && navLinks.length > 0 && (
        <div
          className="md:hidden px-6 pb-4 flex flex-col gap-1"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium py-2 transition-opacity hover:opacity-60"
              style={{ color: "var(--ink)" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Job Row (public, full metadata) ─────────────────────────────────────────

function PublicJobRow({
  job,
  companySlug,
}: {
  job: JobResponse;
  companySlug: string;
}) {
  const meta = [
    job.location,
    job.work_policy ? formatWorkPolicy(job.work_policy) : null,
    job.job_type ? formatJobType(job.job_type) : null,
    job.experience_level ? formatExperience(job.experience_level) : null,
  ].filter(Boolean);

  const freshness = job.created_at ? getFreshness(job.created_at) : null;
  const postedAt = freshness?.label ?? null;

  return (
    <Link
      href={`/${companySlug}/careers/jobs/${job.id}`}
      className="group block"
    >
      <div
        className="flex items-center justify-between py-4 px-5 rounded-2xl transition-all"
        style={{
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border-subtle)",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--green)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--border-subtle)")
        }
      >
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-base mb-1"
            style={{ color: "var(--ink)" }}
          >
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {meta.map((m, i) => (
              <span
                key={i}
                className="text-xs"
                style={{ color: "var(--muted-ink)" }}
              >
                {i > 0 && (
                  <span className="mr-3 opacity-30">·</span>
                )}
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 ml-4 flex items-center gap-2">
          {postedAt && (
            <span
              className="text-xs hidden sm:block"
              style={{ color: "var(--muted-ink)", opacity: freshness?.muted ? 0.45 : 0.6 }}
            >
              {postedAt}
            </span>
          )}
          <span
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold"
            style={{ color: "var(--ink)" }}
          >
            View <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function PublicFooter({
  companyName,
  slug,
  socialLinks,
}: {
  companyName: string;
  slug: string;
  socialLinks?: SocialLinks;
}) {
  const links = [
    {
      key: "linkedin",
      href: socialLinks?.linkedin,
      icon: <LinkedinIcon className="h-4 w-4" />,
      label: "LinkedIn",
    },
    {
      key: "instagram",
      href: socialLinks?.instagram,
      icon: <InstagramIcon className="h-4 w-4" />,
      label: "Instagram",
    },
    {
      key: "x",
      href: socialLinks?.x,
      icon: <TwitterIcon className="h-4 w-4" />,
      label: "X (Twitter)",
    },
  ].filter((l): l is typeof l & { href: string } => typeof l.href === "string" && /^https?:\/\/.+/.test(l.href));

  return (
    <footer
      className="w-full py-10 px-6"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className="font-bold text-sm"
            style={{ color: "var(--ink)" }}
          >
            {companyName}
          </span>
          <span style={{ color: "var(--border-subtle)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--muted-ink)" }}>
            Careers
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Social icons */}
          {links.length > 0 && (
            <div className="flex items-center gap-3">
              {links.map((l) => (
                <a
                  key={l.key}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${companyName} on ${l.label}`}
                  className="transition-opacity hover:opacity-60"
                  style={{ color: "var(--muted-ink)" }}
                >
                  {l.icon}
                </a>
              ))}
            </div>
          )}
          {links.length > 0 && (
            <span className="opacity-30 text-xs" style={{ color: "var(--muted-ink)" }}>·</span>
          )}
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: "var(--muted-ink)" }}
          >
            <Link href={`/${slug}/careers#jobs`} className="hover:underline">
              Open Roles
            </Link>
            <span className="opacity-30">·</span>
            <span>Powered by CareerOS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  page: PublicCareerPageResponse;
  companySlug: string;
}

export function CareersPageClient({ page, companySlug }: Props) {
  const [query, setQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [policyFilter, setPolicyFilter] = useState("");

  // Derive filter options from actual jobs
  const locations = useMemo(() => {
    const locs = page.open_jobs
      .map((j) => j.location)
      .filter((l): l is string => !!l);
    return Array.from(new Set(locs)).sort();
  }, [page.open_jobs]);

  const jobTypes = useMemo(() => {
    const types = page.open_jobs.map((j) => j.job_type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [page.open_jobs]);

  const workPolicies = useMemo(() => {
    const policies = page.open_jobs.map((j) => j.work_policy).filter((p): p is WorkPolicy => p !== null);
    return Array.from(new Set(policies)).sort();
  }, [page.open_jobs]);

  const filteredJobs = useMemo(() => {
    return page.open_jobs.filter((job) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        job.title.toLowerCase().includes(q) ||
        (job.location ?? "").toLowerCase().includes(q) ||
        (job.department ?? "").toLowerCase().includes(q);
      const matchesLocation =
        !locationFilter || job.location === locationFilter;
      const matchesType = !typeFilter || job.job_type === typeFilter;
      const matchesPolicy = !policyFilter || job.work_policy === (policyFilter as WorkPolicy);
      return matchesQuery && matchesLocation && matchesType && matchesPolicy;
    });
  }, [page.open_jobs, query, locationFilter, typeFilter, policyFilter]);

  const clearAll = () => { setQuery(""); setLocationFilter(""); setTypeFilter(""); setPolicyFilter(""); };


  const sections = page.sections_config;

  const hasFilters = !!(query || locationFilter || typeFilter || policyFilter);
  const grouped = useMemo(
    () => groupByDepartment(filteredJobs),
    [filteredJobs]
  );
  const departments = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Find jobs section config for section title/subtitle
  const jobSection = sections.find((s) => s.type === "jobs");
  const jobsTitle = (jobSection?.data?.title as string) || "Open Roles";
  const jobsSubtitle = jobSection?.data?.subtitle as string | undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
      <PublicNav
        companyName={page.company_name}
        logoUrl={page.theme_config?.logo_url}
        openRoleCount={page.open_jobs.length}
        slug={companySlug}
        sections={sections}
      />

      {/* Render all non-jobs sections through the shared renderer */}
      <CareerPageRenderer
        sections={sections.filter((s) => s.type !== "jobs")}
        theme={page.theme_config}
        jobs={filteredJobs}
        companySlug={companySlug}
      />

      {/* Jobs section — rendered separately to inject search/filter controls */}
      {sections.some((s) => s.type === "jobs" && s.visible) && (
        <section
          id="jobs"
          className="py-20 md:py-28 px-6 md:px-12"
          style={{ backgroundColor: "var(--canvas)" }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Header + live role count */}
            <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2
                  className="text-3xl md:text-4xl font-extrabold tracking-tight"
                  style={{ color: "var(--ink)" }}
                >
                  {jobsTitle}
                </h2>
                {jobsSubtitle && (
                  <p
                    className="mt-3 text-base md:text-lg"
                    style={{ color: "var(--muted-ink)" }}
                  >
                    {jobsSubtitle}
                  </p>
                )}
              </div>
              <span
                className="text-sm font-semibold px-3.5 py-1.5 rounded-full shrink-0"
                style={{ backgroundColor: "var(--green-bg)", color: "var(--ink)", border: "1px solid var(--green)" }}
              >
                {hasFilters
                  ? `${filteredJobs.length} of ${page.open_jobs.length} role${page.open_jobs.length !== 1 ? "s" : ""}`
                  : `${page.open_jobs.length} open role${page.open_jobs.length !== 1 ? "s" : ""}`}
              </span>
            </div>

            {/* Search + filters */}
            <div className="mb-8">
              {/* Search */}
              <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "var(--muted-ink)" }}
                  />
                  <input
                    type="search"
                    placeholder="Search by title, location, or department…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search jobs"
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-all"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1.5px solid var(--border-subtle)",
                      color: "var(--ink)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--green)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--border-subtle)")
                    }
                  />
                </div>
              </div>

              {/* Filter row */}
              <div className="flex flex-wrap gap-2">
                {/* Location filter */}
                {locations.length > 0 && (
                  <div className="relative">
                    <MapPin
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                      style={{ color: "var(--muted-ink)" }}
                    />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      aria-label="Filter by location"
                      className="h-9 pl-8 pr-7 rounded-xl text-xs font-medium appearance-none cursor-pointer outline-none transition-all"
                      style={{
                        backgroundColor: locationFilter ? "var(--ink)" : "var(--surface)",
                        border: `1.5px solid ${locationFilter ? "var(--ink)" : "var(--border-subtle)"}`,
                        color: locationFilter ? "var(--canvas)" : "var(--ink)",
                      }}
                    >
                      <option value="">Location</option>
                      {locations.map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Work style filter */}
                {workPolicies.length > 0 && (
                  <div className="relative">
                    <Globe2
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                      style={{ color: policyFilter ? "var(--canvas)" : "var(--muted-ink)" }}
                    />
                    <select
                      value={policyFilter as string}
                      onChange={(e) => setPolicyFilter(e.target.value)}
                      aria-label="Filter by work style"
                      className="h-9 pl-8 pr-7 rounded-xl text-xs font-medium appearance-none cursor-pointer outline-none transition-all"
                      style={{
                        backgroundColor: policyFilter ? "var(--ink)" : "var(--surface)",
                        border: `1.5px solid ${policyFilter ? "var(--ink)" : "var(--border-subtle)"}`,
                        color: policyFilter ? "var(--canvas)" : "var(--ink)",
                      }}
                    >
                      <option value="">Work style</option>
                      {workPolicies.map((p) => (
                        <option key={p} value={p}>{formatWorkPolicy(p as WorkPolicy)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Employment type filter */}
                {jobTypes.length > 0 && (
                  <div className="relative">
                    <Briefcase
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                      style={{ color: typeFilter ? "var(--canvas)" : "var(--muted-ink)" }}
                    />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      aria-label="Filter by employment type"
                      className="h-9 pl-8 pr-7 rounded-xl text-xs font-medium appearance-none cursor-pointer outline-none transition-all"
                      style={{
                        backgroundColor: typeFilter ? "var(--ink)" : "var(--surface)",
                        border: `1.5px solid ${typeFilter ? "var(--ink)" : "var(--border-subtle)"}`,
                        color: typeFilter ? "var(--canvas)" : "var(--ink)",
                      }}
                    >
                      <option value="">Employment type</option>
                      {jobTypes.map((t) => (
                        <option key={t} value={t}>{formatJobType(t)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Clear all */}
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all hover:opacity-70"
                    style={{ backgroundColor: "var(--canvas)", color: "var(--muted-ink)", border: "1.5px solid var(--border-subtle)" }}
                    aria-label="Clear all filters"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Result count — always shown */}
            <p className="text-xs mb-4" style={{ color: "var(--muted-ink)" }}>
              {hasFilters
                ? filteredJobs.length === 0
                  ? "No roles match your filters"
                  : `${filteredJobs.length} role${filteredJobs.length !== 1 ? "s" : ""} matching your search`
                : `${page.open_jobs.length} open role${page.open_jobs.length !== 1 ? "s" : ""}`}
            </p>

            {/* Results */}
            {filteredJobs.length === 0 ? (
              <div
                className="py-16 rounded-3xl text-center"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1.5px dashed var(--border-subtle)",
                }}
              >
                <p
                  className="font-semibold text-sm mb-1"
                  style={{ color: "var(--ink)" }}
                >
                  {page.open_jobs.length === 0
                    ? "No open roles right now"
                    : "No roles match your search"}
                </p>
                <p
                  className="text-xs mb-4"
                  style={{ color: "var(--muted-ink)" }}
                >
                  {page.open_jobs.length === 0
                    ? "We're growing — check back soon."
                    : "Try adjusting your filters."}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="text-xs font-semibold px-4 py-1.5 rounded-full transition-all hover:opacity-80"
                    style={{
                      backgroundColor: "var(--ink)",
                      color: "var(--canvas)",
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : hasFilters ? (
              /* Flat list when filtering */
              <div className="space-y-2">
                {filteredJobs.map((job) => (
                  <PublicJobRow
                    key={job.id}
                    job={job}
                    companySlug={companySlug}
                  />
                ))}
              </div>
            ) : (
              /* Department-grouped list when not filtering */
              <div className="space-y-10">
                {departments.map((dept) => (
                  <div key={dept}>
                    <div
                      className="flex items-center gap-3 mb-3 pb-2"
                      style={{ borderBottom: "1px solid var(--border-subtle)" }}
                    >
                      <p
                        className="text-xs font-bold tracking-widest uppercase"
                        style={{ color: "var(--muted-ink)" }}
                      >
                        {dept}
                      </p>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: "var(--green-bg)",
                          color: "var(--ink)",
                        }}
                      >
                        {grouped[dept].length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {grouped[dept].map((job) => (
                        <PublicJobRow
                          key={job.id}
                          job={job}
                          companySlug={companySlug}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <PublicFooter
        companyName={page.company_name}
        slug={companySlug}
        socialLinks={page.theme_config?.social_links}
      />
    </div>
  );
}
