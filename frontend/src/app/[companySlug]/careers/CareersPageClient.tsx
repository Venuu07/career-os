"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CareerPageRenderer } from "@/components/sections/CareerPageRenderer";
import { PublicCareerPageResponse, JobResponse } from "@/lib/types";
import { Search, MapPin, Briefcase, ArrowRight } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatExperience(level: string): string {
  if (level === "mid") return "Mid level";
  return level.charAt(0).toUpperCase() + level.slice(1) + " level";
}

function getDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  const m = Math.floor(diffDays / 30);
  return `${m}mo ago`;
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
}: {
  companyName: string;
  logoUrl?: string;
  openRoleCount: number;
  slug: string;
}) {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{
        backgroundColor: "rgba(243,243,241,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={`/${slug}/careers`}
          className="flex items-center gap-3 font-bold text-base tracking-tight transition-opacity hover:opacity-70"
          style={{ color: "var(--ink)" }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={companyName} className="h-6 object-contain" />
          ) : (
            companyName
          )}
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--muted-ink)" }}>
          <a href="#about" className="hover:text-ink transition-colors">About</a>
          <a href="#culture" className="hover:text-ink transition-colors">Culture</a>
          <a href="#benefits" className="hover:text-ink transition-colors">Benefits</a>
          <a
            href="#jobs"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition-all hover:opacity-80"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
          >
            {openRoleCount > 0 ? `${openRoleCount} Open Role${openRoleCount > 1 ? "s" : ""}` : "Open Roles"}
          </a>
        </nav>

        {/* Mobile CTA */}
        <a
          href="#jobs"
          className="md:hidden inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition-all hover:opacity-80"
          style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
        >
          Roles
        </a>
      </div>
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
    job.job_type ? formatJobType(job.job_type) : null,
    job.experience_level ? formatExperience(job.experience_level) : null,
  ].filter(Boolean);

  const postedAt = job.created_at ? getDaysAgo(job.created_at) : null;

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
          ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--green)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)")
        }
      >
        <div className="min-w-0 flex-1">
          <h3
            className="font-semibold text-base mb-1 truncate"
            style={{ color: "var(--ink)" }}
          >
            {job.title}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {meta.map((m, i) => (
              <span key={i} className="text-xs" style={{ color: "var(--muted-ink)" }}>
                {i > 0 && <span className="mr-3 opacity-30">·</span>}
                {m}
              </span>
            ))}
          </div>
        </div>
        <div className="shrink-0 ml-4 flex items-center gap-2">
          {postedAt && (
            <span className="text-xs hidden sm:block" style={{ color: "var(--muted-ink)", opacity: 0.6 }}>
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
}: {
  companyName: string;
  slug: string;
}) {
  return (
    <footer
      className="w-full py-10 px-6"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>
            {companyName}
          </span>
          <span style={{ color: "var(--border-subtle)" }}>·</span>
          <span className="text-xs" style={{ color: "var(--muted-ink)" }}>
            Careers
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs" style={{ color: "var(--muted-ink)" }}>
          <Link href={`/${slug}/careers#jobs`} className="hover:underline">
            Open Roles
          </Link>
          <span className="opacity-30">·</span>
          <span>Powered by CareerOS</span>
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

  const filteredJobs = useMemo(() => {
    return page.open_jobs.filter((job) => {
      const matchesQuery =
        !query || job.title.toLowerCase().includes(query.toLowerCase());
      const matchesLocation =
        !locationFilter || job.location === locationFilter;
      const matchesType = !typeFilter || job.job_type === typeFilter;
      return matchesQuery && matchesLocation && matchesType;
    });
  }, [page.open_jobs, query, locationFilter, typeFilter]);

  const sections = page.sections_config;
  const hasFilters = !!(query || locationFilter || typeFilter);
  const grouped = useMemo(
    () => groupByDepartment(filteredJobs),
    [filteredJobs]
  );
  const departments = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  // Find the jobs section config for title/subtitle
  const jobSection = sections.find((s) => s.type === "jobs");
  const jobsTitle = (jobSection?.data?.title as string) || "Open Roles";
  const jobsSubtitle = jobSection?.data?.subtitle as string | undefined;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <PublicNav
        companyName={page.company_name}
        logoUrl={page.theme_config?.logo_url}
        openRoleCount={page.open_jobs.length}
        slug={companySlug}
      />

      {/* Render all non-jobs sections through the shared renderer */}
      <CareerPageRenderer
        sections={sections.filter((s) => s.type !== "jobs")}
        theme={page.theme_config}
        jobs={filteredJobs}
        companySlug={companySlug}
      />

      {/* Jobs section — rendered separately to inject filters */}
      {sections.some((s) => s.type === "jobs" && s.visible) && (
        <section
          id="jobs"
          className="py-20 md:py-28 px-6 md:px-12"
          style={{ backgroundColor: "var(--canvas)" }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Jobs section header */}
            <div className="mb-10">
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

            {/* Search + filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                  style={{ color: "var(--muted-ink)" }}
                />
                <input
                  type="search"
                  placeholder="Search roles…"
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

              {/* Location filter */}
              {locations.length > 0 && (
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "var(--muted-ink)" }}
                  />
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    aria-label="Filter by location"
                    className="h-10 pl-9 pr-8 rounded-xl text-sm appearance-none cursor-pointer outline-none transition-all"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1.5px solid var(--border-subtle)",
                      color: "var(--ink)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--green)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-subtle)")
                    }
                  >
                    <option value="">All locations</option>
                    {locations.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type filter */}
              {jobTypes.length > 0 && (
                <div className="relative">
                  <Briefcase
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                    style={{ color: "var(--muted-ink)" }}
                  />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    aria-label="Filter by job type"
                    className="h-10 pl-9 pr-8 rounded-xl text-sm appearance-none cursor-pointer outline-none transition-all"
                    style={{
                      backgroundColor: "var(--surface)",
                      border: "1.5px solid var(--border-subtle)",
                      color: "var(--ink)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--green)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-subtle)")
                    }
                  >
                    <option value="">All types</option>
                    {jobTypes.map((t) => (
                      <option key={t} value={t}>
                        {formatJobType(t)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Result count when filters active */}
            {hasFilters && (
              <p className="text-xs mb-5" style={{ color: "var(--muted-ink)" }}>
                {filteredJobs.length === 0
                  ? "No roles match"
                  : `${filteredJobs.length} role${filteredJobs.length !== 1 ? "s" : ""} found`}
              </p>
            )}

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
                <p className="text-xs mb-4" style={{ color: "var(--muted-ink)" }}>
                  {page.open_jobs.length === 0
                    ? "We're growing — check back soon."
                    : "Try adjusting your filters."}
                </p>
                {hasFilters && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setLocationFilter("");
                      setTypeFilter("");
                    }}
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

      <PublicFooter companyName={page.company_name} slug={companySlug} />
    </div>
  );
}
