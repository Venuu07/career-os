"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { CareerOSLogo } from "@/components/ui/CareerOSLogo";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { JobResponse } from "@/lib/types";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { JobForm, JobFormData } from "@/components/jobs/JobForm";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  LogOut,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  RefreshCw,
  CheckCircle2,
  X,
  ArrowUpRight,
} from "lucide-react";

// ─── Label maps ───────────────────────────────────────────────────────────────

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  internship: "Internship",
};

const WORK_POLICY_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ONSITE: "On-site",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  entry: "Entry",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
};

// ─── Freshness helpers ────────────────────────────────────────────────────────

type FreshnessLevel = "fresh" | "normal" | "aging" | "attention";

function getJobAge(createdAt: string): FreshnessLevel {
  const diffDays = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 14) return "fresh";
  if (diffDays <= 30) return "normal";
  if (diffDays <= 60) return "aging";
  return "attention";
}

// ─── Job Quality Signal ───────────────────────────────────────────────────────

interface QualitySignal {
  ok: boolean;
  label: string;
}

function getJobQualitySignal(job: JobResponse): QualitySignal {
  if (!job.application_url) return { ok: false, label: "Missing apply link" };
  if (!job.description || job.description.trim().length < 80) return { ok: false, label: "Short description" };
  if (!job.salary_range) return { ok: false, label: "No salary listed" };
  if (!job.location) return { ok: false, label: "No location" };
  return { ok: true, label: "Complete" };
}

// ─── App Header ───────────────────────────────────────────────────────────────

