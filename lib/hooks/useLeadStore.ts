import { create } from "zustand";

type ViewModeState = {
  viewMode: "table-view" | "kanban-view";
  setViewMode: (mode: "table-view" | "kanban-view") => void;
};

export const useViewMode = create<ViewModeState>((set) => ({
  viewMode: "table-view",
  setViewMode: (mode) => set({ viewMode: mode }),
}));