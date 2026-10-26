/**
 * Roles that may assign a deal to someone else. Everyone else (the sales
 * team) is locked to themself on Add Deal and to the current assignee on
 * Update Pipeline.
 *
 * Role names are configurable per company, so they are matched loosely:
 * case, spaces and underscores are ignored ("Super Admin" = "super_admin").
 * This is a UI rule only - the BE should enforce the same thing.
 */
// Confirmed by BE (2026-10-26): super admin, admin and manager. "Admin" and
// "Manager" are system roles (BE `ManageUserLevel`, FE `DEFAULT_ROLE_NAMES`);
// the BE value for super admin is `super_admin`, which "Super Admin" matches
// once normalised. Staff and custom roles stay locked.
export const DEAL_ASSIGNER_ROLES = ["Admin", "Manager", "Super Admin"];

const normalizeRole = (role: string) => role.toLowerCase().replace(/[^a-z]/g, "");

export function canAssignDeals(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = normalizeRole(role);
  return DEAL_ASSIGNER_ROLES.some((r) => normalizeRole(r) === normalized);
}

/**
 * The same roles see every deal on the kanban; everyone else only sees the
 * deals assigned to them (and only picks their own leads on Add Deal).
 */
export const canSeeAllDeals = canAssignDeals;