function AppHeader({ companyName, onLogout }: { companyName?: string; onLogout: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex justify-center px-4 pt-4">
      <header
        className="w-full max-w-6xl flex items-center justify-between h-12 px-4 rounded-2xl backdrop-blur-md shadow-sm"
        style={{ backgroundColor: "rgba(255,255,255,0.92)", border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center group" aria-label="CareerOS home">
            <CareerOSLogo size="sm" />
          </Link>
          {companyName && (
            <>
              <span style={{ color: "var(--border-subtle)" }} className="select-none">/</span>
              <span className="text-sm font-medium truncate max-w-36 hidden sm:block" style={{ color: "var(--muted-ink)" }}>{companyName}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Link href="/dashboard" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Dashboard</Link>
          <Link href="/dashboard/builder" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Builder</Link>
          <Link href="/dashboard/branding" className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>Branding</Link>
          <button onClick={onLogout} className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:opacity-70" style={{ color: "var(--muted-ink)" }}>
            <LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>
    </div>
  );
}

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({ label, count, active, onClick, dotColor }: { label: string; count: number; active: boolean; onClick: () => void; dotColor: string }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
      style={{ background: active ? "var(--ink)" : "var(--surface)", color: active ? "var(--canvas)" : "var(--ink)", borderColor: active ? "var(--ink)" : "var(--border)" }}>
      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: active ? "var(--canvas)" : dotColor }} />
      {label}
      <span className="ml-0.5 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: active ? "rgba(255,255,255,0.18)" : "rgba(30,35,48,0.08)" }}>{count}</span>
    </button>
  );
}

// ─── Freshness Tag ────────────────────────────────────────────────────────────

function FreshnessTag({ level }: { level: FreshnessLevel }) {
  const cfg = {
    fresh:     { label: "Fresh",          bg: "rgba(169,203,183,0.18)", color: "#2d6e4f",   border: "rgba(169,203,183,0.5)" },
    normal:    { label: "Active",          bg: "var(--canvas)",          color: "var(--muted-ink)", border: "var(--border)" },
    aging:     { label: "Aging",           bg: "rgba(255,147,79,0.10)", color: "#c45e00",  border: "rgba(255,147,79,0.3)" },
    attention: { label: "Needs attention", bg: "rgba(255,80,50,0.08)",  color: "#c0341a",  border: "rgba(255,80,50,0.2)" },
  }[level];
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap"
      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Skeleton rows ────────────────────────────────────────────────────────────

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: 9 }).map((_, j) => (
            <td key={j} className="px-4 py-3.5">
              <div className="h-4 rounded-lg animate-pulse" style={{ background: "rgba(30,35,48,0.07)", width: j === 0 ? "60%" : j === 8 ? "40px" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ─── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({ job, onConfirm, onCancel, deleting }: { job: JobResponse; onConfirm: () => void; onCancel: () => void; deleting: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(30,35,48,0.45)" }} onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ background: "var(--surface)" }}>
        <div className="h-10 w-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(255,147,79,0.15)" }}>
          <Trash2 className="h-4 w-4" style={{ color: "#e04a00" }} />
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: "var(--ink)" }}>Delete this job?</h3>
        <p className="text-sm mb-5" style={{ color: "var(--muted-ink)" }}>
          <span className="font-semibold" style={{ color: "var(--ink)" }}>{job.title}</span> will be permanently removed. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-70 disabled:opacity-40"
            style={{ borderColor: "var(--border)", color: "var(--muted-ink)" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: "#e04a00", color: "#fff" }}>{deleting ? "Deleting…" : "Delete job"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Action Menu ─────────────────────────────────────────────────────────────

function ActionMenu({ job, companySlug, onEdit, onDelete, onStatusChange }: {
  job: JobResponse; companySlug: string; onEdit: () => void; onDelete: () => void; onStatusChange: (s: JobResponse["status"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    if (open) document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(p => !p)} className="h-7 w-7 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
        style={{ color: "var(--muted-ink)" }} aria-label="Job actions">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-44 rounded-xl shadow-lg py-1 z-20"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "var(--ink)" }}
            onClick={() => { setOpen(false); onEdit(); }}>
            <Pencil className="h-3.5 w-3.5" />Edit
          </button>
          {job.status === "draft" && (
            <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "var(--ink)" }}
              onClick={() => { setOpen(false); onStatusChange("open"); }}>
              <CheckCircle2 className="h-3.5 w-3.5" />Publish
            </button>
          )}
          {job.status === "open" && (
            <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "var(--ink)" }}
              onClick={() => { setOpen(false); onStatusChange("closed"); }}>
              <X className="h-3.5 w-3.5" />Close
            </button>
          )}
          {job.status === "closed" && (
            <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "var(--ink)" }}
              onClick={() => { setOpen(false); onStatusChange("open"); }}>
              <RefreshCw className="h-3.5 w-3.5" />Reopen
            </button>
          )}
          {job.status === "open" && companySlug && (
            <Link href={`/${companySlug}/careers/jobs/${job.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "var(--ink)" }}
              onClick={() => setOpen(false)}>
              <ExternalLink className="h-3.5 w-3.5" />View live<ArrowUpRight className="h-3 w-3 ml-auto opacity-40" />
            </Link>
          )}
          <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
          <button className="flex items-center gap-2.5 px-3.5 py-2 text-sm w-full text-left hover:opacity-70" style={{ color: "#e04a00" }}
            onClick={() => { setOpen(false); onDelete(); }}>
            <Trash2 className="h-3.5 w-3.5" />Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Sort TH ─────────────────────────────────────────────────────────────────

type SortKey = "title" | "department" | "location" | "status" | "created_at";

function SortTH({ label, sortKey, current, dir, onChange }: { label: string; sortKey: SortKey; current: SortKey; dir: "asc" | "desc"; onChange: (k: SortKey) => void }) {
  const active = current === sortKey;
  return (
    <th className="px-4 py-3 text-left cursor-pointer select-none" onClick={() => onChange(sortKey)}>
      <span className="inline-flex items-center gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: active ? "var(--ink)" : "var(--muted-ink)" }}>{label}</span>
        <span style={{ color: "var(--muted-ink)", opacity: active ? 1 : 0.3 }}>
          {active ? (dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />) : <ChevronsUpDown className="h-3 w-3" />}
        </span>
      </span>
    </th>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium" style={{ background: "var(--ink)", color: "var(--canvas)" }}>
        <CheckCircle2 className="h-4 w-4" style={{ color: "#A9CBB7" }} />{message}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { company, logout } = useAuth();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editJob, setEditJob] = useState<JobResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JobResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterPolicy, setFilterPolicy] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const data = await apiFetch("/api/jobs");
      setJobs(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() { await fetchJobs(); }
    init();
  }, [fetchJobs]);

  const departments = useMemo(() => {
    const s = new Set<string>();
    jobs.forEach(j => { if (j.department) s.add(j.department); });
    return Array.from(s).sort();
  }, [jobs]);

  // ── Freshness health summary (open jobs only) ─────────────────────────────
  const openJobs = jobs.filter((j) => j.status === "open");
  const openCount = openJobs.length;
  const freshCount = openJobs.filter((j) => getJobAge(j.created_at) === "fresh").length;
  const agingCount = openJobs.filter((j) => getJobAge(j.created_at) === "aging").length;
  const attentionCount = openJobs.filter((j) => getJobAge(j.created_at) === "attention").length;
  const showHealthSummary = openJobs.length > 0 && (agingCount > 0 || attentionCount > 0);

  const draftCount = jobs.filter(j => j.status === "draft").length;
  const closedCount = jobs.filter(j => j.status === "closed").length;

  const displayed = useMemo(() => {
    let list = jobs;
    if (filterStatus !== "all") list = list.filter(j => j.status === filterStatus);
    if (filterDept !== "all") list = list.filter(j => j.department === filterDept);
    if (filterPolicy !== "all") list = list.filter(j => j.work_policy === filterPolicy);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || (j.department?.toLowerCase() ?? "").includes(q) || (j.location?.toLowerCase() ?? "").includes(q));
    }
    list = [...list].sort((a, b) => {
      const av = sortKey === "title" ? a.title : sortKey === "department" ? (a.department ?? "") : sortKey === "location" ? (a.location ?? "") : sortKey === "status" ? a.status : a.created_at;
      const bv = sortKey === "title" ? b.title : sortKey === "department" ? (b.department ?? "") : sortKey === "location" ? (b.location ?? "") : sortKey === "status" ? b.status : b.created_at;
      const cmp = av.localeCompare(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [jobs, filterStatus, filterDept, filterPolicy, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  async function handleFormSubmit(data: JobFormData) {
    const body = { ...data, work_policy: data.work_policy || null, experience_level: data.experience_level || null, salary_range: data.salary_range || null, application_url: data.application_url || null, department: data.department || null, location: data.location || null, description: data.description || null };
    try {
      if (editJob) {
        const updated = await apiFetch(`/api/jobs/${editJob.id}`, { method: "PATCH", body: JSON.stringify(body) });
        setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
        showToast("Job updated");
      } else {
        const created = await apiFetch("/api/jobs", { method: "POST", body: JSON.stringify(body) });
        setJobs(prev => [created, ...prev]);
        showToast("Job created");
      }
      setPanelOpen(false);
      setEditJob(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to save job. Please try again.");
    }
  }

  async function handleStatusChange(job: JobResponse, newStatus: JobResponse["status"]) {
    try {
      const updated = await apiFetch(`/api/jobs/${job.id}/status`, { method: "PATCH", body: JSON.stringify({ status: newStatus }) });
      setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
      showToast(`Job marked as ${newStatus}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Status update failed");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/jobs/${deleteTarget.id}`, { method: "DELETE" });
      setJobs(prev => prev.filter(j => j.id !== deleteTarget.id));
      showToast("Job deleted");
      setDeleteTarget(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  const SEL = "h-9 px-3 pr-8 rounded-xl text-sm border appearance-none outline-none transition-all";
  const selStyle = { borderColor: "var(--border)", backgroundColor: "var(--surface)", color: "var(--ink)" } as React.CSSProperties;
  const hasFilter = filterStatus !== "all" || filterDept !== "all" || filterPolicy !== "all" || !!search;
  const clearFilters = () => { setFilterStatus("all"); setFilterDept("all"); setFilterPolicy("all"); setSearch(""); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--canvas)" }}>
      <AppHeader companyName={company?.name} onLogout={() => { logout(); router.push("/login"); }} />

      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--muted-ink)" }}>Jobs</p>
            <h1 className="text-3xl font-bold tracking-tight mb-1.5" style={{ color: "var(--ink)" }}>Job postings</h1>
            <p className="text-sm" style={{ color: "var(--muted-ink)" }}>Create, manage, and publish the roles your team is hiring for.</p>
          </div>
          <button id="create-job-btn" onClick={() => { setEditJob(null); setPanelOpen(true); }}
            className="btn-pill btn-pill-primary flex items-center gap-2 px-5 py-2.5 shrink-0">
            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Create job</span><span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Summary pills */}
        {!loading && !fetchError && (
          <div className="flex flex-wrap gap-2 mb-6">
            <SummaryPill label="All" count={jobs.length} active={filterStatus === "all"} onClick={() => setFilterStatus("all")} dotColor="var(--muted-ink)" />
            <SummaryPill label="Open" count={openCount} active={filterStatus === "open"} onClick={() => setFilterStatus("open")} dotColor="#A9CBB7" />
            <SummaryPill label="Draft" count={draftCount} active={filterStatus === "draft"} onClick={() => setFilterStatus("draft")} dotColor="#FF934F" />
            <SummaryPill label="Closed" count={closedCount} active={filterStatus === "closed"} onClick={() => setFilterStatus("closed")} dotColor="var(--muted-ink)" />
          </div>
        )}

        {/* Health summary — only shown when aging/attention jobs exist */}
        {!loading && !fetchError && showHealthSummary && (
          <div
            className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3 rounded-2xl text-sm"
            style={{ background: "rgba(255,147,79,0.08)", border: "1px solid rgba(255,147,79,0.25)" }}
          >
            <span className="font-semibold shrink-0" style={{ color: "var(--ink)" }}>
              {openJobs.length} open role{openJobs.length !== 1 ? "s" : ""}
            </span>
            <span className="opacity-30">·</span>
            <span style={{ color: "#2d6e4f" }}>{freshCount} fresh</span>
            {agingCount > 0 && (
              <><span className="opacity-30">·</span><span style={{ color: "#c45e00" }}>{agingCount} aging</span></>
            )}
            {attentionCount > 0 && (
              <><span className="opacity-30">·</span><span style={{ color: "#c0341a" }}>{attentionCount} need attention</span></>
            )}
            <span className="text-xs ml-auto" style={{ color: "var(--muted-ink)" }}>
              Consider refreshing older postings to stay competitive.
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5 p-3 rounded-2xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: "var(--muted-ink)" }} />
            <input id="jobs-search" type="text" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
              className="h-9 w-full pl-9 pr-3 rounded-xl text-sm border outline-none transition-all"
              style={{ borderColor: "var(--border)", backgroundColor: "var(--canvas)", color: "var(--ink)" }} />
          </div>
          <select className={SEL} style={selStyle} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="all">All departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className={SEL} style={selStyle} value={filterPolicy} onChange={e => setFilterPolicy(e.target.value)}>
            <option value="all">All policies</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ONSITE">On-site</option>
          </select>
          {hasFilter && (
            <button onClick={clearFilters} className="h-9 px-3 rounded-xl text-xs font-medium transition-all hover:opacity-70 flex items-center gap-1.5" style={{ color: "var(--muted-ink)" }}>
              <X className="h-3.5 w-3.5" />Clear
            </button>
          )}
        </div>

        {/* Table */}
        {fetchError ? (
          <div className="rounded-2xl p-10 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <p className="text-sm font-medium mb-2" style={{ color: "var(--ink)" }}>Failed to load jobs</p>
            <p className="text-xs mb-5" style={{ color: "var(--muted-ink)" }}>{fetchError}</p>
            <button onClick={fetchJobs} className="btn-pill btn-pill-primary px-5 py-2 text-sm inline-flex items-center gap-2 mx-auto">
              <RefreshCw className="h-3.5 w-3.5" />Try again
            </button>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    <SortTH label="Title" sortKey="title" current={sortKey} dir={sortDir} onChange={toggleSort} />
                    <SortTH label="Department" sortKey="department" current={sortKey} dir={sortDir} onChange={toggleSort} />
                    <SortTH label="Location" sortKey="location" current={sortKey} dir={sortDir} onChange={toggleSort} />
                    <th className="px-4 py-3 text-left"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-ink)" }}>Policy</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-ink)" }}>Type</span></th>
                    <SortTH label="Status" sortKey="status" current={sortKey} dir={sortDir} onChange={toggleSort} />
                    <th className="px-4 py-3 text-left"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-ink)" }}>Health</span></th>
                    <th className="px-4 py-3 text-left"><span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-ink)" }}>Quality</span></th>
                    <th className="px-4 py-3 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? <SkeletonRows /> : displayed.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-16 text-center">
                        {jobs.length === 0 ? (
                          <div>
                            <p className="text-base font-semibold mb-1.5" style={{ color: "var(--ink)" }}>No job postings yet</p>
                            <p className="text-sm mb-5" style={{ color: "var(--muted-ink)" }}>Create your first role and start building your hiring pipeline.</p>
                            <button onClick={() => { setEditJob(null); setPanelOpen(true); }} className="btn-pill btn-pill-primary px-5 py-2 text-sm inline-flex items-center gap-2 mx-auto">
                              <Plus className="h-4 w-4" />Create job
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>No jobs match your filters</p>
                            <button onClick={clearFilters} className="text-sm mt-2 underline underline-offset-2" style={{ color: "var(--muted-ink)" }}>Clear filters</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : displayed.map((job, idx) => (
                    <tr key={job.id} className="transition-colors hover:bg-[var(--canvas)] group"
                      style={{ borderTop: idx > 0 ? "1px solid var(--border)" : undefined }}>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--ink)" }}>{job.title}</p>
                        {job.experience_level && <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>{EXPERIENCE_LABELS[job.experience_level] ?? job.experience_level}</p>}
                        {job.salary_range && <p className="text-xs mt-0.5" style={{ color: "var(--muted-ink)" }}>{job.salary_range}</p>}
                      </td>
                      <td className="px-4 py-3.5"><span className="text-sm" style={{ color: "var(--muted-ink)" }}>{job.department || "—"}</span></td>
                      <td className="px-4 py-3.5"><span className="text-sm" style={{ color: "var(--muted-ink)" }}>{job.location || "—"}</span></td>
                      <td className="px-4 py-3.5"><span className="text-sm" style={{ color: "var(--muted-ink)" }}>{job.work_policy ? WORK_POLICY_LABELS[job.work_policy] ?? job.work_policy : "—"}</span></td>
                      <td className="px-4 py-3.5"><span className="text-sm" style={{ color: "var(--muted-ink)" }}>{JOB_TYPE_LABELS[job.job_type] ?? job.job_type}</span></td>
                      <td className="px-4 py-3.5"><JobStatusBadge status={job.status} /></td>
                      <td className="px-4 py-3.5">
                        {job.status === "open" ? (
                          <FreshnessTag level={getJobAge(job.created_at)} />
                        ) : <span className="text-xs" style={{ color: "var(--muted-ink)", opacity: 0.4 }}>—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        {(() => {
                          const sig = getJobQualitySignal(job);
                          return sig.ok ? (
                            <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#2d6e4f" }}>
                              <span>✓</span> Complete
                            </span>
                          ) : (
                            <span className="text-xs font-medium flex items-center gap-1" style={{ color: "#c45e00" }}>
                              <span>⚠</span> {sig.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3.5">
                        <ActionMenu job={job} companySlug={company?.slug ?? ""} onEdit={() => { setEditJob(job); setPanelOpen(true); }}
                          onDelete={() => setDeleteTarget(job)} onStatusChange={s => handleStatusChange(job, s)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && displayed.length > 0 && (
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
                <p className="text-xs" style={{ color: "var(--muted-ink)" }}>
                  Showing <span className="font-semibold" style={{ color: "var(--ink)" }}>{displayed.length}</span> of <span className="font-semibold" style={{ color: "var(--ink)" }}>{jobs.length}</span> jobs
                </p>
                <button onClick={() => { setEditJob(null); setPanelOpen(true); }} className="text-xs font-semibold flex items-center gap-1 hover:opacity-70" style={{ color: "var(--ink)" }}>
                  <Plus className="h-3 w-3" />Add job
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Side panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-40" style={{ background: "rgba(30,35,48,0.3)" }} onClick={() => { setPanelOpen(false); setEditJob(null); }} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-50 shadow-2xl flex flex-col" style={{ background: "var(--surface)" }}>
            <JobForm job={editJob ?? undefined} onSubmit={handleFormSubmit} onClose={() => { setPanelOpen(false); setEditJob(null); }} />
          </div>
        </>
      )}

      {/* Delete dialog */}
      {deleteTarget && <DeleteDialog job={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} deleting={deleting} />}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast("")} />}
    </div>
  );
}
