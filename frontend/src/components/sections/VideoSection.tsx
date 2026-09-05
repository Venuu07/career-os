import { PreviewProps, InspectorProps } from "./registry";

// ————————————————————————————————————————
// Helpers
// ————————————————————————————————————————

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// ————————————————————————————————————————
// PREVIEW
// ————————————————————————————————————————

export function VideoPreview({ data }: PreviewProps) {
  const embedUrl = getEmbedUrl(data.videoUrl || "");

  return (
    <div className="w-full py-20 px-6 md:px-12 bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        {(data.title || data.description) && (
          <div className="mb-10 text-center">
            {data.title && (
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {data.title}
              </h2>
            )}
            {data.description && (
              <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {embedUrl ? (
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg bg-black">
            <div className="aspect-video">
              <iframe
                src={embedUrl}
                title={data.title || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center">
            <div className="text-center text-zinc-400">
              <div className="text-3xl mb-2">▶</div>
              <p className="text-sm">
                {data.videoUrl ? "Invalid video URL" : "Add a YouTube or Vimeo URL"}
              </p>
            </div>
          </div>
        )}

        {data.caption && (
          <p className="mt-4 text-center text-sm text-zinc-400 dark:text-zinc-500">
            {data.caption}
          </p>
        )}
      </div>
    </div>
  );
}

// ————————————————————————————————————————
// INSPECTOR
// ————————————————————————————————————————

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
          onChange={(e) => updateData({ ...data, description: e.target.value })}
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
