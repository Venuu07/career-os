import { JobResponse } from "@/lib/types";

type Status = JobResponse["status"];

const CONFIG: Record<
  Status,
  { label: string; bg: string; color: string; dot: string }
> = {
  open: {
    label: "Open",
    bg: "rgba(169,203,183,0.25)",
    color: "#2d6e4f",
    dot: "#A9CBB7",
  },
  draft: {
    label: "Draft",
    bg: "rgba(255,147,79,0.15)",
    color: "#a84f00",
    dot: "#FF934F",
  },
  closed: {
    label: "Closed",
    bg: "rgba(118,118,117,0.12)",
    color: "#767675",
    dot: "#767675",
  },
};

export function JobStatusBadge({ status }: { status: Status }) {
  const c = CONFIG[status] ?? CONFIG.closed;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: c.dot }}
      />
      {c.label}
    </span>
  );
}
