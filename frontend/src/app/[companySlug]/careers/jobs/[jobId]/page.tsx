import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { PublicCareerPageResponse, JobResponse } from "@/lib/types";
import { MapPin, ArrowLeft, ArrowRight, Clock, ExternalLink } from "lucide-react";


interface Props {
  params: Promise<{ companySlug: string; jobId: string }>;
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPublicPage(slug: string): Promise<PublicCareerPageResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/public/companies/${slug}/careers-page`,
      { next: { revalidate: 10 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function findJob(page: PublicCareerPageResponse, jobId: string): JobResponse | null {
  return page.open_jobs.find((j) => String(j.id) === jobId) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(type: string): string {
  const map: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    internship: "Internship",
  };
  return map[type] ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWorkPolicy(policy: string): string {
  const map: Record<string, string> = {
    REMOTE: "Remote",
    HYBRID: "Hybrid",
    ONSITE: "On-site",
  };
  return map[policy] ?? policy;
}

function formatExperience(level: string): string {
  const map: Record<string, string> = {
    entry: "Entry level",
    mid: "Mid level",
    senior: "Senior level",
    lead: "Lead / Staff",
  };
  return map[level] ?? level;
}

/**
 * Human-readable freshness using job.created_at.
 * Returns null if date is invalid or very old (>90 days) to avoid misleading claims.
 */
function getFreshness(dateString: string | null | undefined): { label: string; muted: boolean } | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return null;
  if (diffDays === 0) return { label: "Posted today", muted: false };
  if (diffDays === 1) return { label: "Posted yesterday", muted: false };
  if (diffDays < 7) return { label: `Posted ${diffDays} days ago`, muted: false };
  if (diffDays < 14) return { label: "Posted last week", muted: true };
  if (diffDays < 30) return { label: `Posted ${Math.floor(diffDays / 7)} weeks ago`, muted: true };
  if (diffDays < 90) return { label: `Posted ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`, muted: true };
  return null; // very old — don't claim freshness
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug, jobId } = await params;
  const page = await getPublicPage(companySlug);
  if (!page) return { title: "Job Not Found" };
  const job = findJob(page, jobId);
  if (!job) return { title: "Job Not Found" };

  const title = `${job.title} at ${page.company_name}`;
  const description = job.description
    ? job.description.slice(0, 160)
    : `${page.company_name} is hiring a ${job.title}${job.location ? ` in ${job.location}` : ""}. Apply now.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    robots: "index, follow",
  };
}

// ─── JobPosting structured data ───────────────────────────────────────────────

