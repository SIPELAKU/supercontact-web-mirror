// Offline fallback catalog. The authoritative list is served by GET /permissions
// (see lib/hooks/usePermissionCatalog.ts) - this array is only rendered if that
// fetch fails, so it is kept reasonably complete (including the Support Desk
// conversations:* / agents:* grants and the granular tasks:* entries) to avoid
// the drift bug where the editor silently omitted seeded permissions.
export const PERMISSIONS = [
  "analytics",
  "campaigns",
  "contacts",
  "dashboard",
  "departments",
  "leads",
  "mailing_lists",
  "manage_users",
  "pipelines",
  "quotations",
  "reports",
  "role_permissions",
  "subscribers",
  "tasks:read:my",
  "tasks:read:team",
  "tasks:write:my",
  "tasks:write:team",
  "tickets",
  "user_profiles",
  "users",
  "view_all_branches",
  // Support Desk (Phase 0) - conversation + agent management grants.
  "conversations:read:my",
  "conversations:read:team",
  "conversations:read:all",
  "conversations:assign",
  "conversations:transfer",
  "conversations:config:manage",
  "conversations:reports:view",
  "conversations:routing:manage",
  "agents:read",
  "agents:manage",
  // Help Center / Knowledge Base (Phase 6).
  "knowledge:read",
  "knowledge:author",
  "knowledge:publish",
  "knowledge:manage",
].sort();

export const formatPermissionLabel = (permission: string) => {
  return permission
    .split(/[:_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ---- Domain grouping for the role editor's checkbox sections ----------------
//
// Group = the prefix before the first ':' (e.g. `conversations:read:my` ->
// "conversations"); permissions with no prefix are mapped explicitly to a
// sensible business domain below.

// Prefix (segment before the first ':') -> section label.
const PREFIX_GROUP_LABELS: Record<string, string> = {
  conversations: "Conversations",
  agents: "Agents",
  tickets: "Tickets",
  knowledge: "Knowledge Base",
  tasks: "Tasks",
  contacts: "Contacts",
};

// Un-prefixed permission -> section label.
const UNPREFIXED_GROUP: Record<string, string> = {
  contacts: "Contacts",
  leads: "Sales",
  pipelines: "Sales",
  quotations: "Sales",
  campaigns: "Marketing",
  mailing_lists: "Marketing",
  subscribers: "Marketing",
  tickets: "Tickets",
  dashboard: "Insights",
  analytics: "Insights",
  reports: "Insights",
  departments: "Admin",
  manage_users: "Admin",
  users: "Admin",
  user_profiles: "Admin",
  role_permissions: "Admin",
  view_all_branches: "Admin",
};

// Preferred section order; anything unlisted falls to the end alphabetically.
const GROUP_ORDER = [
  "Conversations",
  "Agents",
  "Tickets",
  "Knowledge Base",
  "Tasks",
  "Contacts",
  "Sales",
  "Marketing",
  "Insights",
  "Admin",
  "Other",
];

export const getPermissionGroup = (permission: string): string => {
  const colon = permission.indexOf(":");
  if (colon !== -1) {
    const prefix = permission.slice(0, colon);
    return PREFIX_GROUP_LABELS[prefix] || formatPermissionLabel(prefix);
  }
  return UNPREFIXED_GROUP[permission] || "Other";
};

export interface PermissionGroup {
  group: string;
  items: string[];
}

export const groupPermissions = (permissions: string[]): PermissionGroup[] => {
  const map = new Map<string, string[]>();
  for (const permission of permissions) {
    const group = getPermissionGroup(permission);
    if (!map.has(group)) map.set(group, []);
    map.get(group)!.push(permission);
  }

  const groups: PermissionGroup[] = Array.from(map.entries()).map(([group, items]) => ({
    group,
    items: [...items].sort((a, b) => a.localeCompare(b)),
  }));

  groups.sort((a, b) => {
    const ai = GROUP_ORDER.indexOf(a.group);
    const bi = GROUP_ORDER.indexOf(b.group);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi) || a.group.localeCompare(b.group);
  });

  return groups;
};
