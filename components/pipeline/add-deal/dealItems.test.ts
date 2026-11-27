import { describe, expect, it } from "vitest";
import {
  buildBulkBody,
  emptyItem,
  isItemComplete,
  isProductTaken,
  mapBulkErrors,
  missingFields,
  parseLimit,
  toApiDate,
  validateItem,
  type DealItemDraft,
} from "./dealItems";

const NOW = new Date(2026, 10, 27, 10, 0); // 27 Nov 2026, 10:00 local

function complete(over: Partial<DealItemDraft> = {}): DealItemDraft {
  return {
    ...emptyItem({ product_id: "p1", sku: "FIN-PRO", product_name: "SmartAudit Finance Pro" }),
    deal_stage: "Prospect",
    expected_close_date: new Date(2026, 11, 31),
    quantity: 2,
    probability_of_close: "40",
    ...over,
  };
}

describe("validateItem / missingFields", () => {
  it("an item added from the AI recommendation only has its product, so it needs the rest", () => {
    const fromAi = emptyItem({ product_id: "p1", sku: "FIN-PRO", product_name: "Pro", reason: "Cocok" });
    expect(missingFields(fromAi, NOW)).toEqual(["deal_stage", "expected_close_date", "probability_of_close"]);
    expect(isItemComplete(fromAi, NOW)).toBe(false);
  });

  it("a filled item is complete", () => {
    expect(validateItem(complete(), NOW)).toEqual({});
    expect(isItemComplete(complete(), NOW)).toBe(true);
  });

  it("today is allowed, yesterday is not", () => {
    expect(validateItem(complete({ expected_close_date: new Date(2026, 10, 27) }), NOW)).toEqual({});
    expect(validateItem(complete({ expected_close_date: new Date(2026, 10, 26) }), NOW).expected_close_date).toMatch(/today/);
  });

  it("quantity must be a whole number above 0; probability 0 means not picked", () => {
    expect(missingFields(complete({ quantity: 0 }), NOW)).toEqual(["quantity"]);
    expect(missingFields(complete({ quantity: 1.5 }), NOW)).toEqual(["quantity"]);
    expect(missingFields(complete({ probability_of_close: "0" }), NOW)).toEqual(["probability_of_close"]);
    expect(missingFields(complete({ product_id: "" }), NOW)).toEqual(["product_id"]);
  });
});

describe("isProductTaken", () => {
  it("blocks the same product twice, but not the item being edited", () => {
    const a = complete({ key: "a", product_id: "p1" });
    const b = complete({ key: "b", product_id: "p2" });
    expect(isProductTaken([a, b], "p1")).toBe(true);
    expect(isProductTaken([a, b], "p1", "a")).toBe(false);
    expect(isProductTaken([a, b], "p3")).toBe(false);
  });
});

describe("buildBulkBody", () => {
  it("shares client/lead/assignee and sends each item in API shape", () => {
    const body = buildBulkBody(
      { client_account: "c1", lead_id: "l1", assigned_to: "u1" },
      [complete({ notes: "  " }), complete({ product_id: "p2", notes: "Add-on", probability_of_close: "100" })],
    );
    expect(body).toEqual({
      client_account: "c1",
      lead_id: "l1",
      assigned_to: "u1",
      items: [
        { product_id: "p1", deal_stage: "Prospect", expected_close_date: "2026-12-31", quantity: 2, probability_of_close: 40, notes: null },
        { product_id: "p2", deal_stage: "Prospect", expected_close_date: "2026-12-31", quantity: 2, probability_of_close: 100, notes: "Add-on" },
      ],
    });
  });

  it("leaves assigned_to out when empty, so the API uses the lead's assignee", () => {
    const body = buildBulkBody({ client_account: "c1", lead_id: "l1", assigned_to: "" }, [complete()]);
    expect("assigned_to" in body).toBe(false);
  });

  it("formats the date in local time", () => {
    expect(toApiDate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});

describe("parseLimit", () => {
  it("accepts whole numbers 1-20 only", () => {
    expect(parseLimit("3")).toBe(3);
    expect(parseLimit("1")).toBe(1);
    expect(parseLimit("20")).toBe(20);
    expect(parseLimit("0")).toBeNull();
    expect(parseLimit("21")).toBeNull();
    expect(parseLimit("2.5")).toBeNull();
    expect(parseLimit("")).toBeNull();
    expect(parseLimit("abc")).toBeNull();
  });
});

describe("mapBulkErrors", () => {
  it("puts 422 errors on the item named in loc", () => {
    const r = mapBulkErrors({
      success: false,
      error: "Validation error",
      validation: [
        { type: "greater_than_equal", loc: ["body", "items", "1", "quantity"], msg: "must be >= 1" },
        { type: "missing", loc: ["body", "items", "0", "deal_stage"], msg: "Field required" },
      ],
    });
    expect(r.byIndex).toEqual({ 1: { quantity: "must be >= 1" }, 0: { deal_stage: "Field required" } });
    expect(r.general).toBeUndefined();
  });

  it("puts a 404 product error on details.index", () => {
    const r = mapBulkErrors({ success: false, error: "Product not found", details: { field: "items", index: 2, product_id: "p9" } });
    expect(r.byIndex).toEqual({ 2: { product_id: "Product not found" } });
  });

  it("keeps errors without an item as a general message", () => {
    const r = mapBulkErrors({ success: false, error: "Lead must be Contacted or Qualified" });
    expect(r.byIndex).toEqual({});
    expect(r.general).toBe("Lead must be Contacted or Qualified");
  });
});
