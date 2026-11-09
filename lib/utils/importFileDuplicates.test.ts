import { describe, expect, it } from "vitest";
import {
  applyFileResolutions,
  checkImportFile,
  differingFields,
  fileCheckSummary,
  findDuplicateGroups,
  groupStatus,
  isGroupResolved,
  mergeGroup,
  type FileRow,
} from "./importFileDuplicates";
import { CONTACT_FILE_RULES as CONTACT_RULES, contactCompareValue } from "./importRules";

const COLUMNS = ["name", "email", "phone_number", "company", "position", "address"];
const csv = (lines: string[]): FileRow[] =>
  lines.map((line) => Object.fromEntries(line.split(",").map((value, i) => [COLUMNS[i], value])));

// Same rows as doc/tes-import-2026-11-05/kontak_validasi_17.csv (the manual test).
const FILE = csv([
  "Andi Validasi,andi.validasi@example.com,081311110001,PT Satu,Manager,Jl. Merdeka 1 Jakarta",
  "Andi V.,ANDI.validasi@example.com,,PT Dua,,",
  "Andi Validasi,,+62 813-1111-0001,PT Satu,Direktur,",
  "Budi Validasi,budi.validasi@example.com,081322220002,PT Budi,Staff,Jl. Sudirman 2 Bandung",
  "Budi Validasi,budi.validasi@example.com,081322220002,PT Budi,Staff,Jl. Sudirman 2 Bandung",
  "Al,al.validasi@example.com,081333330003,,,",
  "Citra Validasi,citra-at-example.com,081344440004,,,",
  "Dewi Validasi,dewi.validasi@example.com,0813-ABC-5555,,,",
  "Eka Validasi,eka.validasi@example.com,081366660006,PT,,Jl 1",
  ",,,,,",
  "Valid Kontak 1,valid.kontak.1@example.com,081377770001,PT Valid 1,Staff,Jl. Valid No. 1 Jakarta",
  "Valid Kontak 2,valid.kontak.2@example.com,081377770002,PT Valid 2,Staff,Jl. Valid No. 2 Jakarta",
  "Valid Kontak 3,valid.kontak.3@example.com,081377770003,PT Valid 3,Staff,Jl. Valid No. 3 Jakarta",
  "Valid Kontak 4,valid.kontak.4@example.com,081377770004,PT Valid 4,Staff,Jl. Valid No. 4 Jakarta",
  "Fajar Tanpa Kontak,,,PT Fajar,Manager,Jl. Fajar No. 5 Surabaya",
  "Gita Email Saja,gita.email@example.com,,,,",
  "Hadi Nomor Saja,,081388880008,,,",
]);

describe("checkImportFile on the manual test file", () => {
  const check = checkImportFile(FILE, CONTACT_RULES);

  it("sorts every row: skipped, invalid, ready", () => {
    expect(check.skipped).toEqual([9, 14]);
    expect(check.invalid.map((r) => r.index)).toEqual([5, 6, 7, 8]);
    expect(check.ready).toEqual([0, 1, 2, 3, 4, 10, 11, 12, 13, 15, 16]);
  });

  it("finds rows 1-3 as one group (email, then phone) and 4-5 as identical", () => {
    expect(check.groups).toEqual([
      { rows: [0, 1, 2], differing: ["name", "company", "position"] },
      { rows: [3, 4], differing: [] },
    ]);
  });

  it("sends 8 rows after a merge, 7 when the group is removed", () => {
    const merged = applyFileResolutions(FILE, check, {
      0: { action: "merge", choices: { name: 0, company: 1, position: 2 } },
    });
    expect(merged).toHaveLength(8);
    expect(merged[0]).toEqual({
      name: "Andi Validasi",
      email: "andi.validasi@example.com",
      phone_number: "081311110001",
      company: "PT Dua",
      position: "Direktur",
      address: "Jl. Merdeka 1 Jakarta",
    });
    // The identical rows 4-5, once; then the rows outside groups, unchanged.
    expect(merged[1]).toEqual(FILE[3]);
    expect(merged[2]).toBe(FILE[10]);
    expect(merged.slice(6).map((r) => r.name)).toEqual(["Gita Email Saja", "Hadi Nomor Saja"]);

    expect(applyFileResolutions(FILE, check, { 0: { action: "remove" } })).toHaveLength(7);
  });

  it("summarizes the Check step, before and after the choices", () => {
    expect(fileCheckSummary(check, {})).toEqual({ groups: 2, needChoice: 1, invalid: 4, skipped: 2, toSend: 8 });
    expect(fileCheckSummary(check, { 0: { action: "merge", choices: { name: 0, company: 1, position: 2 } } })).toEqual(
      { groups: 2, needChoice: 0, invalid: 4, skipped: 2, toSend: 8 },
    );
    expect(fileCheckSummary(check, { 0: { action: "remove" }, 1: { action: "remove" } })).toMatchObject({
      needChoice: 0,
      toSend: 6,
    });
  });

  it("names each group's state", () => {
    const [mixed, identical] = check.groups;
    expect(groupStatus(mixed, undefined)).toBe("needs_choice");
    expect(groupStatus(mixed, { action: "merge", choices: { name: 0 } })).toBe("needs_choice");
    expect(groupStatus(mixed, { action: "merge", choices: { name: 0, company: 0, position: 0 } })).toBe("merged");
    expect(groupStatus(mixed, { action: "remove" })).toBe("removed");
    expect(groupStatus(identical, undefined)).toBe("identical");
    expect(groupStatus(identical, { action: "remove" })).toBe("removed");
  });

  it("refuses to build the rows while a group needs a choice", () => {
    expect(() => applyFileResolutions(FILE, check, {})).toThrow("Duplicate rows 1, 2, 3 still need a choice");
    expect(() =>
      applyFileResolutions(FILE, check, { 0: { action: "merge", choices: { name: 0, company: 1 } } }),
    ).toThrow();
  });
});

