import { AmbientRings } from "@/components/AmbientRings";
import { PreviewProps, InspectorProps } from "./registry";

// ─── PREVIEW ─────────────────────────────────────────────────────────────────

export function HeroPreview({ data, theme }: PreviewProps) {
  const bgColor = theme.background_color || "#F3F3F1";
  const primaryColor = theme.primary_color || "#1E2330";
  const headline = data.headline || "Come build with us.";
  const sub = data.subheadline || "We're a team obsessed with craft. Join us to solve hard problems and ship products people love.";
  const ctaText = data.ctaText || "Browse open roles";
  const ctaUrl = String(data.ctaUrl || "#jobs");
  const eyebrow = data.eyebrow as string | undefined;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Ambient rings — top-right position */}
      <div
        className="absolute -top-32 -right-32 pointer-events-none select-none"
        aria-hidden="true"
      >
        <AmbientRings
          color={primaryColor}
          ringCount={6}
          baseRadius={180}
          gap={70}
          opacity={0.10}
        />
      </div>
      {/* Second ring cluster — bottom-left */}
      <div
        className="absolute -bottom-48 -left-48 pointer-events-none select-none"
        aria-hidden="true"
      >
        <AmbientRings
          color="#E9C0E9"
          ringCount={4}
          baseRadius={160}
          gap={60}
          opacity={0.13}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 md:px-12 py-24 md:py-36">
        {/* Editorial split: headline left, narrative right on desktop */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-end">
          {/* Left: large headline */}
          <div>
            {eyebrow && (
              <p
                className="text-xs font-semibold tracking-widest uppercase mb-5"
                style={{ color: primaryColor, opacity: 0.6 }}
              >
                {eyebrow}
              </p>
            )}
            <h1
              className="text-[2.6rem] md:text-[3.5rem] lg:text-[4rem] font-extrabold leading-[1.02] tracking-tight"
              style={{ color: primaryColor }}
            >
              {headline}
            </h1>
          </div>

          {/* Right: sub-copy + CTA */}
          <div className="flex flex-col items-start gap-7 md:pb-2">
            <p
              className="text-base md:text-lg leading-relaxed max-w-md"
              style={{ color: primaryColor, opacity: 0.65 }}
            >
              {sub}
            </p>
            {ctaText && (
              <a
                href={ctaUrl}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-opacity hover:opacity-80"
                style={{ backgroundColor: primaryColor, color: bgColor }}
              >
                {ctaText}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 7h9m-4-4 4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Thin separator line at bottom */}
        <div
          className="mt-20 h-px w-full"
          style={{ backgroundColor: primaryColor, opacity: 0.08 }}
        />
      </div>
    </section>
  );
}

// ─── INSPECTOR ────────────────────────────────────────────────────────────────
// PRESERVED EXACTLY — no changes to Inspector bindings

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
          onChange={(e) =>
            updateData({
              ...data,
              alignment: e.target.value as "left" | "center" | "right",
            })
          }
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
