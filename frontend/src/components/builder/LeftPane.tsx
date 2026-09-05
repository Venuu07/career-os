"use client";

import { useBuilder } from "@/contexts/BuilderContext";
import { sectionRegistry } from "@/components/sections/registry";
import { ChevronUp, ChevronDown, Plus, Trash2, Eye, EyeOff } from "lucide-react";

export function LeftPane() {
  const { state, dispatch } = useBuilder();

  // Sort sections by order for display
  const sortedSections = [...state.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="w-64 shrink-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full">
      {/* Header */}
      <div className="h-10 flex items-center px-4 border-b border-zinc-100 dark:border-zinc-900">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Page Structure
        </span>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto py-2">
        {sortedSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-zinc-300 dark:text-zinc-700 text-3xl mb-3">□</div>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              No sections yet. Add one below.
            </p>
          </div>
        ) : (
          sortedSections.map((section, index) => {
            const isSelected = state.selectedSectionId === section.id;
            const def = sectionRegistry[section.type];

            return (
              <div
                key={section.id}
                className={`group mx-2 mb-1 flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors border ${
                  isSelected
                    ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400"
                } ${!section.visible ? "opacity-50" : ""}`}
                onClick={() =>
                  dispatch({ type: "SELECT_SECTION", payload: section.id })
                }
              >
                {/* Section icon + label */}
                <span className="text-xs shrink-0 font-mono text-zinc-400">{def?.icon ?? "□"}</span>
                <span className="text-sm flex-1 truncate font-medium">
                  {def?.label ?? section.type}
                </span>

                {/* Controls — always visible */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch({
                        type: "UPDATE_SECTION",
                        payload: { id: section.id, data: { visible: !section.visible } },
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
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
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
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
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
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
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

      {/* Add section */}
      <div className="border-t border-zinc-100 dark:border-zinc-900 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2.5 px-1">
          Add Section
        </p>
        <div className="space-y-1 max-h-52 overflow-y-auto">
          {Object.values(sectionRegistry).map((def) => (
            <button
              key={def.type}
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              onClick={() =>
                dispatch({
                  type: "ADD_SECTION",
                  payload: { type: def.type, defaultData: def.defaultData },
                })
              }
            >
              <span className="text-xs font-mono text-zinc-400 shrink-0">{def.icon}</span>
              <span className="font-medium truncate">{def.label}</span>
              <Plus className="h-3 w-3 ml-auto shrink-0 text-zinc-300 dark:text-zinc-700" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
