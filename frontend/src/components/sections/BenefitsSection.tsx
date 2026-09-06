import { PreviewProps, InspectorProps } from "./registry";
import { SectionIcon } from "./SectionIcon";

// ─── PREVIEW ─────────────────────────────────────────────────────────────────

export function BenefitsPreview({ data }: PreviewProps) {
  const items: Array<{ icon: string; title: string; description: string }> =
    data.items || [];
  const eyebrow = data.eyebrow as string | undefined;

  return (
    <section
      id="benefits"
      className="w-full py-20 md:py-28 px-6 md:px-12"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header — left aligned, sparse */}
        <div className="mb-14 md:mb-16 max-w-2xl">
          {eyebrow && (
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: "var(--orange)" }}
            >
              {eyebrow}
            </p>
          )}
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {(data.title as string) || "Benefits & Perks"}
          </h2>
          {data.subtitle && (
            <p
              className="mt-3 text-base md:text-lg leading-relaxed"
              style={{ color: "var(--muted-ink)" }}
            >
              {data.subtitle as string}
            </p>
          )}
        </div>

        {/* Benefits — editorial grid, sparse typography, no heavy cards */}
        {items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {items.map((item, i) => (
              <div key={i} className="flex flex-col gap-2">
                {item.icon && (
                  <div
                    className="h-9 w-9 rounded-2xl flex items-center justify-center mb-1"
                    style={{ backgroundColor: "var(--orange-bg)" }}
                    aria-hidden="true"
                  >
                    <SectionIcon
                      icon={item.icon}
                      size={18}
                      style={{ color: "var(--orange)" }}
                    />
                  </div>
                )}
                <h3
                  className="font-bold text-base tracking-tight"
                  style={{ color: "var(--ink)" }}
                >
                  {item.title}
                </h3>
                {item.description && (
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted-ink)" }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 rounded-2xl text-sm"
            style={{
              border: "1.5px dashed var(--border-subtle)",
              color: "var(--muted-ink)",
            }}
          >
            Add your benefits and perks
          </div>
        )}
      </div>
    </section>
  );
}

// ─── INSPECTOR ────────────────────────────────────────────────────────────────
// PRESERVED EXACTLY

export function BenefitsInspector({ data, updateData }: InspectorProps) {
  const items: Array<{ icon: string; title: string; description: string }> =
    data.items || [];

  const updateItem = (index: number, field: string, val: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    updateData({ ...data, items: updated });
  };

  const addItem = () => {
    updateData({
      ...data,
      items: [...items, { icon: "✦", title: "New benefit", description: "" }],
    });
  };

  const removeItem = (index: number) => {
    updateData({ ...data, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Field label="Eyebrow text (optional)">
        <input
          type="text"
          value={data.eyebrow || ""}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          placeholder="Why join us"
          className={inputCls}
        />
      </Field>
      <Field label="Section title">
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          placeholder="Benefits & Perks"
          className={inputCls}
        />
      </Field>
      <Field label="Subtitle (optional)">
        <input
          type="text"
          value={data.subtitle || ""}
          onChange={(e) => updateData({ ...data, subtitle: e.target.value })}
          placeholder="We take care of our team."
          className={inputCls}
        />
      </Field>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Benefits
          </span>
          <button
            type="button"
            onClick={addItem}
            className="text-xs text-[oklch(0.6_0.15_250)] hover:underline font-medium"
          >
            + Add benefit
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={item.icon}
                  onChange={(e) => updateItem(i, "icon", e.target.value)}
                  placeholder="✦"
                  className={`${inputCls} w-12 text-center`}
                  aria-label="Icon/emoji"
                />
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(i, "title", e.target.value)}
                  placeholder="Benefit name"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-zinc-400 hover:text-red-500 text-xs px-1"
                  aria-label="Remove benefit"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={item.description}
                onChange={(e) =>
                  updateItem(i, "description", e.target.value)
                }
                placeholder="Short description..."
                className={inputCls}
              />
            </div>
          ))}
        </div>
      </div>
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
