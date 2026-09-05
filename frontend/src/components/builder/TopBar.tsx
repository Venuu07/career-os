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
        body: JSON.stringify({ sections_config: state.sections, theme_config: state.theme }),
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
        if (!saved) {
          throw new Error("Failed to save draft before publishing");
        }
      }
      const result = await apiFetch("/api/career-page/publish", { method: "POST" });
      const slug = result?.slug || company?.slug || "";
      setPublishedSlug(slug);
      // Re-init builder with the newly published draft
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

  const saveIndicator = () => {
    switch (state.saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-zinc-400">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Saved
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-red-500">
            <AlertCircle className="h-3 w-3" /> Save failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            {state.hasUnsavedChanges ? "Editing" : "Idle"}
          </span>
        );
    }
  };

  return (
    <>
      <header className="h-12 bg-white/95 dark:bg-zinc-950/95 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 shrink-0 z-20 backdrop-blur-sm">
        {/* Left: back + title + save status */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {company?.name ?? "Careers Page"}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <span className="text-xs">{saveIndicator()}</span>
          </div>
        </div>

        {/* Center: viewport switcher */}
        <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg">
          {(["desktop", "tablet", "mobile"] as const).map((vp) => (
            <button
              key={vp}
              type="button"
              className={`h-7 px-2.5 rounded-md flex items-center justify-center transition-colors ${
                state.viewport === vp
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
              onClick={() => dispatch({ type: "SET_VIEWPORT", payload: vp })}
              aria-label={vp}
              title={vp.charAt(0).toUpperCase() + vp.slice(1)}
            >
              {vp === "desktop" && <Monitor className="h-3.5 w-3.5" />}
              {vp === "tablet" && <Tablet className="h-3.5 w-3.5" />}
              {vp === "mobile" && <Smartphone className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>

        {/* Right: preview + publish */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-colors"
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
          >
            {state.isCandidatePreview ? (
              <>
                <EyeOff className="h-3.5 w-3.5" /> Exit Preview
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" /> Preview
              </>
            )}
          </button>
          
          <button
            type="button"
            className="h-8 px-4 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            onClick={saveDraft}
            disabled={!state.hasUnsavedChanges || state.saveStatus === "saving"}
          >
            Save Draft
          </button>

          <button
            type="button"
            className="h-8 px-4 rounded-lg text-xs font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            onClick={() => setIsPublishDialogOpen(true)}
          >
            Publish
          </button>
        </div>
      </header>

      {/* Publish Dialog */}
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
                  className="h-9 px-4 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  onClick={() => setIsPublishDialogOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="h-9 px-4 rounded-lg text-sm font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors disabled:opacity-50"
                >
                  {isPublishing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing...
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
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Published!
                </DialogTitle>
                <DialogDescription>
                  Your careers page is now live and visible to candidates.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-sm text-zinc-700 dark:text-zinc-300 break-all">
                /{publishedSlug}/careers
              </div>
              <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                <a
                  href={`/${publishedSlug}/careers`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> View Live
                </a>
                <button
                  type="button"
                  className="flex-1 h-9 rounded-lg text-sm font-semibold bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
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
