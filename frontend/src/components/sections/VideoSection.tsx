import { PreviewProps, InspectorProps } from "./registry";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// ─── PREVIEW ─────────────────────────────────────────────────────────────────

export function VideoPreview({ data }: PreviewProps) {
  const embedUrl = getEmbedUrl((data.videoUrl as string) || "");

  return (
    <section
      className="w-full py-20 md:py-28 px-6 md:px-12"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {(data.title || data.description) && (
          <div className="mb-10 max-w-2xl">
            {data.title && (
              <h2
                className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight mb-3"
                style={{ color: "var(--ink)" }}
              >
                {data.title as string}
              </h2>
            )}
            {data.description && (
              <p
                className="text-base md:text-lg leading-relaxed"
                style={{ color: "var(--muted-ink)" }}
              >
                {data.description as string}
              </p>
            )}
          </div>
        )}

        {/* Media area */}
        {embedUrl ? (
          <div
            className="relative w-full rounded-3xl overflow-hidden shadow-xl"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div className="aspect-video bg-black">
              <iframe
                src={embedUrl}
                title={(data.title as string) || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          /* Intentional editorial empty state */
          <div
            className="aspect-video rounded-3xl flex flex-col items-center justify-center text-center p-8"
            style={{
              backgroundColor: "var(--surface)",
              border: "1.5px dashed var(--border-subtle)",
            }}
          >
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ backgroundColor: "var(--canvas)" }}
              aria-hidden="true"
            >
              ▶
            </div>
            <p
              className="font-semibold text-base mb-1"
              style={{ color: "var(--ink)" }}
            >
              {data.videoUrl ? "Invalid video URL" : "Life at the company"}
            </p>
            <p
              className="text-sm max-w-xs"
              style={{ color: "var(--muted-ink)" }}
            >
              {data.videoUrl
                ? "Please enter a valid YouTube or Vimeo URL."
                : "Add a YouTube or Vimeo URL to show your team and culture."}
            </p>
          </div>
        )}

        {/* Caption */}
        {data.caption && (
          <p
            className="mt-4 text-center text-sm"
            style={{ color: "var(--muted-ink)" }}
          >
            {data.caption as string}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── INSPECTOR ────────────────────────────────────────────────────────────────
// PRESERVED EXACTLY

export function VideoInspector({ data, updateData }: InspectorProps) {
  return (
    <div className="space-y-4">
      <Field label="Section title (optional)">
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => updateData({ ...data, title: e.target.value })}
          placeholder="See us in action"
          className={inputCls}
        />
      </Field>
      <Field label="Description (optional)">
        <textarea
          value={data.description || ""}
          onChange={(e) =>
            updateData({ ...data, description: e.target.value })
          }
          rows={2}
          placeholder="A short intro to the video..."
          className={inputCls}
        />
      </Field>
      <Field label="YouTube or Vimeo URL">
        <input
          type="url"
          value={data.videoUrl || ""}
          onChange={(e) => updateData({ ...data, videoUrl: e.target.value })}
          placeholder="https://youtube.com/watch?v=..."
          className={inputCls}
        />
        <p className="text-xs text-zinc-400 mt-1">
          Supports YouTube and Vimeo links.
        </p>
      </Field>
      <Field label="Caption (optional)">
        <input
          type="text"
          value={data.caption || ""}
          onChange={(e) => updateData({ ...data, caption: e.target.value })}
          placeholder="A day in the life at Acme"
          className={inputCls}
        />
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
