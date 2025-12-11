import { create } from "zustand";
import {Lead} from "@/lib/models/types";
type ViewModeState = {
  viewMode: "table-view" | "kanban-view";
  setViewMode: (mode: "table-view" | "kanban-view") => void;
  filteredData: Lead[];
  setFilteredData: (data: Lead[]) => void;
};

export const useViewMode = create<ViewModeState>((set) => ({
  viewMode: "table-view",
  setViewMode: (mode) => set({ viewMode: mode }),
  filteredData: [],
  setFilteredData: (data: Lead[]) => set({ filteredData: data }),
}));