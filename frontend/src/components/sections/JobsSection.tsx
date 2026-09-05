import Link from "next/link";
import { PreviewProps, InspectorProps } from "./registry";
import { ChevronRight } from "lucide-react";

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function JobsPreview({ data, theme, jobs = [], companySlug }: PreviewProps) {
  const primaryColor = theme.primary_color || "oklch(0.15 0 0)";

  return (
    <div id="jobs" className="w-full py-20 px-6 md:px-12 bg-zinc-50 dark:bg-zinc-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {data.title || "Open Roles"}
          </h2>
          {data.subtitle && (
            <p className="mt-3 text-zinc-500 dark:text-zinc-400">{data.subtitle}</p>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 text-sm">No open roles at the moment. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => {
              const meta = [
                job.department,
                job.location,
                job.job_type?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
              ].filter(Boolean);

              const inner = (
                <div className="group flex items-center justify-between p-5 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-150 cursor-pointer">
                  <div>
                    <h3
                      className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[var(--jc)] transition-colors"
                      style={{ "--jc": primaryColor } as React.CSSProperties}
                    >
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {meta.map((m: string, i: number) => (
                        <span key={i} className="text-xs text-zinc-500">
                          {i > 0 && <span className="mr-1.5 text-zinc-200 dark:text-zinc-700">·</span>}
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-500 shrink-0 ml-4 transition-colors" />
                </div>
              );

              // On the public page, link to the job detail. In builder, no link.
              return companySlug ? (
                <Link
                  key={job.id}
                  href={`/${companySlug}/careers/jobs/${job.id}`}
                >
                  {inner}
                </Link>
              ) : (
                <div key={job.id}>{inner}</div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// INSPECTOR
// ————————————————————————————————————————

export function JobsInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 leading-relaxed">
        This section automatically displays active jobs from your company workspace. Add jobs via the backend to see them here.
      </div>
      <Field label="Section title">
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          placeholder="Open Roles"
          className={inputCls}
        />
      </Field>
      <Field label="Subtitle (optional)">
        <input
          type="text"
          value={data.subtitle || ""}
          onChange={(e) => updateData({ ...data, subtitle: e.target.value })}
          placeholder="Find your next opportunity."
          className={inputCls}
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition";
