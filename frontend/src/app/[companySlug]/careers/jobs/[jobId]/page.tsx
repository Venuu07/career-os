import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api";
import { PublicCareerPageResponse, JobResponse } from "@/lib/types";
import { MapPin, Briefcase, Clock, ArrowLeft, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ companySlug: string; jobId: string }>;
}

async function getPublicPage(slug: string): Promise<PublicCareerPageResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/public/companies/${slug}/careers-page`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function findJob(page: PublicCareerPageResponse, jobId: string): JobResponse | null {
  return page.open_jobs.find((j) => String(j.id) === jobId) ?? null;
}

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
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { companySlug, jobId } = await params;
  const page = await getPublicPage(companySlug);
  if (!page) notFound();

  const job = findJob(page!, jobId);
  if (!job) notFound();

  const primaryColor = page!.theme_config?.primary_color || "#18181b";
  const meta = [
    { icon: MapPin, label: job.location, condition: !!job.location },
    { icon: Briefcase, label: formatJobType(job.job_type), condition: true },
    {
      icon: Clock,
      label: job.experience_level ? capitalize(job.experience_level) + " level" : null,
      condition: !!job.experience_level,
    },
  ].filter((m) => m.condition && m.label);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Nav */}
      <header
        className="sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-900 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm"
      >
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href={`/${companySlug}/careers`}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {page!.company_name} Careers
          </Link>
          {page!.theme_config?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page!.theme_config.logo_url}
              alt={page!.company_name}
              className="h-6 object-contain"
            />
          )}
        </div>
      </header>

      {/* Hero */}
      <div
        className="py-16 px-6 border-b border-zinc-100 dark:border-zinc-900"
      >
        <div className="max-w-3xl mx-auto">
          {job.department && (
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: primaryColor }}>
              {job.department}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-3 mt-5">
            {meta.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-sm text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 px-3 py-1.5 rounded-full"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <a
              href="#apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Apply for this role <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {job.description ? (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              About this role
            </h2>
            <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </div>
        ) : (
          <p className="text-zinc-400 italic">No additional description provided.</p>
        )}

        {/* Apply CTA */}
        <div id="apply" className="mt-12 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Interested in this role?
          </h2>
          <p className="text-sm text-zinc-500 mb-5">
            Send an application to {page!.company_name} and tell us about yourself.
          </p>
          <a
            href={`mailto:careers@${companySlug}.com?subject=Application: ${encodeURIComponent(job.title)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Apply Now <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function formatJobType(type: string): string {
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
