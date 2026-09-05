import { PreviewProps, InspectorProps } from "./registry";

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function CustomPreview({ data }: PreviewProps) {
  const alignment = data.alignment || "left";
  const alignClass =
    alignment === "center"
      ? "text-center items-center"
      : alignment === "right"
      ? "text-right items-end"
      : "text-left items-start";

  return (
    <div className="w-full py-20 px-6 md:px-12 bg-white dark:bg-zinc-950">
      <div className={`max-w-3xl mx-auto flex flex-col ${alignClass}`}>
        {data.heading && (
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
            {data.heading}
          </h2>
        )}
        {data.body && (
          <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
            {data.body}
          </div>
        )}
        {data.ctaText && data.ctaUrl && (
          <a
            href={data.ctaUrl}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-medium text-sm hover:bg-zinc-900 hover:text-white dark:hover:bg-zinc-100 dark:hover:text-zinc-900 transition-colors"
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

export function CustomInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <input
          type="text"
          value={data.heading || ""}
          onChange={(e) => updateData({ ...data, heading: e.target.value })}
          placeholder="Section heading"
          className={inputCls}
        />
      </Field>
      <Field label="Body content">
        <textarea
          value={data.body || ""}
          onChange={(e) => updateData({ ...data, body: e.target.value })}
          rows={6}
          placeholder="Write your custom content here..."
          className={inputCls}
        />
      </Field>
      <Field label="Text alignment">
        <select
          value={data.alignment || "left"}
          onChange={(e) => updateData({ ...data, alignment: e.target.value as "left" | "center" | "right" })}
          className={inputCls}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </Field>
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <p className="text-xs text-zinc-400 mb-3 uppercase tracking-wider font-medium">
          Optional CTA
        </p>
        <Field label="CTA button text">
          <input
            type="text"
            value={data.ctaText || ""}
            onChange={(e) => updateData({ ...data, ctaText: e.target.value })}
            placeholder="Learn more"
            className={inputCls}
          />
        </Field>
        <Field label="CTA URL">
          <input
            type="url"
            value={data.ctaUrl || ""}
            onChange={(e) => updateData({ ...data, ctaUrl: e.target.value })}
            placeholder="https://..."
            className={inputCls}
          />
        </Field>
      </div>
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
