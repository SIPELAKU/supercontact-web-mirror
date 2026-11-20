import { describe, expect, it } from "vitest";
import {
  DEFAULT_STAGES,
  MAX_STAGES,
  canAddStage,
  stageCountLabel,
  stageLimitMessage,
  STAGE_PALETTE,
  canManageStages,
  canMove,
  deactivateBlockReason,
  defaultDraftRows,
  deleteBlockReason,
  deleteConfirmTitle,
  insertBeforeWon,
  isPinned,
  isQuotationStage,
  moveRow,
  nameSuggestions,
  normalizeHex,
  normalizeOrder,
  rowsFromStages,
  stageTint,
  validateNames,
  type StageDraftRow,
} from "./stageRules";
import type { PipelineStage } from "@/lib/types/PipelineStage";

const row = (key: string, outcome: StageDraftRow["outcome"], extra: Partial<StageDraftRow> = {}): StageDraftRow => ({
  key,
  id: key,
  name: key,
  color: "#26C6F9",
  outcome,
  isLocked: ["entry", "quotation", "won", "lost"].includes(outcome),
  isActive: true,
  dealCount: 0,
  ...extra,
});

const board = () => [
  row("Prospect", "entry"),
  row("Qualified", "open"),
  row("Negotiation", "open"),
  row("Proposal", "quotation"),
  row("Won", "won"),
  row("Lost", "lost"),
];
const keys = (rows: StageDraftRow[]) => rows.map((r) => r.key);

describe("order", () => {
  it("Prospect, Won and Lost are pinned; Proposal and the others move", () => {
    expect(board().filter(isPinned).map((r) => r.key)).toEqual(["Prospect", "Won", "Lost"]);
    expect(board().filter(canMove).map((r) => r.key)).toEqual(["Qualified", "Negotiation", "Proposal"]);
    expect(canMove(row("Old", "open", { isActive: false }))).toBe(false);
  });

  it("moves a stage among the movable ones", () => {
    expect(keys(moveRow(board(), "Proposal", "Qualified"))).toEqual(["Prospect", "Proposal", "Qualified", "Negotiation", "Won", "Lost"]);
    expect(keys(moveRow(board(), "Qualified", "Proposal"))).toEqual(["Prospect", "Negotiation", "Proposal", "Qualified", "Won", "Lost"]);
  });

  it("never past Prospect or past Won/Lost", () => {
    expect(keys(moveRow(board(), "Proposal", "Prospect"))).toEqual(["Prospect", "Proposal", "Qualified", "Negotiation", "Won", "Lost"]);
    expect(keys(moveRow(board(), "Qualified", "Lost"))).toEqual(["Prospect", "Negotiation", "Proposal", "Qualified", "Won", "Lost"]);
  });

  it("a pinned or inactive stage can't be dragged", () => {
    const rows = [...board(), row("Old", "open", { isActive: false })];
    expect(moveRow(rows, "Won", "Qualified")).toBe(rows);
    expect(moveRow(rows, "Prospect", "Proposal")).toBe(rows);
    expect(moveRow(rows, "Old", "Qualified")).toBe(rows);
    expect(moveRow(rows, "nope", "Qualified")).toBe(rows);
  });

  it("a new or re-activated stage goes right before Won", () => {
    const added = row("Survey", "open");
    expect(keys(insertBeforeWon(board(), added))).toEqual(["Prospect", "Qualified", "Negotiation", "Proposal", "Survey", "Won", "Lost"]);
    const withInactive = [...board(), row("Old", "open", { isActive: false })];
    expect(keys(insertBeforeWon(withInactive, { ...withInactive[6], isActive: true }))).toEqual(["Prospect", "Qualified", "Negotiation", "Proposal", "Old", "Won", "Lost"]);
  });

  it("normalizes any order: entry first, Won, Lost, inactive last", () => {
    const shuffled = [row("Lost", "lost"), row("Old", "open", { isActive: false }), row("Won", "won"), row("B", "open"), row("Prospect", "entry"), row("A", "quotation")];
    expect(keys(normalizeOrder(shuffled))).toEqual(["Prospect", "B", "A", "Won", "Lost", "Old"]);
  });
});

describe("what blocks a delete or a deactivate", () => {
  it("required stages can't be deleted or deactivated", () => {
    for (const outcome of ["entry", "quotation", "won", "lost"] as const) {
      expect(deleteBlockReason(row("x", outcome))).toBe("Required stages can't be deleted");
      expect(deactivateBlockReason(row("x", outcome))).toBe("Required stages can't be deactivated");
    }
  });

  it("a stage with deals can't be deleted, but can be deactivated", () => {
    expect(deleteBlockReason(row("x", "open", { dealCount: 5 }))).toBe("5 deal(s) are still in this stage. Move them first.");
    expect(deleteBlockReason(row("x", "open", { dealCount: 1 }))).toBe("1 deal(s) are still in this stage. Move them first.");
    expect(deactivateBlockReason(row("x", "open", { dealCount: 5 }))).toBeNull();
  });

  it("an empty extra stage can be both", () => {
    expect(deleteBlockReason(row("x", "open"))).toBeNull();
    expect(deactivateBlockReason(row("x", "open"))).toBeNull();
  });

  it("confirm title", () => {
    expect(deleteConfirmTitle(" Survey ")).toBe("Delete stage Survey?");
    expect(deleteConfirmTitle("")).toBe("Delete stage this stage?");
  });
});

