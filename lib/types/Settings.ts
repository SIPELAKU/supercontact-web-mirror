// lib/types/Settings.ts
import type { LucideIcon } from "lucide-react";

export interface SettingsItem {
  id: string;
  title: string;
  path: string;
  icon?: LucideIcon;
  // OR-semantics via usePermission().can() - same contract as
  // components/layout/Sidebar.tsx's MenuSubItem. Omit entirely = visible to
  // any authenticated user.
  permission?: string | string[];
}

export interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  // Gates the whole section when it has no children of its own.
  permission?: string | string[];
  // Present when this section is a single flat destination (no expand arrow).
  path?: string;
  // Present when this section groups multiple pages.
  children?: SettingsItem[];
}

export type SettingsRegistry = SettingsSection[];
