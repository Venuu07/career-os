import { PreviewProps, InspectorProps } from "./registry";

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function CulturePreview({ data }: PreviewProps) {
  const values: Array<{ icon: string; title: string; description: string }> =
    data.values || [];

  return (
    <div className="w-full py-20 px-6 md:px-12 bg-white dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          {data.eyebrow && (
            <p className="text-xs font-semibold tracking-widest uppercase text-[oklch(0.6_0.15_250)] mb-3">
              {data.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {data.title || "Life at the company"}
          </h2>
          {data.introduction && (
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {data.introduction}
            </p>
          )}
        </div>

        {values.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
              >
                {v.icon && (
                  <div className="text-2xl mb-3" aria-hidden="true">
                    {v.icon}
                  </div>
                )}
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {v.title}
                </h3>
                {v.description && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {v.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// INSPECTOR
// ————————————————————————————————————————

export function CultureInspector({ data, updateData }: InspectorProps) {
  const values: Array<{ icon: string; title: string; description: string }> =
    data.values || [];

  const updateValue = (index: number, field: string, val: string) => {
    const updated = values.map((v, i) =>
      i === index ? { ...v, [field]: val } : v
    );
    updateData({ ...data, values: updated });
  };

  const addValue = () => {
    updateData({
      ...data,
      values: [...values, { icon: "✦", title: "New value", description: "" }],
    });
  };

  const removeValue = (index: number) => {
    updateData({ ...data, values: values.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Field label="Eyebrow text (optional)">
        <input
          type="text"
          value={data.eyebrow || ""}
          onChange={(e) => updateData({ ...data, eyebrow: e.target.value })}
          placeholder="Our culture"
          className={inputCls}
        />
      </Field>
      <Field label="Section title">
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          placeholder="Life at the company"
          className={inputCls}
        />
      </Field>
      <Field label="Introduction">
        <textarea
          value={data.introduction || ""}
          onChange={(e) => updateData({ ...data, introduction: e.target.value })}
          rows={3}
          placeholder="Describe your culture..."
          className={inputCls}
        />
      </Field>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Culture values
          </span>
          <button
            type="button"
            onClick={addValue}
            className="text-xs text-[oklch(0.6_0.15_250)] hover:underline font-medium"
          >
            + Add value
          </button>
        </div>
        <div className="space-y-3">
          {values.map((v, i) => (
            <div
              key={i}
              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={v.icon}
                  onChange={(e) => updateValue(i, "icon", e.target.value)}
                  placeholder="✦"
                  className={`${inputCls} w-12 text-center`}
                  aria-label="Icon/emoji"
                />
                <input
                  type="text"
                  value={v.title}
                  onChange={(e) => updateValue(i, "title", e.target.value)}
                  placeholder="Value name"
                  className={`${inputCls} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => removeValue(i)}
                  className="text-zinc-400 hover:text-red-500 text-xs px-1"
                  aria-label="Remove value"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={v.description}
                onChange={(e) => updateValue(i, "description", e.target.value)}
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

// Shared helpers
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
