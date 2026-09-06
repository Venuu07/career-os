"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { JobResponse } from "@/lib/types";
import { AIAssistPanel } from "@/components/builder/AIAssistPanel";

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  description: string;
  job_type: "full_time" | "part_time" | "contract" | "internship";
  work_policy: "ONSITE" | "REMOTE" | "HYBRID" | "";
  experience_level: "entry" | "mid" | "senior" | "lead" | "";
  salary_range: string;
  application_url: string;
  status: "draft" | "open" | "closed";
}

const EMPTY: JobFormData = {
  title: "",
  department: "",
  location: "",
  description: "",
  job_type: "full_time",
  work_policy: "",
  experience_level: "",
  salary_range: "",
  application_url: "",
  status: "draft",
};

function jobToForm(job: JobResponse): JobFormData {
  return {
    title: job.title,
    department: job.department ?? "",
    location: job.location ?? "",
    description: job.description ?? "",
    job_type: job.job_type,
    work_policy: (job.work_policy as JobFormData["work_policy"]) ?? "",
    experience_level:
      (job.experience_level as JobFormData["experience_level"]) ?? "",
    salary_range: job.salary_range ?? "",
    application_url: job.application_url ?? "",
    status: job.status,
  };
}

const LABEL =
  "block text-xs font-semibold uppercase tracking-wider mb-1.5";
const INPUT =
  "w-full px-3 py-2 rounded-xl text-sm border transition-all outline-none focus:ring-2";

function inputStyle() {
  return {
    borderColor: "var(--border)",
    backgroundColor: "var(--canvas)",
    color: "var(--ink)",
  } as React.CSSProperties;
}

interface Props {
  job?: JobResponse;
  onSubmit: (data: JobFormData) => Promise<void>;
  onClose: () => void;
}

