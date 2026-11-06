// lib/utils/importFileDuplicates.ts
//
// The browser-side check of an import file before it is sent (FE-6): which
// rows are skipped, which break a rule, and which describe the same person
// more than once. Knows nothing about Contacts: the module's rules come in as
// `ImportFileRules`, so another import can reuse it with its own.
//
// Rows are referred to by their index in the file (0-based); people see
// `index + 1`, the data row under the header.

export type FileRow = Record<string, string | undefined>;

export interface ImportFileRules<Row extends FileRow> {
  // False = skipped without a warning, only counted (e.g. no email or phone).
  isImportable: (row: Row) => boolean;
  // What is wrong with the row; empty = fine.
  validate: (row: Row) => { field: string; message: string }[];
  // Keys that make two rows the same; sharing ANY key joins them.
  identityOf: (row: Row) => string[];
  // A value as duplicates compare it (e.g. email ignoring case).
  compareValue: (field: string, value: string) => string;
}

export interface FileDuplicateGroup {
  // Indices in the file, ascending.
  rows: number[];
  // Fields filled in with different values: the user picks one per field.
  // Empty = no filled-in value contradicts another (identical rows, or rows
  // filling in each other's blanks): merged into one row automatically.
  differing: string[];
}

export interface FileCheck {
  // Rows that pass, including the ones in a duplicate group.
  ready: number[];
  invalid: { index: number; issues: { field: string; message: string }[] }[];
  skipped: number[];
  groups: FileDuplicateGroup[];
}

// How the user settled one group. `choices`: field -> the row index whose
// value is kept. `merge` with no choices is how identical groups are settled.
export type GroupResolution = { action: "merge"; choices: Record<string, number> } | { action: "remove" };

export function checkImportFile<Row extends FileRow>(rows: Row[], rules: ImportFileRules<Row>): FileCheck {
  const ready: number[] = [];
  const invalid: FileCheck["invalid"] = [];
  const skipped: number[] = [];

  rows.forEach((row, index) => {
    if (!rules.isImportable(row)) {
      skipped.push(index);
      return;
    }
    const issues = rules.validate(row);
    if (issues.length > 0) invalid.push({ index, issues });
    else ready.push(index);
  });

  const groups = findDuplicateGroups(ready, (index) => rules.identityOf(rows[index])).map((members) => ({
    rows: members,
    differing: differingFields(
      members.map((index) => rows[index]),
      rules.compareValue,
    ),
  }));

  return { ready, invalid, skipped, groups };
}

/**
 * Rows sharing any identity key, transitively: A and B share an email, B and
 * C a phone number -> A, B and C are one group. Union-find, so a file of
 * 25,000 rows stays instant. Only groups of two or more, by their first row.
 */
export function findDuplicateGroups(indices: number[], identityOf: (index: number) => string[]): number[][] {
  const parent = new Map<number, number>();
  const root = (index: number): number => {
    let current = index;
    while (parent.get(current) !== current) current = parent.get(current)!;
    // Point the whole path at the root, so later lookups are short.
    let next = index;
    while (parent.get(next) !== current) {
      const up = parent.get(next)!;
      parent.set(next, current);
      next = up;
    }
    return current;
  };

  const firstWithKey = new Map<string, number>();
  for (const index of indices) {
    parent.set(index, index);
    for (const key of identityOf(index)) {
      const seen = firstWithKey.get(key);
      if (seen === undefined) {
        firstWithKey.set(key, index);
        continue;
      }
      // Join the two roots, not the rows: this row may already be in another group.
      const a = root(seen);
      const b = root(index);
      if (a !== b) parent.set(b, a);
    }
  }

  const byRoot = new Map<number, number[]>();
  for (const index of indices) {
    const r = root(index);
    byRoot.set(r, [...(byRoot.get(r) ?? []), index]);
  }
  return Array.from(byRoot.values())
    .filter((members) => members.length > 1)
    .map((members) => members.sort((a, b) => a - b))
    .sort((a, b) => a[0] - b[0]);
}

