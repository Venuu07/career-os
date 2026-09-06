"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useBuilder } from "@/contexts/BuilderContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Monitor,
  Smartphone,
  Tablet,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Circle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function TopBar() {
  const { state, dispatch } = useBuilder();
  const { company } = useAuth();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const saveDraft = useCallback(async () => {
    if (state.saveStatus === "saving") return true;

    const currentRevision = state.localRevision;
    dispatch({ type: "SAVE_START" });
    try {
      await apiFetch("/api/career-page/draft", {
        method: "PUT",
        body: JSON.stringify({
          sections_config: state.sections,
          theme_config: state.theme,
        }),
      });
      dispatch({ type: "SAVE_SUCCESS", payload: { revision: currentRevision } });
      return true;
    } catch {
      dispatch({ type: "SAVE_ERROR" });
      return false;
    }
  }, [state.localRevision, state.sections, state.theme, state.saveStatus, dispatch]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      if (state.hasUnsavedChanges) {
        const saved = await saveDraft();
        if (!saved) throw new Error("Failed to save draft before publishing");
      }
      const result = await apiFetch("/api/career-page/publish", {
        method: "POST",
      });
      const slug = result?.slug || company?.slug || "";
      setPublishedSlug(slug);
      const draft = result?.draft_version;
      if (draft) {
        dispatch({
          type: "INIT",
          payload: {
            sections: draft.sections_config || [],
            theme: draft.theme_config || {},
          },
        });
      }
    } catch (err) {
      console.error("Publish failed", err);
    } finally {
      setIsPublishing(false);
    }
  };

  // ── Save indicator ─────────────────────────────────────────────────────────

  const renderSaveIndicator = () => {
    switch (state.saveStatus) {
      case "saving":
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--muted-ink)" }}
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        );
      case "saved":
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--green)" }}
          >
            <CheckCircle2 className="h-3 w-3" />
            Saved
          </span>
        );
      case "error":
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--orange)" }}
          >
            <AlertCircle className="h-3 w-3" />
            Save failed
          </span>
        );
      default:
        return (
          <span
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: state.hasUnsavedChanges ? "var(--orange)" : "var(--muted-ink)" }}
          >
            <Circle
              className="h-2 w-2"
              fill={state.hasUnsavedChanges ? "var(--orange)" : "var(--border-subtle)"}
              style={{ strokeWidth: 0 }}
            />
            {state.hasUnsavedChanges ? "Unsaved changes" : "No changes"}
          </span>
        );
    }
  };

  return (
    <>
      <header
        className="h-12 flex items-center justify-between px-4 shrink-0 z-20"
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* ── Left: back + breadcrumb + save status ─────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 transition-opacity hover:opacity-60 shrink-0"
            aria-label="Back to dashboard"
            style={{ color: "var(--muted-ink)" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <div
              className="h-5 w-5 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--ink)" }}
            >
              <span className="text-white text-[9px] font-bold">C</span>
            </div>
            <span
              className="text-sm font-semibold truncate max-w-32"
              style={{ color: "var(--ink)" }}
            >
              {company?.name ?? "Careers Page"}
            </span>
            <span style={{ color: "var(--border-subtle)" }}>/</span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--muted-ink)" }}
            >
              Builder
            </span>
          </div>

          <div
            className="hidden md:flex h-5 w-px shrink-0"
            style={{ backgroundColor: "var(--border-subtle)" }}
          />

          <div className="hidden md:block">
            {renderSaveIndicator()}
          </div>
        </div>

        {/* ── Center: viewport switcher ──────────────────────────────── */}
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-xl"
          style={{
            backgroundColor: "var(--canvas)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {(["desktop", "tablet", "mobile"] as const).map((vp) => {
            const isActive = state.viewport === vp;
            return (
              <button
                key={vp}
                type="button"
                className="h-7 w-7 rounded-lg flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? "var(--surface)" : "transparent",
                  color: isActive ? "var(--ink)" : "var(--muted-ink)",
                  boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
                onClick={() => dispatch({ type: "SET_VIEWPORT", payload: vp })}
                aria-label={vp}
                title={vp.charAt(0).toUpperCase() + vp.slice(1)}
              >
                {vp === "desktop" && <Monitor className="h-3.5 w-3.5" />}
                {vp === "tablet" && <Tablet className="h-3.5 w-3.5" />}
                {vp === "mobile" && <Smartphone className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>

        {/* ── Right: preview + save draft + publish ─────────────────── */}
        <div className="flex items-center gap-2">
          {/* Preview toggle */}
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium transition-all"
            style={{
              backgroundColor: state.isCandidatePreview
                ? "var(--green-bg)"
                : "var(--canvas)",
              color: state.isCandidatePreview ? "var(--ink)" : "var(--muted-ink)",
              border: `1.5px solid ${state.isCandidatePreview ? "var(--green)" : "var(--border-subtle)"}`,
            }}
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
          >
            {state.isCandidatePreview ? (
              <>
                <EyeOff className="h-3 w-3" /> Exit Preview
              </>
            ) : (
              <>
                <Eye className="h-3 w-3" /> Preview
              </>
            )}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            className="h-7 px-3 rounded-full text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--canvas)",
              color: "var(--ink)",
              border: "1.5px solid var(--border-subtle)",
            }}
            onClick={saveDraft}
            disabled={!state.hasUnsavedChanges || state.saveStatus === "saving"}
          >
            Save Draft
          </button>

          {/* Publish */}
          <button
            type="button"
            className="h-7 px-3.5 rounded-full text-xs font-semibold transition-all hover:opacity-88"
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--canvas)",
            }}
            onClick={() => setIsPublishDialogOpen(true)}
          >
            Publish
          </button>
        </div>
      </header>

      {/* ── Publish Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {!publishedSlug ? (
            <>
              <DialogHeader>
                <DialogTitle>Publish Careers Page</DialogTitle>
                <DialogDescription>
                  This will make your latest draft changes live. Candidates will
                  immediately see the updated content.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <button
                  type="button"
                  className="h-9 px-4 rounded-full text-sm font-medium transition-all hover:opacity-70"
                  style={{
                    border: "1.5px solid var(--border-subtle)",
                    color: "var(--muted-ink)",
                  }}
                  onClick={() => setIsPublishDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="h-9 px-4 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "var(--ink)",
                    color: "var(--canvas)",
                  }}
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Publishing…
                    </span>
                  ) : (
                    "Publish to Live"
                  )}
                </button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2
                    className="h-5 w-5"
                    style={{ color: "var(--green)" }}
                  />
                  Published!
                </DialogTitle>
                <DialogDescription>
                  Your careers page is now live and visible to candidates.
                </DialogDescription>
              </DialogHeader>
              <div
                className="mt-2 p-3 rounded-xl font-mono text-sm break-all"
                style={{
                  backgroundColor: "var(--green-bg)",
                  border: "1px solid var(--green)",
                  color: "var(--ink)",
                }}
              >
                /{publishedSlug}/careers
              </div>
              <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                <a
                  href={`/${publishedSlug}/careers`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all hover:opacity-70"
                  style={{
                    border: "1.5px solid var(--border-subtle)",
                    color: "var(--ink)",
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Live
                </a>
                <button
                  type="button"
                  className="flex-1 h-9 rounded-full text-sm font-semibold transition-all hover:opacity-88"
                  style={{
                    backgroundColor: "var(--ink)",
                    color: "var(--canvas)",
                  }}
                  onClick={() => {
                    setIsPublishDialogOpen(false);
                    setPublishedSlug(null);
                  }}
                >
                  Continue Editing
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
