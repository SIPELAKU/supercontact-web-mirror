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
].sort();

export const formatPermissionLabel = (permission: string) => {
  return permission
    .split(/[:_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