const isFilled = (value: string | undefined): value is string => Boolean(value?.trim());

/** Fields that at least two rows fill in with different values, in first-seen order. */
export function differingFields(rows: FileRow[], compareValue: ImportFileRules<FileRow>["compareValue"]): string[] {
  const fields = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return fields.filter((field) => {
    const values = new Set(rows.map((row) => row[field]).filter(isFilled).map((v) => compareValue(field, v)));
    return values.size > 1;
  });
}

/**
 * One row from a group: every chosen field from the chosen row, every other
 * field from the first row that fills it in.
 */
export function mergeGroup(rows: FileRow[], group: FileDuplicateGroup, choices: Record<string, number>): FileRow {
  const members = group.rows.map((index) => rows[index]);
  const fields = Array.from(new Set(members.flatMap((row) => Object.keys(row))));
  const merged: FileRow = {};
  for (const field of fields) {
    const chosen = choices[field];
    merged[field] =
      chosen !== undefined && group.rows.includes(chosen)
        ? rows[chosen][field]
        : members.map((row) => row[field]).find(isFilled) ?? members[0][field];
  }
  return merged;
}

/** Whether a group is settled: identical groups always are. */
export function isGroupResolved(group: FileDuplicateGroup, resolution: GroupResolution | undefined): boolean {
  if (group.differing.length === 0) return true;
  if (!resolution) return false;
  if (resolution.action === "remove") return true;
  return group.differing.every((field) => group.rows.includes(resolution.choices[field]));
}

export type GroupStatus = "identical" | "needs_choice" | "merged" | "removed";

export function groupStatus(group: FileDuplicateGroup, resolution: GroupResolution | undefined): GroupStatus {
  if (resolution?.action === "remove") return "removed";
  if (group.differing.length === 0) return "identical";
  return isGroupResolved(group, resolution) ? "merged" : "needs_choice";
}

/**
 * The numbers the Check step shows. `toSend` counts every group that is not
 * removed as one row, so it is the final count once all groups are settled.
 */
export function fileCheckSummary(check: FileCheck, resolutions: Record<number, GroupResolution>) {
  const statuses = check.groups.map((group, position) => groupStatus(group, resolutions[position]));
  const inGroups = check.groups.reduce((count, group) => count + group.rows.length, 0);
  const keptGroups = statuses.filter((status) => status !== "removed").length;
  return {
    groups: check.groups.length,
    needChoice: statuses.filter((status) => status === "needs_choice").length,
    invalid: check.invalid.length,
    skipped: check.skipped.length,
    toSend: check.ready.length - inGroups + keptGroups,
  };
}

/**
 * The rows that are sent, in file order: ready rows outside groups as they
 * are, each merged group once at the place of its first row, removed groups
 * not at all. `resolutions` is keyed by the group's position in `check.groups`.
 * Throws when a group still needs a choice: the Import button waits for that.
 */
export function applyFileResolutions(
  rows: FileRow[],
  check: FileCheck,
  resolutions: Record<number, GroupResolution>,
): FileRow[] {
  const groupOf = new Map<number, number>();
  check.groups.forEach((group, position) => {
    if (!isGroupResolved(group, resolutions[position])) {
      throw new Error(`Duplicate rows ${group.rows.map((i) => i + 1).join(", ")} still need a choice`);
    }
    group.rows.forEach((index) => groupOf.set(index, position));
  });

  const result: FileRow[] = [];
  for (const index of check.ready) {
    const position = groupOf.get(index);
    if (position === undefined) {
      result.push(rows[index]);
      continue;
    }
    const group = check.groups[position];
    const resolution = resolutions[position];
    if (index !== group.rows[0] || resolution?.action === "remove") continue;
    result.push(mergeGroup(rows, group, resolution?.action === "merge" ? resolution.choices : {}));
  }
  return result;
}
