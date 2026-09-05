"use client";

import React, { createContext, useContext, useReducer } from "react";
import { SectionConfig, ThemeConfig } from "@/lib/types";

// State definition
interface BuilderState {
  sections: SectionConfig[];
  theme: ThemeConfig;
  selectedSectionId: string | null;
  viewport: "desktop" | "tablet" | "mobile";
  isCandidatePreview: boolean; // Distraction-free mode
  hasUnsavedChanges: boolean;
  saveStatus: "saved" | "saving" | "error" | "idle";
  localRevision: number;
}

// Actions
type BuilderAction =
  | { type: "INIT"; payload: { sections: SectionConfig[]; theme: ThemeConfig } }
  | { type: "SELECT_SECTION"; payload: string | null }
  | { type: "SET_VIEWPORT"; payload: "desktop" | "tablet" | "mobile" }
  | { type: "TOGGLE_PREVIEW" }
  | { type: "UPDATE_SECTION"; payload: { id: string; data: Partial<SectionConfig> } }
  | { type: "ADD_SECTION"; payload: { type: string; defaultData: Record<string, unknown> } }
  | { type: "REMOVE_SECTION"; payload: string }
  | { type: "REORDER_SECTION"; payload: { id: string; direction: "up" | "down" } }
  | { type: "SET_THEME"; payload: Partial<ThemeConfig> }
  | { type: "SAVE_START" }
  | { type: "SAVE_SUCCESS"; payload: { revision: number } }
  | { type: "SAVE_ERROR" };

const initialState: BuilderState = {
  sections: [],
  theme: {},
  selectedSectionId: null,
  viewport: "desktop",
  isCandidatePreview: false,
  hasUnsavedChanges: false,
  saveStatus: "idle",
  localRevision: 0,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        sections: action.payload.sections,
        theme: action.payload.theme,
        hasUnsavedChanges: false,
        saveStatus: "saved",
        localRevision: 0,
      };
    case "SELECT_SECTION":
      return { ...state, selectedSectionId: action.payload };
    case "SET_VIEWPORT":
      return { ...state, viewport: action.payload };
    case "TOGGLE_PREVIEW":
      return { ...state, isCandidatePreview: !state.isCandidatePreview, selectedSectionId: null };
    case "UPDATE_SECTION":
      return {
        ...state,
        hasUnsavedChanges: true,
        saveStatus: "idle",
        localRevision: state.localRevision + 1,
        sections: state.sections.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.data } : s
        ),
      };
    case "ADD_SECTION":
      const newOrder = state.sections.length > 0 
        ? Math.max(...state.sections.map(s => s.order)) + 1 
        : 0;
      const newSection: SectionConfig = {
        id: `${action.payload.type}-${Date.now()}`,
        type: action.payload.type,
        visible: true,
        order: newOrder,
        data: action.payload.defaultData,
      };
      return {
        ...state,
        hasUnsavedChanges: true,
        saveStatus: "idle",
        localRevision: state.localRevision + 1,
        sections: [...state.sections, newSection],
        selectedSectionId: newSection.id, // Auto-select new section
      };
    case "REMOVE_SECTION":
      return {
        ...state,
        hasUnsavedChanges: true,
        saveStatus: "idle",
        localRevision: state.localRevision + 1,
        selectedSectionId: state.selectedSectionId === action.payload ? null : state.selectedSectionId,
        sections: state.sections.filter((s) => s.id !== action.payload),
      };
    case "REORDER_SECTION":
      const { id, direction } = action.payload;
      const sorted = [...state.sections].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex(s => s.id === id);
      if (index < 0) return state;
      
      if (direction === "up" && index > 0) {
        // Swap with previous
        const temp = sorted[index].order;
        sorted[index].order = sorted[index - 1].order;
        sorted[index - 1].order = temp;
      } else if (direction === "down" && index < sorted.length - 1) {
        // Swap with next
        const temp = sorted[index].order;
        sorted[index].order = sorted[index + 1].order;
        sorted[index + 1].order = temp;
      } else {
        return state;
      }
      return {
        ...state,
        hasUnsavedChanges: true,
        saveStatus: "idle",
        localRevision: state.localRevision + 1,
        sections: sorted,
      };
    case "SET_THEME":
      return {
        ...state,
        hasUnsavedChanges: true,
        saveStatus: "idle",
        localRevision: state.localRevision + 1,
        theme: { ...state.theme, ...action.payload },
      };
    case "SAVE_START":
      return { 
        ...state, 
        saveStatus: "saving"
      };
    case "SAVE_SUCCESS":
      // Only clear dirty state if no edits happened since this save started
      if (state.localRevision === action.payload.revision) {
        return {
          ...state,
          saveStatus: "saved",
          hasUnsavedChanges: false,
        };
      }
      return {
        ...state,
        saveStatus: "idle", // It's idle relative to the newer unsaved changes
      };
    case "SAVE_ERROR":
      return {
        ...state,
        saveStatus: "error",
      };
    default:
      return state;
  }
}

interface BuilderContextType {
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
}

const BuilderContext = createContext<BuilderContextType | undefined>(undefined);

export function BuilderProvider({ children, initialSections = [], initialTheme = {} }: { children: React.ReactNode, initialSections?: SectionConfig[], initialTheme?: ThemeConfig }) {
  const [state, dispatch] = useReducer(builderReducer, {
    ...initialState,
    sections: initialSections,
    theme: initialTheme,
  });

  return (
    <BuilderContext.Provider value={{ state, dispatch }}>
      {children}
    </BuilderContext.Provider>
  );
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (context === undefined) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }
  return context;
}