describe("names", () => {
  it("required, at most 100 characters", () => {
    const errors = validateNames([{ key: "a", name: "  " }, { key: "b", name: "x".repeat(101) }, { key: "c", name: "x".repeat(100) }]);
    expect(errors).toEqual({ a: "Name is required", b: "Name must be 100 characters or fewer" });
  });

  it("no two stages with the same name, ignoring case and spaces", () => {
    expect(validateNames([{ key: "a", name: "Inquiry" }, { key: "b", name: " inquiry " }, { key: "c", name: "Other" }])).toEqual({
      b: "Another stage already has this name",
    });
  });

  it("required stages get suggestions by what they do, even after a rename", () => {
    expect(nameSuggestions({ outcome: "quotation", name: "Quotation" })).toEqual(["Proposal", "Quotation", "Quote Sent", "Offer", "Proposal Sent", "Pricing"]);
    expect(nameSuggestions({ outcome: "entry", name: "Anything" })?.[0]).toBe("Prospect");
    expect(nameSuggestions({ outcome: "won", name: "AJB" })).toContain("Deal Won");
    expect(nameSuggestions({ outcome: "lost", name: "x" })).toContain("Disqualified");
  });

  it("Qualified and Negotiation by their default name or a suggestion of it", () => {
    expect(nameSuggestions({ outcome: "open", name: "Qualified" })?.[0]).toBe("Qualified");
    expect(nameSuggestions({ outcome: "open", name: "interested" })?.[0]).toBe("Qualified");
    expect(nameSuggestions({ outcome: "open", name: "Survey", defaultName: "Negotiation" })?.[0]).toBe("Negotiation");
    expect(nameSuggestions({ outcome: "open", name: "Survey Lokasi" })).toBeNull();
  });
});

describe("isQuotationStage", () => {
  it("by what the stage does, not its name or colour", () => {
    expect(isQuotationStage(row("Quotation Sent", "quotation", { color: "#EC4899" }))).toBe(true);
    for (const outcome of ["entry", "open", "won", "lost"] as const) expect(isQuotationStage(row("Proposal", outcome))).toBe(false);
  });
});

describe("stage limit", () => {
  it("8 stages, inactive ones included", () => {
    expect(MAX_STAGES).toBe(8);
    expect(canAddStage(7)).toBe(true);
    expect(canAddStage(8)).toBe(false);
    expect(canAddStage(12)).toBe(false);
  });

  it("count label", () => {
    expect(stageCountLabel(6)).toBe("6 of 8 stages");
    expect(stageCountLabel(8, 2)).toBe("8 of 8 stages (2 inactive)");
  });

  it("no message while a stage can be added", () => {
    expect(stageLimitMessage(7, 3)).toBeNull();
  });

  it("at the limit, and above it (a pipeline set up before the limit)", () => {
    expect(stageLimitMessage(8)).toBe("You've reached the maximum of 8 stages. Delete a stage to add another.");
    expect(stageLimitMessage(8, 2)).toContain("Inactive stages count too (2 here).");
    expect(stageLimitMessage(12)).toBe(
      "This pipeline has 12 stages, more than the maximum of 8. They all keep working, but you can only add a stage after deleting enough to get below 8.",
    );
  });
});

describe("canManageStages", () => {
  it("only Admin, however it is written", () => {
    for (const role of ["Admin", "ADMIN", " admin "]) expect(canManageStages(role)).toBe(true);
    for (const role of ["Manager", "Staff", "Super Admin", "super_admin", "", null, undefined]) expect(canManageStages(role)).toBe(false);
  });
});

describe("colours", () => {
  it("hex in any common spelling", () => {
    expect(normalizeHex("#26c6f9")).toBe("#26C6F9");
    expect(normalizeHex("26C6F9")).toBe("#26C6F9");
    expect(normalizeHex("#abc")).toBe("#AABBCC");
    for (const bad of ["", "#12345", "red", "#GGGGGG"]) expect(normalizeHex(bad)).toBeNull();
  });

  it("tints for the column and chips; grey when there is no colour", () => {
    expect(stageTint("#26C6F9", 0.1)).toBe("rgba(38, 198, 249, 0.1)");
    expect(stageTint(null, 0.16)).toBe("rgba(156, 163, 175, 0.16)");
  });

  it("palette of ten, starting with the defaults' colours", () => {
    expect(STAGE_PALETTE).toHaveLength(10);
    expect(STAGE_PALETTE.slice(0, 6)).toEqual(DEFAULT_STAGES.map((s) => s.color));
  });
});

describe("rows", () => {
  it("the six defaults for Customize, with their jobs", () => {
    const rows = defaultDraftRows();
    expect(rows.map((r) => [r.name, r.outcome, r.isLocked])).toEqual([
      ["Prospect", "entry", true],
      ["Qualified", "open", false],
      ["Negotiation", "open", false],
      ["Proposal", "quotation", true],
      ["Closed - Won", "won", true],
      ["Closed - Lost", "lost", true],
    ]);
    expect(rows.every((r) => r.id === null)).toBe(true);
  });

  it("from the API, sorted, with counts and a colour for every stage", () => {
    const stage = (id: string, outcome: PipelineStage["outcome"], display_order: number, extra: Partial<PipelineStage> = {}): PipelineStage => ({
      id, name: id, outcome, display_order, color: "#26c6f9", is_locked: outcome !== "open", is_active: true, deal_count: 2, ...extra,
    });
    const rows = rowsFromStages([
      stage("Lost", "lost", 5),
      stage("Interested", "open", 1, { color: null }),
      stage("Prospect", "entry", 0),
      stage("Old", "open", 9, { is_active: false, deal_count: null }),
      stage("Won", "won", 4),
    ]);
    expect(keys(rows)).toEqual(["Prospect", "Interested", "Won", "Lost", "Old"]);
    expect(rows[1]).toMatchObject({ color: "#9CA3AF", defaultName: "Qualified", dealCount: 2 });
    expect(rows[0].color).toBe("#26C6F9");
    expect(rows[4]).toMatchObject({ isActive: false, dealCount: 0 });
  });
});
