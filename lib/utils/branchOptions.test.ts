import { describe, expect, it } from "vitest";
import { branchOptions, findBranch, hasBranches, type BranchRow } from "./branchOptions";

const row = (id: string, branch: string, department = "Sales"): BranchRow => ({ id, department, branch });
const sales = [row("1", "HO"), row("2", "Surabaya"), row("3", "Bandung"), row("m1", "HO", "Marketing")];

describe("branchOptions", () => {
  it("lists the chosen department's branches without typing", () => {
    expect(branchOptions(sales, "Sales", "").items.map((r) => r.id)).toEqual(["1", "2", "3"]);
  });

  it("typing narrows the list, in any case", () => {
    expect(branchOptions(sales, "Sales", "  sura ").items.map((r) => r.branch)).toEqual(["Surabaya"]);
    expect(branchOptions(sales, "Sales", "xyz").items).toEqual([]);
  });

  it("never shows another department's branches", () => {
    expect(branchOptions(sales, "Marketing", "").items.map((r) => r.id)).toEqual(["m1"]);
  });

  it("shows at most the limit and counts the rest", () => {
    const many = Array.from({ length: 13 }, (_, i) => row(String(i), `Cabang ${i}`));
    const { items, more } = branchOptions(many, "Sales", "");
    expect(items).toHaveLength(10);
    expect(more).toBe(3);
    expect(branchOptions(many, "Sales", "", 20).more).toBe(0);
  });

  it("drops blank and repeated names", () => {
    const messy = [row("1", "HO"), row("2", " ho "), row("3", "  "), row("4", "Surabaya")];
    expect(branchOptions(messy, "Sales", "").items.map((r) => r.id)).toEqual(["1", "4"]);
  });
});

describe("findBranch", () => {
  it("matches the whole name in any case, in that department only", () => {
    expect(findBranch(sales, "Sales", " surabaya ")?.id).toBe("2");
    expect(findBranch(sales, "Sales", "Sura")).toBeUndefined();
    expect(findBranch(sales, "Marketing", "Surabaya")).toBeUndefined();
    expect(findBranch(sales, "Sales", "  ")).toBeUndefined();
    expect(findBranch([row("b", "")], "Sales", "  ")).toBeUndefined();
  });
});

describe("hasBranches", () => {
  it("is false for a department with none", () => {
    expect(hasBranches(sales, "Sales")).toBe(true);
    expect(hasBranches(sales, "Customer Support")).toBe(false);
    expect(hasBranches([row("x", " ", "Customer Support")], "Customer Support")).toBe(false);
  });
});
