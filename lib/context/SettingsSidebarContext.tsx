"use client";

import { createContext, useContext, useEffect, useState } from "react";

const OPEN_GROUPS_STORAGE_KEY = "settings:openGroups";

export type SettingsSidebarContextType = {
  // Below the lg breakpoint (tablet + mobile share one mechanism: hidden by
  // default, revealed as a drawer via a toggle button - two rails don't fit
  // comfortably below desktop width, and a drawer is simpler than building a
  // second icon-rail collapse state to sit alongside the main app Sidebar's).
  isMobileOpen: boolean;
  openGroups: Record<string, boolean>;
  toggleMobile: () => void;
  closeMobile: () => void;
  toggleGroup: (id: string) => void;
  openGroup: (id: string) => void;
};

const SettingsSidebarContext = createContext<SettingsSidebarContextType | undefined>(undefined);

export function SettingsSidebarProvider({ children }: { children: React.ReactNode }) {
  // SSR always renders no-open-groups; persisted values apply on mount -
  // same tradeoff SidebarContext.tsx and AuthContext.tsx already accept for
  // their own localStorage-backed fields.
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(OPEN_GROUPS_STORAGE_KEY);
      if (stored) setOpenGroups(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(OPEN_GROUPS_STORAGE_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);
  // Independent toggling, no mutual exclusion - deliberately different from
  // the main app Sidebar's single-open-accordion behavior, matching how
  // GitHub/Stripe-style settings UIs commonly show several groups expanded
  // at once.
  const toggleGroup = (id: string) => setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const openGroup = (id: string) => setOpenGroups((prev) => (prev[id] ? prev : { ...prev, [id]: true }));

  return (
    <SettingsSidebarContext.Provider
      value={{ isMobileOpen, openGroups, toggleMobile, closeMobile, toggleGroup, openGroup }}
    >
      {children}
    </SettingsSidebarContext.Provider>
  );
}

export function useSettingsSidebar() {
  const ctx = useContext(SettingsSidebarContext);
  if (!ctx) throw new Error("useSettingsSidebar must be inside SettingsSidebarProvider");
  return ctx;
}
