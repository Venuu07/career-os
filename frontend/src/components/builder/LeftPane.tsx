"use client";

import { useBuilder } from "@/contexts/BuilderContext";
import { sectionRegistry } from "@/components/sections/registry";
import { ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export function LeftPane() {
  const { state, dispatch } = useBuilder();

  // Sort sections by order for display
  const sortedSections = [...state.sections].sort((a, b) => a.order - b.order);

  return (
    <div
      className="w-60 shrink-0 flex flex-col h-full"
      style={{
        backgroundColor: "var(--surface)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="h-10 flex items-center px-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span className="text-eyebrow" style={{ color: "var(--muted-ink)" }}>
          Page Structure
        </span>
      </div>

      {/* ── Section list ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {sortedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
            <div
              className="h-10 w-10 rounded-2xl flex items-center justify-center mb-3 text-lg"
              style={{
                backgroundColor: "var(--canvas)",
                border: "1px solid var(--border-subtle)",
                color: "var(--muted-ink)",
              }}
            >
              □
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--muted-ink)" }}>
              No sections yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted-ink)", opacity: 0.6 }}>
              Add one below to get started.
            </p>
          </div>
        ) : (
          sortedSections.map((section, index) => {
            const isSelected = state.selectedSectionId === section.id;
            const def = sectionRegistry[section.type];

            return (
              <div
                key={section.id}
                className="group mb-0.5 flex items-center gap-2 px-2.5 py-2 rounded-xl cursor-pointer transition-all"
                style={{
                  backgroundColor: isSelected ? "var(--green-bg)" : "transparent",
                  border: `1.5px solid ${isSelected ? "var(--green)" : "transparent"}`,
                  opacity: section.visible ? 1 : 0.45,
                }}
                onClick={() =>
                  dispatch({ type: "SELECT_SECTION", payload: section.id })
                }
              >
                {/* Icon */}
                <span
                  className="text-xs shrink-0 w-5 text-center"
                  style={{ color: isSelected ? "var(--ink)" : "var(--muted-ink)" }}
                >
                  {def?.icon ?? "□"}
                </span>

                {/* Label */}
                <span
                  className="text-xs flex-1 truncate font-semibold"
                  style={{ color: isSelected ? "var(--ink)" : "var(--muted-ink)" }}
                >
                  {def?.label ?? section.type}
                </span>

                {/* Controls — show on hover or when selected */}
                <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {/* Visibility */}
                  <button
                    type="button"
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: "var(--muted-ink)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "UPDATE_SECTION",
                        payload: {
                          id: section.id,
                          data: { visible: !section.visible },
                        },
                      });
                    }}
                    aria-label={section.visible ? "Hide section" : "Show section"}
                    title={section.visible ? "Hide" : "Show"}
                  >
                    {section.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </button>

                  {/* Move up */}
                  <button
                    type="button"
                    className="p-1 rounded-lg transition-colors disabled:opacity-20"
                    style={{ color: "var(--muted-ink)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "REORDER_SECTION",
                        payload: { id: section.id, direction: "up" },
                      });
                    }}
                    disabled={index === 0}
                    aria-label="Move up"
                    title="Move up"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>

                  {/* Move down */}
                  <button
                    type="button"
                    className="p-1 rounded-lg transition-colors disabled:opacity-20"
                    style={{ color: "var(--muted-ink)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "REORDER_SECTION",
                        payload: { id: section.id, direction: "down" },
                      });
                    }}
                    disabled={index === sortedSections.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: "var(--muted-ink)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "var(--orange)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "var(--muted-ink)")
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({ type: "REMOVE_SECTION", payload: section.id });
                    }}
                    aria-label="Remove section"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Add Section ─────────────────────────────────────────────────── */}
      <div
        className="shrink-0 p-2"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <p
          className="text-eyebrow px-2 mb-2"
          style={{ color: "var(--muted-ink)" }}
        >
          Add Section
        </p>
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          {Object.values(sectionRegistry).map((def) => (
            <button
              key={def.type}
              type="button"
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all group/add"
              style={{ color: "var(--muted-ink)" }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.backgroundColor = "var(--canvas)";
                btn.style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.backgroundColor = "transparent";
                btn.style.color = "var(--muted-ink)";
              }}
              onClick={() =>
                dispatch({
                  type: "ADD_SECTION",
                  payload: { type: def.type, defaultData: def.defaultData },
                })
              }
            >
              <span className="text-xs w-5 text-center shrink-0">{def.icon}</span>
              <span className="text-xs font-medium truncate flex-1">{def.label}</span>
              <Plus className="h-3 w-3 shrink-0 opacity-40 group-hover/add:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
