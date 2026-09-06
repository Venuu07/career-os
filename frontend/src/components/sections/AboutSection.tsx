import { PreviewProps, InspectorProps } from "./registry";

// ─── PREVIEW ─────────────────────────────────────────────────────────────────

export function AboutPreview({ data }: PreviewProps) {
  const layout = data.layout || "text-only";
  const title = (data.title as string) || "Our Story";
  const content = (data.content as string) || "Tell your company story here.";
  const eyebrow = data.eyebrow as string | undefined;

  return (
    <section className="w-full py-20 md:py-28 px-6 md:px-12" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        {layout === "text-image" && data.imageUrl ? (
          /* Split: strong headline left, image right */
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              {eyebrow && (
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: "var(--green)" }}
                >
                  {eyebrow}
                </p>
              )}
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-6"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h2>
              <div
                className="text-base leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--muted-ink)" }}
              >
                {content}
              </div>
            </div>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.imageUrl as string}
                alt={(data.imageAlt as string) || "About us"}
                className="w-full h-72 md:h-80 object-cover"
              />
            </div>
          </div>
        ) : (
          /* Text-only: offset layout — eyebrow+title left, content right */
          <div className="grid md:grid-cols-5 gap-10 md:gap-16">
            <div className="md:col-span-2">
              {eyebrow && (
                <p
                  className="text-xs font-semibold tracking-widest uppercase mb-4"
                  style={{ color: "var(--green)" }}
                >
                  {eyebrow}
                </p>
              )}
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
                style={{ color: "var(--ink)" }}
              >
                {title}
              </h2>
            </div>
            <div className="md:col-span-3 flex items-start pt-1">
              <div
                className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--muted-ink)" }}
              >
                {content}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── INSPECTOR ────────────────────────────────────────────────────────────────
// PRESERVED EXACTLY

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
          onChange={(e) =>
            updateData({
              ...data,
              layout: e.target.value as "text-only" | "text-image",
            })
          }
          className={inputCls}
        >
          <option value="text-only">Text only</option>
          <option value="text-image">Text + Image</option>
        </select>
      </Field>
      {data.layout === "text-image" && (
        <>
          <Field label="Image URL">
            <input
              type="url"
              value={data.imageUrl || ""}
              onChange={(e) =>
                updateData({ ...data, imageUrl: e.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              className={inputCls}
            />
          </Field>
          <Field label="Image alt text">
            <input
              type="text"
              value={data.imageAlt || ""}
              onChange={(e) =>
                updateData({ ...data, imageAlt: e.target.value })
              }
              placeholder="Our team at the office"
              className={inputCls}
            />
          </Field>
        </>
      )}
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