describe("findDuplicateGroups", () => {
  const keys: Record<number, string[]> = {
    0: ["a"],
    1: ["b"],
    2: ["c", "b"],
    3: ["d"],
    4: ["c"],
    5: ["a"],
    6: [],
    7: [],
  };
  const groups = findDuplicateGroups([0, 1, 2, 3, 4, 5, 6, 7], (i) => keys[i]);

  it("joins rows transitively and lists groups in file order", () => {
    expect(groups).toEqual([
      [0, 5],
      [1, 2, 4],
    ]);
  });

  it("rows without keys never join each other", () => {
    expect(groups.flat()).not.toContain(6);
    expect(groups.flat()).not.toContain(7);
  });

  it("joins two groups that a later row links, in any order", () => {
    const linked: Record<number, string[]> = { 0: ["a"], 1: ["b"], 2: ["a", "b"] };
    expect(findDuplicateGroups([0, 1, 2], (i) => linked[i])).toEqual([[0, 1, 2]]);
    expect(findDuplicateGroups([2, 1, 0], (i) => linked[i])).toEqual([[0, 1, 2]]);
  });

  it("rows repeating the same email and phone stay one group", () => {
    const repeated: Record<number, string[]> = { 0: ["a"], 1: ["a", "b"], 2: ["a", "b"], 3: ["b"] };
    expect(findDuplicateGroups([0, 1, 2, 3], (i) => repeated[i])).toEqual([[0, 1, 2, 3]]);
  });

  it("lists groups by their first row even when the rows come unordered", () => {
    const pairs: Record<number, string[]> = { 0: ["a"], 1: ["b"], 2: ["a"], 3: ["b"] };
    expect(findDuplicateGroups([3, 1, 2, 0], (i) => pairs[i])).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });
});

describe("differingFields / mergeGroup / isGroupResolved", () => {
  it("a field filled in by one row only, or the same value, needs no choice", () => {
    const rows = [
      { name: "Andi", email: "A@x.com", note: "" },
      { name: "Andi", email: "a@x.com", note: "VIP" },
    ];
    expect(differingFields(rows, contactCompareValue)).toEqual([]);
    expect(mergeGroup(rows, { rows: [0, 1], differing: [] }, {})).toEqual({
      name: "Andi",
      email: "A@x.com",
      note: "VIP",
    });
  });

  it("ignores a choice for a row outside the group", () => {
    const rows = [{ name: "A" }, { name: "B" }, { name: "C" }];
    expect(mergeGroup(rows, { rows: [0, 1], differing: ["name"] }, { name: 2 })).toEqual({ name: "A" });
  });

  it("a group is resolved once every differing field has a row of the group", () => {
    const group = { rows: [3, 7], differing: ["name", "company"] };
    expect(isGroupResolved({ rows: [3, 7], differing: [] }, undefined)).toBe(true);
    expect(isGroupResolved(group, undefined)).toBe(false);
    expect(isGroupResolved(group, { action: "remove" })).toBe(true);
    expect(isGroupResolved(group, { action: "merge", choices: { name: 3 } })).toBe(false);
    expect(isGroupResolved(group, { action: "merge", choices: { name: 3, company: 9 } })).toBe(false);
    expect(isGroupResolved(group, { action: "merge", choices: { name: 3, company: 7 } })).toBe(true);
  });
});
