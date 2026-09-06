import { PreviewProps, InspectorProps } from "./registry";

// ─── Type helpers ─────────────────────────────────────────────────────────────

type ImagePosition = "left" | "right";
type ImageWidth    = "compact" | "balanced" | "large";
type ImageValign   = "top" | "center";

// Map imageWidth → Tailwind grid column split (text-cols / image-cols)
function widthCols(w: ImageWidth): { text: string; img: string } {
  switch (w) {
    case "compact":  return { text: "md:col-span-3", img: "md:col-span-2" };
    case "large":    return { text: "md:col-span-2", img: "md:col-span-3" };
    case "balanced":
    default:         return { text: "md:col-span-2", img: "md:col-span-2" };
  }
}

// ─── PREVIEW ─────────────────────────────────────────────────────────────────

export function AboutPreview({ data }: PreviewProps) {
  const layout       = (data.layout        as string)        || "text-only";
  const title        = (data.title         as string)        || "Our Story";
  const content      = (data.content       as string)        || "Tell your company story here.";
  const eyebrow      = data.eyebrow        as string | undefined;
  const imageUrl     = data.imageUrl       as string | undefined;
  const imageAlt     = (data.imageAlt      as string)        || "About us";
  const position     = (data.imagePosition as ImagePosition) || "right";
  const width        = (data.imageWidth    as ImageWidth)    || "balanced";
  const valign       = (data.imageValign   as ImageValign)   || "top";

  const { text: textCols, img: imgCols } = widthCols(width);
  const valignClass = valign === "center" ? "items-center" : "items-start";
  const isImageLayout = layout === "text-image" && imageUrl;

  const TextBlock = (
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
  );

  const ImageBlock = imageUrl ? (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ border: "1px solid var(--border-subtle)" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-72 md:h-80 object-cover"
      />
    </div>
  ) : null;

  return (
    <section
      id="about"
      className="w-full py-20 md:py-28 px-6 md:px-12"
      style={{ backgroundColor: "#FFFFFF" }}
    >
      <div className="max-w-5xl mx-auto">
        {isImageLayout ? (
          /* Text + Image split — position / width configurable */
          <div
            className={`grid md:grid-cols-4 gap-12 md:gap-16 ${valignClass}`}
          >
            {position === "right" ? (
              <>
                <div className={textCols}>{TextBlock}</div>
                <div className={imgCols}>{ImageBlock}</div>
              </>
            ) : (
              <>
                <div className={imgCols}>{ImageBlock}</div>
                <div className={textCols}>{TextBlock}</div>
              </>
            )}
          </div>
        ) : (
          /* Text-only: offset 2+3 column editorial layout */
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

export function AboutInspector({ data, updateData }: InspectorProps) {
  const isImageLayout = data.layout === "text-image";

  return (
    <div className="space-y-4">
      {/* ── Core content ──────────────────────────────────────────────── */}
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

      {/* ── Layout ───────────────────────────────────────────────────── */}
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

      {/* ── Media config — only shown when text-image ─────────────── */}
      {isImageLayout && (
        <>
          <SectionDivider label="Media" />

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

          <Field label="Alt text">
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

          {/* Position — segmented button group */}
          <Field label="Image position">
            <SegmentedControl
              value={(data.imagePosition as string) || "right"}
              options={[
                { label: "Left", value: "left" },
                { label: "Right", value: "right" },
              ]}
              onChange={(v) =>
                updateData({ ...data, imagePosition: v as "left" | "right" })
              }
            />
          </Field>

          {/* Width */}
          <Field label="Image width">
            <SegmentedControl
              value={(data.imageWidth as string) || "balanced"}
              options={[
                { label: "Compact", value: "compact" },
                { label: "Balanced", value: "balanced" },
                { label: "Large", value: "large" },
              ]}
              onChange={(v) =>
                updateData({ ...data, imageWidth: v as "compact" | "balanced" | "large" })
              }
            />
          </Field>

          {/* Vertical alignment */}
          <Field label="Vertical alignment">
            <SegmentedControl
              value={(data.imageValign as string) || "top"}
              options={[
                { label: "Top", value: "top" },
                { label: "Center", value: "center" },
              ]}
              onChange={(v) =>
                updateData({ ...data, imageValign: v as "top" | "center" })
              }
            />
          </Field>
        </>
      )}
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

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

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--muted-ink)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--border-subtle)" }} />
    </div>
  );
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex p-0.5 rounded-xl gap-0.5"
      style={{
        backgroundColor: "var(--canvas)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
          style={{
            backgroundColor: value === opt.value ? "var(--surface)" : "transparent",
            color: value === opt.value ? "var(--ink)" : "var(--muted-ink)",
            boxShadow: value === opt.value ? "0 1px 3px rgba(30,35,48,0.08)" : "none",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[oklch(0.6_0.15_250)] transition";
