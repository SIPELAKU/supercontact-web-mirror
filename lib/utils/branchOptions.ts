// lib/utils/branchOptions.ts
//
// The Branch field of Add User / Edit User. A department name is one of four
// fixed values; each department + branch pair is one department record, so a
// "branch" here is a department record of the chosen department.

export const BRANCH_LIST_LIMIT = 10;

export interface BranchRow {
  id: string;
  department: string;
  branch: string;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** The chosen department's branches matching what was typed: at most `limit`
 *  of them, plus how many more match. Blank and repeated names are dropped. */
export function branchOptions(
  rows: ReadonlyArray<BranchRow>,
  department: string,
  query: string,
  limit: number = BRANCH_LIST_LIMIT,
): { items: BranchRow[]; more: number } {
  const needle = query.trim().toLowerCase();
  const seen = new Set<string>();
  const matches: BranchRow[] = [];
  for (const row of rows) {
    const key = row.branch.trim().toLowerCase();
    if (row.department !== department || !key || seen.has(key)) continue;
    seen.add(key);
    if (key.includes(needle)) matches.push(row);
  }
  return { items: matches.slice(0, limit), more: Math.max(0, matches.length - limit) };
}

/** The branch with exactly this name (any case) in the department. */
export function findBranch(
  rows: ReadonlyArray<BranchRow>,
  department: string,
  name: string,
): BranchRow | undefined {
  if (!name.trim()) return undefined;
  return rows.find((row) => row.department === department && same(row.branch, name));
}

/** Whether the department has any branch at all. */
export function hasBranches(rows: ReadonlyArray<BranchRow>, department: string): boolean {
  return rows.some((row) => row.department === department && row.branch.trim() !== "");
}
