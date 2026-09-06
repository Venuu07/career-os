import Link from "next/link";
import { PreviewProps, InspectorProps, JobItem } from "./registry";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJobType(type: string): string {
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
}

// Group jobs by department
function groupByDepartment(jobs: JobItem[]): Record<string, JobItem[]> {
  const groups: Record<string, JobItem[]> = {};
  for (const job of jobs) {
    const dept = job.department || "Other";
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(job);
  }
  return groups;
}

// ─── PREVIEW (used in builder + public renderer) ──────────────────────────────

export function JobsPreview({
  data,
  jobs = [],
  companySlug,
}: PreviewProps) {
  const grouped = groupByDepartment(jobs);
  const departments = Object.keys(grouped).sort();

  return (
    <section
      id="jobs"
      className="w-full py-20 md:py-28 px-6 md:px-12"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "var(--ink)" }}
          >
            {(data.title as string) || "Open Roles"}
          </h2>
          {data.subtitle && (
            <p
              className="mt-3 text-base md:text-lg"
              style={{ color: "var(--muted-ink)" }}
            >
              {data.subtitle as string}
            </p>
          )}
        </div>

        {/* Job list */}
        {jobs.length === 0 ? (
          <div
            className="py-16 rounded-3xl text-center"
            style={{
              backgroundColor: "var(--surface)",
              border: "1.5px dashed var(--border-subtle)",
            }}
          >
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "var(--ink)" }}
            >
              No open roles at the moment
            </p>
            <p className="text-xs" style={{ color: "var(--muted-ink)" }}>
              Check back soon — we&apos;re growing.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {departments.map((dept) => (
              <div key={dept}>
                {/* Department header */}
                <div
                  className="flex items-center gap-4 mb-3"
                  style={{ borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}
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

                {/* Jobs in this department */}
                <div className="space-y-2">
                  {grouped[dept].map((job) => {
                    const meta = [
                      job.location,
                      job.job_type ? formatJobType(job.job_type) : null,
                      job.experience_level
                        ? job.experience_level.charAt(0).toUpperCase() +
                          job.experience_level.slice(1) +
                          " level"
                        : null,
                    ].filter(Boolean);

                    const row = (
                      <div
                        className="group flex items-center justify-between py-4 px-5 rounded-2xl transition-all"
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
                        <div className="min-w-0">
                          <h3
                            className="font-semibold text-base truncate mb-1"
                            style={{ color: "var(--ink)" }}
                          >
                            {job.title}
                          </h3>
                          {meta.length > 0 && (
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted-ink)" }}
                            >
                              {meta.join(" · ")}
                            </p>
                          )}
                        </div>
                        <span
                          className="shrink-0 ml-4 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "var(--ink)" }}
                        >
                          View role →
                        </span>
                      </div>
                    );

                    return companySlug ? (
                      <Link
                        key={job.id}
                        href={`/${companySlug}/careers/jobs/${job.id}`}
                        className="block"
                      >
                        {row}
                      </Link>
                    ) : (
                      <div key={job.id}>{row}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── INSPECTOR ────────────────────────────────────────────────────────────────
// PRESERVED EXACTLY

export function JobsInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 leading-relaxed">
        This section automatically displays active jobs from your company
        workspace. Add jobs via the backend to see them here.
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition";
