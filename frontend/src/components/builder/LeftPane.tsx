"use client";

import { useBuilder } from "@/contexts/BuilderContext";
import { sectionRegistry } from "@/components/sections/registry";
import { ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Circle, ExternalLink, Settings } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function LeftPane() {
  const { state, dispatch } = useBuilder();
  const { company } = useAuth();

  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Sort sections by order for display
  const sortedSections = [...state.sections].sort((a, b) => a.order - b.order);

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
    setPublishError(null);
    try {
      if (state.hasUnsavedChanges) {
        const saved = await saveDraft();
        if (!saved) throw new Error("Failed to save draft before publishing");
      }
      const result = await apiFetch("/api/career-page/publish", { method: "POST" });
      const slug = result?.slug || company?.slug || "";
      setPublishedSlug(slug);
      const draft = result?.draft_version;
      if (draft) {
        dispatch({
          type: "INIT",
          payload: { sections: draft.sections_config || [], theme: draft.theme_config || {} },
        });
      }
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : "Publish failed. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const renderSaveIndicator = () => {
    switch (state.saveStatus) {
      case "saving":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--muted-ink)" }}>
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        );
      case "saved":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--green)" }}>
            <CheckCircle2 className="h-3 w-3" /> Saved
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--orange)" }}>
            <AlertCircle className="h-3 w-3" /> Save failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: state.hasUnsavedChanges ? "var(--orange)" : "var(--muted-ink)" }}>
            <Circle className="h-2 w-2" fill={state.hasUnsavedChanges ? "var(--orange)" : "var(--border-subtle)"} style={{ strokeWidth: 0 }} />
            {state.hasUnsavedChanges ? "Unsaved" : "Up to date"}
          </span>
        );
    }
  };

  return (
    <div
      className="w-72 shrink-0 flex flex-col h-full overflow-hidden"
      style={{
        backgroundColor: "var(--surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Section list (CAREERS PAGE) ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="px-5 py-4 shrink-0">
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--muted-ink)" }}>
            Careers Page
          </span>
        </div>
        
        <div className="px-3 pb-4 space-y-0.5 flex-1">
          {sortedSections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <p className="text-xs font-medium" style={{ color: "var(--muted-ink)" }}>No sections yet</p>
            </div>
          ) : (
            sortedSections.map((section, index) => {
              const isSelected = state.selectedSectionId === section.id;
              const def = sectionRegistry[section.type];

              return (
                <div
                  key={section.id}
                  className="group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all"
                  style={{
                    backgroundColor: isSelected ? "var(--canvas)" : "transparent",
                    border: `1px solid ${isSelected ? "var(--border-subtle)" : "transparent"}`,
                    boxShadow: isSelected ? "0 2px 4px rgba(0,0,0,0.02)" : "none",
                    opacity: section.visible ? 1 : 0.45,
                  }}
                  onClick={() => dispatch({ type: "SELECT_SECTION", payload: section.id })}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-[10px] font-mono mt-0.5 font-bold" style={{ color: "var(--muted-ink)", opacity: 0.6 }}>
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>
                        {def?.label ?? section.type}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: "var(--muted-ink)" }}>
                        {def?.description?.split(".")[0] || section.type}
                      </span>
                    </div>
                  </div>

                  {/* Controls — show on hover or when selected */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-[var(--surface)] transition-colors"
                        style={{ color: "var(--muted-ink)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "UPDATE_SECTION", payload: { id: section.id, data: { visible: !section.visible } } });
                        }}
                        title={section.visible ? "Hide" : "Show"}
                      >
                        {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-[var(--surface)] transition-colors"
                        style={{ color: "var(--orange)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "REMOVE_SECTION", payload: section.id });
                        }}
                        title="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-[var(--surface)] transition-colors disabled:opacity-20"
                        style={{ color: "var(--muted-ink)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "REORDER_SECTION", payload: { id: section.id, direction: "up" } });
                        }}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded-md hover:bg-[var(--surface)] transition-colors disabled:opacity-20"
                        style={{ color: "var(--muted-ink)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch({ type: "REORDER_SECTION", payload: { id: section.id, direction: "down" } });
                        }}
                        disabled={index === sortedSections.length - 1}
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* ── Add Section ─────────────────────────────────────────────────── */}
          <div className="pt-2 px-1">
            <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
              <DialogTrigger render={
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors border border-dashed"
                  style={{ borderColor: "var(--border-subtle)", color: "var(--ink)", backgroundColor: "rgba(255,255,255,0.4)" }}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs font-semibold">Add section</span>
                </button>
              } />
              <DialogContent className="sm:max-w-2xl" style={{ backgroundColor: "var(--canvas)" }}>
                <DialogHeader>
                  <DialogTitle>Add a section</DialogTitle>
                  <DialogDescription>Choose a content template to add to your careers page.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-4">
                  {Object.values(sectionRegistry).map((def) => (
                    <button
                      key={def.type}
                      className="flex flex-col text-left p-4 rounded-xl border transition-all hover:shadow-sm"
                      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
                      onClick={() => {
                        dispatch({ type: "ADD_SECTION", payload: { type: def.type, defaultData: def.defaultData } });
                        setIsAddSectionOpen(false);
                      }}
                    >
                      <span className="text-xl mb-2">{def.icon}</span>
                      <span className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>{def.label}</span>
                      <span className="text-xs" style={{ color: "var(--muted-ink)" }}>{def.description}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* ── PAGE Settings ──────────────────────────────────────────────── */}
      <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <span className="text-[10px] font-bold tracking-widest uppercase mb-3 block" style={{ color: "var(--muted-ink)" }}>
          Page
        </span>
        <div className="space-y-1">
          <Link href="/dashboard/branding" className="flex items-center justify-between text-sm font-semibold py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--canvas)] transition-colors" style={{ color: "var(--ink)" }}>
            Theme <Settings className="h-3.5 w-3.5 opacity-50" />
          </Link>
          <Link href="/dashboard/branding" className="flex items-center justify-between text-sm font-semibold py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--canvas)] transition-colors" style={{ color: "var(--ink)" }}>
            SEO <Settings className="h-3.5 w-3.5 opacity-50" />
          </Link>
          <Link href="/dashboard/branding" className="flex items-center justify-between text-sm font-semibold py-1.5 px-2 -mx-2 rounded-lg hover:bg-[var(--canvas)] transition-colors" style={{ color: "var(--ink)" }}>
            Social links <Settings className="h-3.5 w-3.5 opacity-50" />
          </Link>
        </div>
      </div>

      {/* ── PUBLISHING ─────────────────────────────────────────────────── */}
      <div className="px-5 py-4 shrink-0" style={{ backgroundColor: "var(--canvas)", borderTop: "1px solid var(--border-subtle)" }}>
        <span className="text-[10px] font-bold tracking-widest uppercase mb-3 block" style={{ color: "var(--muted-ink)" }}>
          Publishing
        </span>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Draft status</span>
          {renderSaveIndicator()}
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            style={{
              backgroundColor: state.isCandidatePreview ? "var(--green-bg)" : "var(--surface)",
              color: state.isCandidatePreview ? "var(--ink)" : "var(--ink)",
              border: `1.5px solid ${state.isCandidatePreview ? "var(--green)" : "var(--border-subtle)"}`,
            }}
            onClick={() => dispatch({ type: "TOGGLE_PREVIEW" })}
          >
            {state.isCandidatePreview ? <><EyeOff className="h-3.5 w-3.5" /> Exit Preview</> : <><Eye className="h-3.5 w-3.5" /> Preview</>}
          </button>
          
          <button
            type="button"
            className="flex-1 h-8 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}
            onClick={() => setIsPublishDialogOpen(true)}
          >
            Publish
          </button>
        </div>
      </div>

      {/* ── Publish Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isPublishDialogOpen} onOpenChange={(open) => { setIsPublishDialogOpen(open); if (!open) { setPublishError(null); setPublishedSlug(null); } }}>
        <DialogContent className="sm:max-w-md">
          {!publishedSlug ? (
            <>
              <DialogHeader>
                <DialogTitle>Publish Careers Page</DialogTitle>
                <DialogDescription>This will make your latest draft changes live. Candidates will immediately see the updated content.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4 flex-col gap-2">
                {publishError && <p className="text-xs text-center px-2 py-2 rounded-xl" style={{ backgroundColor: "rgba(224,74,0,0.08)", color: "#e04a00" }}>{publishError}</p>}
                <div className="flex gap-2">
                  <button type="button" className="h-9 px-4 rounded-full text-sm font-medium transition-all" style={{ border: "1.5px solid var(--border-subtle)", color: "var(--muted-ink)" }} onClick={() => setIsPublishDialogOpen(false)}>Cancel</button>
                  <button type="button" onClick={handlePublish} disabled={isPublishing} className="h-9 px-4 rounded-full text-sm font-semibold transition-all" style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }}>
                    {isPublishing ? <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Publishing…</span> : publishError ? "Retry" : "Publish to Live"}
                  </button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-600" /> Published!</DialogTitle>
                <DialogDescription>Your careers page is now live and visible to candidates.</DialogDescription>
              </DialogHeader>
              <div className="mt-2 p-3 rounded-xl font-mono text-sm break-all" style={{ backgroundColor: "var(--green-bg)", border: "1px solid var(--green)", color: "var(--ink)" }}>/{publishedSlug}/careers</div>
              <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
                <a href={`/${publishedSlug}/careers`} target="_blank" rel="noreferrer" className="flex-1 h-9 inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all" style={{ border: "1.5px solid var(--border-subtle)", color: "var(--ink)" }}><ExternalLink className="h-3.5 w-3.5" /> View Live</a>
                <button type="button" className="flex-1 h-9 rounded-full text-sm font-semibold transition-all hover:opacity-88" style={{ backgroundColor: "var(--ink)", color: "var(--canvas)" }} onClick={() => { setIsPublishDialogOpen(false); setPublishedSlug(null); }}>Continue Editing</button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
