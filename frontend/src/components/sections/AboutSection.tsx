import { PreviewProps, InspectorProps } from "./registry";

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function AboutPreview({ data }: PreviewProps) {
  const layout = data.layout || "text-only";

  return (
    <div className="w-full py-20 px-6 md:px-12 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        {layout === "text-image" && data.imageUrl ? (
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {data.eyebrow && (
                <p className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.6_0.15_250)] mb-4">
                  {data.eyebrow}
                </p>
              )}
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
                {data.title || "Our Story"}
              </h2>
              <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {data.content || "Tell your company story here."}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl}
                alt={data.imageAlt || "About us"}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            {data.eyebrow && (
              <p className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.6_0.15_250)] mb-4">
                {data.eyebrow}
              </p>
            )}
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
              {data.title || "Our Story"}
            </h2>
            <div className="text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap text-lg">
              {data.content || "Tell your company story here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// INSPECTOR
// ————————————————————————————————————————

export function AboutInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <Field label="Eyebrow text (optional)">
        <input
          type="text"
          value={data.eyebrow || ""}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          placeholder="About us"
          className={inputCls}
        />
      </Field>
      <Field label="Title">
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          placeholder="Our Story"
          className={inputCls}
        />
      </Field>
      <Field label="Content">
        <textarea
          value={data.content || ""}
          onChange={(e) => updateData({ ...data, content: e.target.value })}
          rows={6}
          placeholder="We are a team of builders..."
          className={inputCls}
        />
      </Field>
      <Field label="Layout">
        <select
          value={data.layout || "text-only"}
          onChange={(e) => updateData({ ...data, layout: e.target.value })}
          className={inputCls}
        >
          <option value="text-only">Text only</option>
          <option value="text-image">Text + Image</option>
        </select>
      </Field>
      {(data.layout === "text-image") && (
        <>
          <Field label="Image URL">
            <input
              type="url"
              value={data.imageUrl || ""}
              onChange={(e) => updateData({ ...data, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
          </Field>
          <Field label="Image alt text">
            <input
              type="text"
              value={data.imageAlt || ""}
              onChange={(e) => updateData({ ...data, imageAlt: e.target.value })}
              placeholder="Our team at the office"
              className={inputCls}
            />
          </Field>
        </>
      )}
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
