// lib/config/sidebarNav.ts
//
// The main app Sidebar's menu. Names are the English labels; the Indonesian
// ones live in lib/constants/i18n/id.ts (`navLabels`), keyed by these names.

import { ALL_SETTINGS_PERMISSIONS } from "@/lib/config/settingsNav";
import { SHOW_DATA_INTEL_PREVIEW } from "@/lib/config/featureFlags";
import {
  BarChart3,
  Contact,
  Database,
  FileText,
  HelpCircle,
  Home,
  Inbox,
  Mail,
  MessageCircle,
  Settings,
  TrendingUp,
  Target,
} from "lucide-react";
import type React from "react";

export type MenuSubItem = {
  name: string;
  path: string;
  permission?: string | string[];
};

export type MenuItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  permission?: string | string[];
  children?: MenuSubItem[];
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export const sidebarNav: MenuSection[] = [
  {
    title: "HOME",
    items: [
      {
        name: "Home",
        icon: Home,
        path: "/dashboard",
      },
    ],
  },
  {
    title: "APPS",
    items: [
      {
        name: "Sales",
        icon: TrendingUp,
        children: [
          { name: "Products", path: "/sales/product", permission: "products" },
          { name: "Leads", path: "/lead-management", permission: "leads" },
          { name: "Pipeline", path: "/sales/pipeline", permission: "pipelines" },
          { name: "Quotations", path: "/sales/quotation", permission: "quotations" },
          // Phase 4 (spec I6 / 0.22). The entry lives inline here because
          // `lib/config/sidebarNav.ts` does not exist and is not created: the
          // Sales children have always been declared in this array.
          // `quotations:approve` mirrors the gate on GET /quotations/approvals
          // exactly, so a Staff seller never sees the queue exists.
          {
            name: "Persetujuan Quotation",
            path: "/sales/quotation/approvals",
            permission: "quotations:approve",
          },
        ],
      },
      {
        // Intentionally ungated: the smart-capture API endpoints require
        // authentication only (auth_require) - there is no permissions_require
        // gate on any of them, so there is no permission string to mirror here.
        name: "Smart Capture",
        icon: Target,
        path: "/smart-capture",
      },
      {
        name: "Contacts",
        icon: Contact,
        path: "/contact",
        permission: "contacts",
      },
      {
        name: "WhatsApp Marketing",
        icon: MessageCircle,
        children: [
          { name: "Recipients", path: "/whatsapp-marketing/recipients", permission: "recipients" },
          // "omnichannel:setup" mirrors the gate on every /broadcast-templates
          // API endpoint (permissions_require("omnichannel:setup")).
          { name: "Templates", path: "/whatsapp-marketing/template-broadcasting", permission: "omnichannel:setup" },
          { name: "Groups", path: "/whatsapp-marketing/group-broadcasting", permission: "broadcast_groups" },
          { name: "Broadcasts", path: "/whatsapp-marketing/broadcasting-wa", permission: "broadcasts" },
        ],
      },
      {
        name: "Email Marketing",
        icon: Mail,
        children: [
          // Ungated on purpose: /email-marketing/overview accepts any of the
          // three module permissions, matching permissions_require() on the
          // endpoint. Each child below keeps its own specific gate.
          { name: "Overview", path: "/email-marketing" },
          { name: "Subscribers", path: "/email-marketing/subscribers", permission: "subscribers" },
          { name: "Campaigns", path: "/email-marketing/campaigns", permission: "campaigns" },
          { name: "Mailing Lists", path: "/email-marketing/mailing-lists", permission: "mailing_lists" },
        ],
      },
      {
        // Flattened from a group with a single child ("Unified Inbox") -
        // that structure forced an extra click to reach the only
        // destination it had.
        name: "Omnichannel",
        icon: Inbox,
        path: "/omnichannel",
        permission: "omnichannel:use",
      },
      {
        name: "Data Intelligence",
        icon: Database,
        children: [
          // D2: Company Search, Saved Companies, and Lists merged into one
          // "Companies" workspace (Discover/Saved/Lists tabs) - was 3
          // separate destinations for what's conceptually one task.
          { name: "Companies", path: "/data-intelligence/companies", permission: "companies:read" },
          // Import Center: bulk import jobs promoted out of the modal-only
          // flow - job history, per-job companies, and stop/continue/
          // rollback/replay live here.
          { name: "Imports", path: "/data-intelligence/imports", permission: "companies:read" },
          // Read-only status of every data provider/loader feeding the
          // intelligence cache (GET /sources-status).
          { name: "Data Sources", path: "/data-intelligence/sources", permission: "companies:read" },
          // D4: renamed from "Individual" - reworked from a flat card grid
          // (company info repeated on every card, zero links back to the
          // company) into a table with company backlinks and a seniority
          // signal already computed server-side (C1) but unused until now.
          { name: "People", path: "/data-intelligence/people", permission: "data_intelligence:lists" },
          // Prospecting: person-level search + credit-metered enrichment
          // against the new Person Intelligence API (independent identity
          // resolution/employment-history/multi-email model) - a new
          // sibling to People rather than a replacement, since People reads
          // off the older company-scraping key_people[] flow and the two
          // are backed by genuinely different pipelines for now.
          // Unreleased: hidden unless the preview flag is on (featureFlags.ts).
          ...(SHOW_DATA_INTEL_PREVIEW
            ? [{ name: "Prospecting", path: "/data-intelligence/prospecting", permission: "person_intelligence:read" }]
            : []),
          { name: "ICP Builder", path: "/data-intelligence/icp", permission: "data_intelligence:icp" },
          { name: "Compliance", path: "/data-intelligence/compliance/suppression", permission: "data_intelligence:compliance" },
          // Integrations' own duplicate link (into ADMIN > Settings) was
          // removed here - it's still reachable from there, and this entry
          // never actually helped orientation (the page itself has no
          // breadcrumb back to Data Intelligence either way).
        ],
      },
      {
        // Flattened from a group with a single child ("Dashboard") - same
        // rationale as Omnichannel above: a one-child group only added a
        // click between the user and its single destination.
        name: "Analytics",
        icon: BarChart3,
        path: "/analytics/dashboard",
        permission: "analytics",
      },
      {
        // Intentionally ungated: the notes API's permissions_require("notes")
        // dependency is commented out server-side, so the API enforces
        // authentication only. Re-gate this once the API does.
        name: "Notes",
        icon: FileText,
        path: "/notes",
      },
      {
        name: "Support",
        icon: HelpCircle,
        children: [
          // Unified cross-entity feed: tickets + omnichannel conversations in
          // one read-only list (Increment 8). Visible to anyone who can read
          // EITHER side, so the union gate mirrors the Tickets read grant plus
          // the Omnichannel "use" grant (any-of).
          { name: "All Work", path: "/support/all", permission: ["tickets:read:my", "tickets:read:team", "tickets", "omnichannel:use"] },
          // Conversation-first agent workspace (sibling to the contact-first
          // Omnichannel inbox above). Gated on the same "omnichannel:use"
          // permission the Omnichannel entry uses.
          { name: "Workspace", path: "/support/workspace", permission: "omnichannel:use" },
          { name: "Tickets", path: "/support/tickets", permission: ["tickets:read:my", "tickets:read:team", "tickets"] },
          // Phase 10 Support Analytics (tabs: Tickets / Conversations /
          // Agents / CSAT). The old /support/tickets/dashboard route still
          // renders the same Tickets dashboard, this entry just points at
          // the tabbed page. Any-of union of the per-tab gates so anyone
          // who can see at least one tab gets the entry.
          { name: "Analytics", path: "/support/analytics", permission: ["tickets:reports:view", "tickets", "conversations:reports:view", "omnichannel:use"] },
          // Phase 8D QA reviews - visible to anyone holding ANY qa grant
          // (viewers, reviewers, and scorecard admins all land here).
          { name: "QA Reviews", path: "/support/qa", permission: ["support:qa:view", "support:qa:review", "support:qa:manage"] },
          // Flow Studio (F1) - visual automation flows. Same gate the backend
          // /support/flows endpoints enforce.
          { name: "Flows", path: "/support/flows", permission: "conversations:routing:manage" },
          // Phase 6 Help Center / Knowledge Base authoring app. Gated on the
          // base read grant (publish/manage imply read on the page itself).
          { name: "Knowledge Base", path: "/knowledge-base", permission: ["knowledge:read", "knowledge:author", "knowledge:publish", "knowledge:manage"] },
        ],
      },
    ],
  },
  {
    title: "ADMIN",
    items: [
      {
        // Replaces the old 4-entry ADMIN section (Company Profile, User
        // Control, Billing, Settings) now that all of those live under the
        // centralized Settings Center (/settings/*). Gated on the union of
        // every permission used anywhere inside Settings (ALL_SETTINGS_PERMISSIONS)
        // so this link disappears entirely for a user who can't access any
        // of it, rather than leading to a near-empty settings sub-nav -
        // per-item filtering still happens correctly one level deeper,
        // inside SettingsSidebar itself.
        name: "Settings",
        icon: Settings,
        path: "/settings",
        permission: ALL_SETTINGS_PERMISSIONS,
      },
    ],
  },
];
