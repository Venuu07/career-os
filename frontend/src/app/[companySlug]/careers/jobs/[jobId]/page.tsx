import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { PublicCareerPageResponse, JobResponse } from "@/lib/types";
import { MapPin, Briefcase, ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ companySlug: string; jobId: string }>;
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function getPublicPage(
  slug: string
): Promise<PublicCareerPageResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/public/companies/${slug}/careers-page`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function findJob(
  page: PublicCareerPageResponse,
  jobId: string
): JobResponse | null {
  return page.open_jobs.find((j) => String(j.id) === jobId) ?? null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companySlug, jobId } = await params;
  const page = await getPublicPage(companySlug);
  if (!page) return { title: "Job Not Found" };
  const job = findJob(page, jobId);
  if (!job) return { title: "Job Not Found" };
  return {
    title: `${job.title} — ${page.company_name}`,
    description: job.description
      ? job.description.slice(0, 160)
      : `Join ${page.company_name} as ${job.title}.`,
    openGraph: {
      title: `${job.title} — ${page.company_name}`,
      description: job.description
        ? job.description.slice(0, 160)
        : `Join ${page.company_name} as ${job.title}.`,
      type: "website",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function JobDetailPage({ params }: Props) {
  const { companySlug, jobId } = await params;
  const page = await getPublicPage(companySlug);
  if (!page) notFound();

  const job = findJob(page!, jobId);
  if (!job) notFound();

  const theme = page!.theme_config;

  // Build metadata chips
  const chips = [
    job.location ? { icon: MapPin, label: job.location } : null,
    job.job_type ? { icon: Briefcase, label: formatJobType(job.job_type) } : null,
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  const pills = [
    job.department,
    job.experience_level
      ? capitalize(job.experience_level) + " level"
      : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--canvas)" }}
    >
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
          >
            <ArrowLeft className="h-4 w-4" />
            Back to open roles
          </Link>

          {theme?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.logo_url}
              alt={page!.company_name}
              className="h-6 object-contain"
            />
          ) : (
            <span
              className="text-sm font-bold"
              style={{ color: "var(--ink)" }}
            >
              {page!.company_name}
            </span>
          )}
        </div>
      </header>

      {/* ── Job Header ─────────────────────────────────────────────────────── */}
      <div
        className="py-16 md:py-24 px-6"
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Department breadcrumb */}
          {job.department && (
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-5"
              style={{ color: "var(--green)" }}
            >
              {job.department}
            </p>
          )}

          {/* Title */}
          <h1
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-7"
            style={{ color: "var(--ink)" }}
          >
            {job.title}
          </h1>

          {/* Location + type chips */}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-5">
              {chips.map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full"
                  style={{
                    backgroundColor: "var(--canvas)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--ink)",
                  }}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Experience + secondary pills */}
          {pills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              {pills.map((pill, i) => (
                <span
                  key={i}
                  className="text-xs font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--green-bg)",
                    color: "var(--ink)",
                    border: "1px solid var(--green)",
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          )}

          {/* Primary scroll CTA */}
          <a
            href="#apply"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
          >
            Apply for this role
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 2.5v9m-4-4 4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* ── Job Body ───────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {/* Description */}
        {job.description ? (
          <div>
            <h2
              className="text-xl font-bold mb-5"
              style={{ color: "var(--ink)" }}
            >
              About the role
            </h2>
            <div
              className="text-base leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--muted-ink)" }}
            >
              {job.description}
            </div>
          </div>
        ) : (
          <p
            className="text-sm italic"
            style={{ color: "var(--muted-ink)", opacity: 0.6 }}
          >
            No additional description provided.
          </p>
        )}

        {/* Divider */}
        <div
          className="h-px w-full"
          style={{ backgroundColor: "var(--border-subtle)" }}
        />

        {/* Apply CTA block */}
        <div
          id="apply"
          className="rounded-3xl p-8 text-center"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--ink)" }}
          >
            Interested in this role?
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--muted-ink)" }}>
            Send an application to {page!.company_name} and tell us about
            yourself.
          </p>
          <a
            href={`mailto:careers@${companySlug}.com?subject=Application: ${encodeURIComponent(
              job.title
            )}`}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
          >
            Apply via email
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 7h9m-4-4 4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Back link — bottom */}
        <div className="pt-2 pb-8">
          <Link
            href={`/${companySlug}/careers#jobs`}
            className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60"
            style={{ color: "var(--muted-ink)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            All open roles at {page!.company_name}
          </Link>
        </div>
      </div>
    </div>
  );
}