export function JobForm({ job, onSubmit, onClose }: Props) {
  const isEdit = !!job;
  const [form, setForm] = useState<JobFormData>(
    job ? jobToForm(job) : EMPTY
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);


  function set<K extends keyof JobFormData>(key: K, val: JobFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Job title is required.");
      return;
    }
    if (
      form.application_url &&
      !form.application_url.startsWith("http://") &&
      !form.application_url.startsWith("https://")
    ) {
      setError("Application URL must start with http:// or https://");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save job.");
    } finally {
      setSaving(false);
    }
  }

  const selectClass = `${INPUT} appearance-none pr-8`;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-0.5"
            style={{ color: "var(--muted-ink)" }}
          >
            {isEdit ? "Edit job" : "New job"}
          </p>
          <h2 className="text-base font-bold" style={{ color: "var(--ink)" }}>
            {isEdit ? form.title || "Untitled" : "Create a new role"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
          style={{ color: "var(--muted-ink)" }}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
      >
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: "rgba(255,147,79,0.12)",
              color: "#a84f00",
              border: "1.5px solid rgba(255,147,79,0.3)",
            }}
          >
            {error}
          </div>
        )}

        {/* Job Basics */}
        <section>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted-ink)" }}
          >
            Job Basics
          </p>
          <div className="space-y-3">
            <div>
              <label className={LABEL} style={{ color: "var(--muted-ink)" }}>
                Title <span style={{ color: "#e04a00" }}>*</span>
              </label>
              <input
                type="text"
                className={INPUT}
                style={inputStyle()}
                placeholder="e.g. Senior Frontend Engineer"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                maxLength={255}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={LABEL}
                  style={{ color: "var(--muted-ink)" }}
                >
                  Department
                </label>
                <input
                  type="text"
                  className={INPUT}
                  style={inputStyle()}
                  placeholder="e.g. Engineering"
                  value={form.department}
                  onChange={(e) => set("department", e.target.value)}
                  maxLength={100}
                />
              </div>
              <div>
                <label
                  className={LABEL}
                  style={{ color: "var(--muted-ink)" }}
                >
                  Location
                </label>
                <input
                  type="text"
                  className={INPUT}
                  style={inputStyle()}
                  placeholder="e.g. Berlin, Germany"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  maxLength={150}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Employment Details */}
        <section>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted-ink)" }}
          >
            Employment
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Type
              </label>
              <div className="relative">
                <select
                  className={selectClass}
                  style={inputStyle()}
                  value={form.job_type}
                  onChange={(e) =>
                    set(
                      "job_type",
                      e.target.value as JobFormData["job_type"]
                    )
                  }
                >
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Work Policy
              </label>
              <select
                className={selectClass}
                style={inputStyle()}
                value={form.work_policy}
                onChange={(e) =>
                  set(
                    "work_policy",
                    e.target.value as JobFormData["work_policy"]
                  )
                }
              >
                <option value="">Not specified</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ONSITE">On-site</option>
              </select>
            </div>
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Experience Level
              </label>
              <select
                className={selectClass}
                style={inputStyle()}
                value={form.experience_level}
                onChange={(e) =>
                  set(
                    "experience_level",
                    e.target.value as JobFormData["experience_level"]
                  )
                }
              >
                <option value="">Not specified</option>
                <option value="entry">Entry / Junior</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Status
              </label>
              <select
                className={selectClass}
                style={inputStyle()}
                value={form.status}
                onChange={(e) =>
                  set("status", e.target.value as JobFormData["status"])
                }
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </section>

        {/* Compensation */}
        <section>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted-ink)" }}
          >
            Compensation &amp; Application
          </p>
          <div className="space-y-3">
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Salary Range
              </label>
              <input
                type="text"
                className={INPUT}
                style={inputStyle()}
                placeholder="e.g. $120k–$160k / year"
                value={form.salary_range}
                onChange={(e) => set("salary_range", e.target.value)}
                maxLength={100}
              />
            </div>
            <div>
              <label
                className={LABEL}
                style={{ color: "var(--muted-ink)" }}
              >
                Application URL
              </label>
              <input
                type="url"
                className={INPUT}
                style={inputStyle()}
                placeholder="https://..."
                value={form.application_url}
                onChange={(e) => set("application_url", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Description */}
        <section>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "var(--muted-ink)" }}
          >
            Description
          </p>
          <textarea
            className={`${INPUT} resize-none`}
            style={inputStyle()}
            rows={6}
            placeholder="Describe the role, responsibilities, and what you are looking for…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          {/* ── AI Assist ───────────────────────────────────────────────────── */}
          <div className="mt-3">
            {form.title.trim() ? (
              <AIAssistPanel
                contentType="job_description"
                context={{
                  title:            form.title,
                  department:       form.department  || undefined,
                  location:         form.location    || undefined,
                  work_policy:      form.work_policy || undefined,
                  job_type:         form.job_type,
                  experience_level: form.experience_level || undefined,
                  salary_range:     form.salary_range    || undefined,
                  description:      form.description     || undefined,
                }}
                onApply={(result) => {
                  // Update only the description field in local form state.
                  // NEVER calls onSubmit — recruiter must click Create / Save.
                  if (result.description) {
                    set("description", result.description);
                  }
                }}
              />
            ) : (
              <p
                className="text-xs text-center py-2"
                style={{ color: "var(--muted-ink)" }}
              >
                Add a job title first to use AI assistance.
              </p>
            )}
          </div>
        </section>

        {/* Bottom padding for scrollable form */}
        <div className="h-4" />
      </form>

      {/* Footer */}
      <div
        className="flex items-center justify-end gap-3 px-6 py-4 shrink-0"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-70 disabled:opacity-40"
          style={{ color: "var(--muted-ink)" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          form="job-form"
          onClick={handleSubmit}
          disabled={saving}
          className="btn-pill btn-pill-primary px-5 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving…
            </span>
          ) : isEdit ? (
            "Save changes"
          ) : (
            "Create job"
          )}
        </button>
      </div>
    </div>
  );
}