function buildJobPostingSchema(
  job: JobResponse,
  companyName: string,
  pageUrl: string
): object {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description ?? `${companyName} is hiring for ${job.title}.`,
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
    },
    jobLocation: job.location
      ? {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressLocality: job.location },
        }
      : undefined,
    employmentType: (() => {
      const map: Record<string, string> = {
        full_time: "FULL_TIME",
        part_time: "PART_TIME",
        contract: "CONTRACTOR",
        internship: "INTERN",
      };
      return map[job.job_type] ?? undefined;
    })(),
    datePosted: job.created_at ? job.created_at.split("T")[0] : undefined,
    url: pageUrl,
    directApply: !!job.application_url,
  };
  // Remove undefined keys
  return JSON.parse(JSON.stringify(schema));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: Props) {
  const { companySlug, jobId } = await params;
  const page = await getPublicPage(companySlug);
  if (!page) notFound();

  const job = findJob(page!, jobId);
  if (!job) notFound();

  const theme = page!.theme_config;
  const freshness = getFreshness(job.created_at);

  // Role snapshot rows — only include fields that actually have values
  const snapshotRows: { label: string; value: string }[] = [
    job.location ? { label: "Location", value: job.location } : null,
    job.work_policy ? { label: "Work style", value: formatWorkPolicy(job.work_policy) } : null,
    { label: "Employment", value: formatJobType(job.job_type) },
    job.experience_level ? { label: "Experience", value: formatExperience(job.experience_level) } : null,
    job.department ? { label: "Department", value: job.department } : null,
    job.salary_range ? { label: "Compensation", value: job.salary_range } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const pageUrl = `${API_BASE_URL}/${companySlug}/careers/jobs/${jobId}`;
  const jobSchema = buildJobPostingSchema(job, page!.company_name, pageUrl);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
      {/* ── JSON-LD structured data ─────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />

      {/* ── Sticky Nav ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          backgroundColor: "rgba(243,243,241,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href={`/${companySlug}/careers#jobs`}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: "var(--muted-ink)" }}
            aria-label="Back to all open roles"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All roles
          </Link>

          {theme?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logo_url}
              alt={page!.company_name}
              className="h-6 object-contain"
            />
          ) : (
            <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>
              {page!.company_name}
            </span>
          )}

          {/* Desktop Apply CTA in nav — only shown if URL exists */}
          {job.application_url && (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-xs transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
            >
              Apply <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </header>

      {/* ── Job Header ──────────────────────────────────────────────────────── */}
      <div
        className="py-14 md:py-20 px-6"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Department breadcrumb */}
          {job.department && (
            <p
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "var(--green)" }}
            >
              {job.department}
            </p>
          )}

          {/* Title */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-5"
            style={{ color: "var(--ink)" }}
          >
            {job.title}
          </h1>

          {/* Meta line: location · type · freshness */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-7">
            {job.location && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted-ink)" }}>
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {job.location}
              </span>
            )}
            {job.work_policy && (
              <span className="text-sm" style={{ color: "var(--muted-ink)" }}>
                <span className="opacity-30 mr-3">·</span>
                {formatWorkPolicy(job.work_policy)}
              </span>
            )}
            <span className="text-sm" style={{ color: "var(--muted-ink)" }}>
              <span className="opacity-30 mr-3">·</span>
              {formatJobType(job.job_type)}
            </span>
            {freshness && (
              <span
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--muted-ink)", opacity: freshness.muted ? 0.55 : 0.8 }}
              >
                <span className="opacity-30 mr-2">·</span>
                <Clock className="h-3 w-3" aria-hidden="true" />
                {freshness.label}
              </span>
            )}
          </div>

          {/* Primary Apply CTA (header) */}
          {job.application_url ? (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
            >
              Apply for this role
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
              style={{ backgroundColor: "var(--canvas)", color: "var(--muted-ink)", border: "1.5px dashed var(--border)" }}
              role="status"
              aria-label="Application link unavailable"
            >
              Application link unavailable
            </div>
          )}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* ── Role Snapshot ────────────────────────────────────────────────── */}
        {snapshotRows.length > 0 && (
          <section aria-labelledby="snapshot-heading">
            <h2
              id="snapshot-heading"
              className="text-xs font-bold tracking-widest uppercase mb-4"
              style={{ color: "var(--muted-ink)" }}
            >
              Role Snapshot
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--surface)" }}
            >
              {snapshotRows.map(({ label, value }, i) => (
                <div
                  key={label}
                  className="flex items-center px-5 py-3.5"
                  style={{
                    borderTop: i > 0 ? "1px solid var(--border-subtle)" : undefined,
                  }}
                >
                  <span
                    className="w-32 text-xs font-semibold uppercase tracking-wider shrink-0"
                    style={{ color: "var(--muted-ink)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--ink)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── About the role ───────────────────────────────────────────────── */}
        {job.description ? (
          <section aria-labelledby="about-heading">
            <h2
              id="about-heading"
              className="text-xl font-bold mb-5"
              style={{ color: "var(--ink)" }}
            >
              About the role
            </h2>
            <div
              className="text-base leading-relaxed whitespace-pre-wrap prose-like"
              style={{ color: "var(--muted-ink)" }}
            >
              {job.description}
            </div>
          </section>
        ) : (
          <p className="text-sm italic" style={{ color: "var(--muted-ink)", opacity: 0.5 }}>
            No description provided for this role.
          </p>
        )}

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="h-px w-full" style={{ backgroundColor: "var(--border-subtle)" }} />

        {/* ── Apply CTA block ───────────────────────────────────────────────── */}
        <section
          id="apply"
          aria-labelledby="apply-heading"
          className="rounded-3xl p-8 text-center"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h2
            id="apply-heading"
            className="text-xl font-bold mb-2"
            style={{ color: "var(--ink)" }}
          >
            Ready to apply?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted-ink)" }}>
            Join the team at{" "}
            <span className="font-semibold" style={{ color: "var(--ink)" }}>
              {page!.company_name}
            </span>{" "}
            as a {job.title}.
          </p>

          {job.application_url ? (
            <a
              href={job.application_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
              aria-label={`Apply for ${job.title} at ${page!.company_name}`}
            >
              Apply for this role
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : (
            <div
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
              style={{
                backgroundColor: "var(--canvas)",
                border: "1.5px dashed var(--border)",
                color: "var(--muted-ink)",
              }}
              role="status"
              aria-label="Application link not available for this role"
            >
              Application link unavailable
            </div>
          )}

          {/* Freshness reassurance */}
          {freshness && !freshness.muted && (
            <p className="text-xs mt-4" style={{ color: "var(--muted-ink)", opacity: 0.6 }}>
              {freshness.label}
            </p>
          )}
        </section>

        {/* ── Related Roles ─────────────────────────────────────────────────── */}
        {(() => {
          const otherJobs = page!.open_jobs.filter((j) => String(j.id) !== jobId);
          // Priority: same dept → other roles. Cap at 3.
          const sameDept = otherJobs.filter((j) => j.department && j.department === job.department);
          const rest = otherJobs.filter((j) => !j.department || j.department !== job.department);
          const related = [...sameDept, ...rest].slice(0, 3);
          if (related.length === 0) return null;
          return (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="text-base font-bold mb-4" style={{ color: "var(--ink)" }}>
                More roles you might like
              </h2>
              <ul className="space-y-2">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/${companySlug}/careers/jobs/${r.id}`}
                      className="group flex items-center justify-between px-5 py-4 rounded-2xl transition-all"
                      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-subtle)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--green)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{r.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>
                          {[r.department, r.location, r.work_policy ? formatWorkPolicy(r.work_policy) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--ink)" }} />
                    </Link>
                  </li>
                ))}
              </ul>
              {job.department && sameDept.length > 0 && (
                <div className="mt-4">
                  <Link
                    href={`/${companySlug}/careers#jobs`}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "var(--muted-ink)" }}
                  >
                    See all {job.department} roles →
                  </Link>
                </div>
              )}
            </section>
          );
        })()}

        {/* ── Back link ────────────────────────────────────────────────────── */}
        <div className="pt-2 pb-8">
          <Link
            href={`/${companySlug}/careers#jobs`}
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: "var(--muted-ink)" }}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            All open roles at {page!.company_name}
          </Link>
        </div>
      </div>

      {/* ── Sticky Mobile Apply CTA ─────────────────────────────────────────── */}
      {job.application_url && (
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pt-3"
          style={{
            backgroundColor: "rgba(243,243,241,0.96)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--border-subtle)",
          }}
          aria-label="Mobile apply bar"
        >
          <a
            href={job.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-opacity hover:opacity-80 mb-2"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
            aria-label={`Apply for ${job.title}`}
          >
            Apply for this role
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}
