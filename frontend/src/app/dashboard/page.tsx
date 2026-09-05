"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  LayoutTemplate,
  ExternalLink,
  CheckCircle2,
  CircleDashed,
  Briefcase,
  Edit3,
  LogOut,
  Globe,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user, company, logout, isLoading: authLoading } = useAuth();
  const [pageData, setPageData] = useState<Record<string, unknown> | null>(null);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
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
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [authLoading]);

  const isPublished = !!pageData?.published_version;
  const draftVersion = pageData?.draft_version;
  const sections: any[] = draftVersion?.sections_config || [];

  const hasHero = sections.some((s) => s.type === "hero");
  const hasAbout = sections.some((s) => s.type === "about");
  const openJobs = jobs.filter((j) => j.status === "open");

  const checklist = [
    { label: "Hero section added", done: hasHero },
    { label: "Company story added", done: hasAbout },
    { label: "Jobs added", done: jobs.length > 0 },
    { label: "Page published", done: isPublished },
  ];
  const completedCount = checklist.filter((i) => i.done).length;
  const readiness = Math.round((completedCount / checklist.length) * 100);

  if (authLoading || pageLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
        <DashboardHeader companyName={company?.name} onLogout={logout} />
        <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48" />
            <div className="h-4 bg-zinc-100 dark:bg-zinc-900 rounded w-64" />
            <div className="grid md:grid-cols-3 gap-5 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
        <DashboardHeader companyName={company?.name} onLogout={logout} />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="text-center max-w-sm">
            <p className="text-zinc-500 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm text-[oklch(0.6_0.15_250)] hover:underline"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black">
      <DashboardHeader companyName={company?.name} onLogout={logout} />

      <main className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {user?.full_name ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            {company?.name} · Careers Page
          </p>
        </div>

        {/* Primary action + status cards */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Build Card */}
          <div className="md:col-span-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <LayoutTemplate className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Careers Page
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Build your branded employer page and publish it for candidates.
                </p>
              </div>
              <StatusBadge published={isPublished} />
            </div>

            {isPublished && company?.slug && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs font-mono text-zinc-500 truncate">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                /{company.slug}/careers
              </div>
            )}

            <div className="flex items-center gap-2 mt-auto pt-2">
              {draftVersion && (
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Edit3 className="h-3 w-3" />
                  Draft ready
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                href="/dashboard/builder"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
              >
                Open Builder
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
              {isPublished && company?.slug && (
                <a
                  href={`/${company.slug}/careers`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Live
                </a>
              )}
            </div>
          </div>

          {/* Readiness Card */}
          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Page Readiness
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {readiness}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full rounded-full bg-[oklch(0.6_0.15_250)] transition-all duration-500"
                style={{ width: `${readiness}%` }}
              />
            </div>
            <ul className="space-y-3 flex-1">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-sm">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                  )}
                  <span className={item.done ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400"}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Jobs summary */}
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Jobs
              </span>
              <span className="ml-1 text-xs text-zinc-400">
                {openJobs.length} open · {jobs.length} total
              </span>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <Briefcase className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                No jobs yet
              </p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Jobs you create will appear in the Open Roles section of your careers page.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-50 dark:divide-zinc-900">
              {jobs.slice(0, 5).map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {job.title}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {[job.department, job.location, job.job_type?.replace("_", " ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <StatusJobBadge status={job.status} />
                </li>
              ))}
              {jobs.length > 5 && (
                <li className="px-6 py-3 text-xs text-zinc-400">
                  +{jobs.length - 5} more jobs
                </li>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

// ————— Sub-components ——————

function DashboardHeader({
  companyName,
  onLogout,
}: {
  companyName?: string;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-12 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-2.5">
        <div className="h-6 w-6 rounded-md bg-[oklch(0.6_0.15_250)] flex items-center justify-center">
          <span className="text-white text-xs font-bold">C</span>
        </div>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          CareerOS
        </span>
        {companyName && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-sm text-zinc-500 truncate max-w-32">{companyName}</span>
          </>
        )}
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        aria-label="Log out"
      >
        <LogOut className="h-3.5 w-3.5" /> Log out
      </button>
    </header>
  );
}

function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        published
          ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
          : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-emerald-500" : "bg-zinc-400"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function StatusJobBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    draft: "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
    closed: "bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${map[status] ?? map.draft}`}>
      {status}
    </span>
  );
}
