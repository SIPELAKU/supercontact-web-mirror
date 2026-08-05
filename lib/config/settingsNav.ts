// lib/config/settingsNav.ts
//
// Single source of truth for the Settings Center's navigation. Adding a new
// settings page is: add one entry here + create its app/settings/... route -
// SettingsLayout/SettingsSidebar never need to change (deliverable #6 of the
// Global Settings Framework Revamp spec).

import {
  Building2,
  CreditCard,
  Mail,
  MessageCircle,
  Network,
  Plug,
  Shield,
  Ticket,
  Users,
} from "lucide-react";
import type { SettingsItem, SettingsRegistry, SettingsSection } from "@/lib/types/Settings";

export const settingsNav: SettingsRegistry = [
  {
    id: "general",
    title: "General",
    icon: Building2,
    children: [
      { id: "company", title: "Company", path: "/settings/general/company" },
      { id: "key-people", title: "Key People", path: "/settings/general/company/key-people" },
    ],
  },
  {
    id: "support",
    title: "Support",
    icon: Ticket,
    permission: "tickets:config:manage",
    children: [
      { id: "categories", title: "Categories", path: "/settings/support/categories" },
      { id: "custom-fields", title: "Custom Fields", path: "/settings/support/custom-fields" },
      { id: "sla", title: "SLA Policies", path: "/settings/support/sla" },
      { id: "business-hours", title: "Business Hours", path: "/settings/support/business-hours" },
      { id: "macros", title: "Macros", path: "/settings/support/macros" },
      { id: "automation", title: "Automation", path: "/settings/support/automation" },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp",
    icon: MessageCircle,
    path: "/settings/whatsapp",
    permission: "omnichannel:setup",
  },
  {
    id: "email",
    title: "Email",
    icon: Mail,
    children: [
      { id: "accounts", title: "Accounts", path: "/settings/email/accounts", permission: "mail_senders" },
      { id: "servers", title: "Servers", path: "/settings/email/servers", permission: "mail_servers:read" },
    ],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    path: "/settings/integrations",
    permission: "integrations:read",
  },
  {
    id: "users",
    title: "Users",
    icon: Users,
    path: "/settings/users",
    permission: "manage_users",
  },
  {
    id: "roles",
    title: "Roles",
    icon: Shield,
    path: "/settings/roles",
    permission: "role_permissions",
  },
  {
    id: "organization",
    title: "Organization",
    icon: Network,
    path: "/settings/organization",
    permission: "departments",
  },
  {
    id: "billing",
    title: "Billing",
    icon: CreditCard,
    path: "/settings/billing",
  },
];

/** Every permission string appearing anywhere in the registry, deduped -
 *  used to gate the main app Sidebar's single "Settings" entry (visible if
 *  the user has ANY of these). */
export const ALL_SETTINGS_PERMISSIONS: string[] = Array.from(
  new Set(
    settingsNav.flatMap((section) => {
      const perms: string[] = [];
      if (section.permission) {
        perms.push(...(Array.isArray(section.permission) ? section.permission : [section.permission]));
      }
      for (const item of section.children ?? []) {
        if (item.permission) {
          perms.push(...(Array.isArray(item.permission) ? item.permission : [item.permission]));
        }
      }
      return perms;
    })
  )
);

type ActiveEntry = { section: SettingsSection; item?: SettingsItem };

/** Finds the most-specific active match across the whole registry: an exact
 *  match always wins outright; among prefix matches, the longest path wins.
 *  Same algorithm as components/layout/Sidebar.tsx's findActivePath - guards
 *  against sibling routes where one path prefixes another (e.g.
 *  /settings/support vs /settings/support/sla). Dynamic routes not listed in
 *  the registry (e.g. /settings/organization/[id]) resolve via prefix match
 *  against their listed parent. */
export function findActiveSettingsEntry(pathname: string): ActiveEntry | null {
  let best: ActiveEntry | null = null;
  let bestLength = -1;

  for (const section of settingsNav) {
    const candidates: { path: string; item?: SettingsItem }[] = section.path
      ? [{ path: section.path }]
      : (section.children ?? []).map((item) => ({ path: item.path, item }));

    for (const { path, item } of candidates) {
      if (pathname === path) return { section, item };
      if (pathname.startsWith(path + "/") && path.length > bestLength) {
        best = { section, item };
        bestLength = path.length;
      }
    }
  }
  return best;
}

export function getRequiredPermission(pathname: string): string | string[] | undefined {
  const entry = findActiveSettingsEntry(pathname);
  if (!entry) return undefined;
  return entry.item?.permission ?? entry.section.permission;
}
