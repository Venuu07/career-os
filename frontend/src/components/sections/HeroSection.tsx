import { PreviewProps, InspectorProps } from "./registry";

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function HeroPreview({ data, theme }: PreviewProps) {
  const bgColor = theme.background_color || "var(--color-surface)";
  const primaryColor = theme.primary_color || "oklch(0.15 0 0)";
  const alignment = data.alignment || "center";

  const alignClass =
    alignment === "left"
      ? "text-left items-start"
      : alignment === "right"
      ? "text-right items-end"
      : "text-center items-center";

  return (
    <div
      className={`w-full py-28 px-6 md:px-12 flex flex-col ${alignClass} border-b border-zinc-100 dark:border-zinc-900`}
      style={{ backgroundColor: bgColor }}
    >
      <div className={`max-w-4xl w-full ${alignment === "center" ? "mx-auto" : ""}`}>
        {data.eyebrow && (
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-5"
            style={{ color: primaryColor }}
          >
            {data.eyebrow}
          </p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.05]">
          {data.headline || "Join our mission"}
        </h1>
        {data.subheadline && (
          <p className="mt-6 text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {data.subheadline}
          </p>
        )}
        {data.ctaText && (
          <a
            href={data.ctaUrl || "#jobs"}
            className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-sm transition-opacity hover:opacity-90 shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// INSPECTOR
// ————————————————————————————————————————

export function HeroInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <Field label="Eyebrow text (optional)">
        <input
          type="text"
          value={data.eyebrow || ""}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          placeholder="We're hiring"
          className={inputCls}
        />
      </Field>
      <Field label="Headline">
        <input
          type="text"
          value={data.headline || ""}
          onChange={(e) => updateData({ ...data, headline: e.target.value })}
          placeholder="Join our mission"
          className={inputCls}
        />
      </Field>
      <Field label="Subheadline">
        <textarea
          value={data.subheadline || ""}
          onChange={(e) => updateData({ ...data, subheadline: e.target.value })}
          rows={3}
          placeholder="Build the future with us."
          className={inputCls}
        />
      </Field>
      <Field label="CTA button text">
        <input
          type="text"
          value={data.ctaText || ""}
          onChange={(e) => updateData({ ...data, ctaText: e.target.value })}
          placeholder="View Open Roles"
          className={inputCls}
        />
      </Field>
      <Field label="CTA URL (default: #jobs)">
        <input
          type="text"
          value={data.ctaUrl || ""}
          onChange={(e) => updateData({ ...data, ctaUrl: e.target.value })}
          placeholder="#jobs"
          className={inputCls}
        />
      </Field>
      <Field label="Alignment">
        <select
          value={data.alignment || "center"}
          onChange={(e) => updateData({ ...data, alignment: e.target.value as "left" | "center" | "right" })}
          className={inputCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
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
