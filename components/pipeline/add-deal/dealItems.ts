// components/pipeline/add-deal/dealItems.ts
//
// Add Deal with many products (one client/lead, one card per product).
// Pure rules for the item list: what an item still needs before it can be
// saved, the request body, and which item an API error belongs to.

import {
  RECOMMENDATION_LIMIT,
  type CreatePipelinesBulkRequest,
  type CreatePipelinesBulkResult,
} from "@/lib/api/pipelines";
import { isCloseDateAllowed, PAST_CLOSE_DATE_MESSAGE } from "../dealCloseDate";

/** The API takes 1-50 items per save. */
export const MAX_DEAL_ITEMS = 50;

/** The deal form's probability choices ("0" = not picked yet). */
export const PROBABILITY_OPTIONS = [
  { label: "20%", value: "20" },
  { label: "40%", value: "40" },
  { label: "60%", value: "60" },
  { label: "80%", value: "80" },
  { label: "100%", value: "100" },
];

/** One product line in Add Deal, before it is saved. */
export interface DealItemDraft {
  /** Local id, stable while the list changes. */
  key: string;
  product_id: string;
  sku: string;
  product_name: string;
  deal_stage: string;
  expected_close_date?: Date;
  quantity: number;
  /** "0" = not picked yet (same as the single deal form). */
  probability_of_close: string;
  notes: string;
  /** Added from the AI recommendation (shown with its reason). */
  reason?: string;
}

export type DealItemField =
  | "product_id"
  | "deal_stage"
  | "expected_close_date"
  | "quantity"
  | "probability_of_close";

export type DealItemErrors = Partial<Record<DealItemField | "notes", string>>;

/** Labels for "still needs ..." on an item row. */
export const ITEM_FIELD_LABELS: Record<DealItemField, string> = {
  product_id: "Product",
  deal_stage: "Deal Stage",
  expected_close_date: "Expected Close Date",
  quantity: "Quantity",
  probability_of_close: "Probability",
};

let keySeq = 0;
export function newItemKey(): string {
  keySeq += 1;
  return `item-${Date.now().toString(36)}-${keySeq}`;
}

/** A new line for one product; the rest is filled in the item form. */
export function emptyItem(product?: { product_id: string; sku: string; product_name: string; reason?: string }): DealItemDraft {
  return {
    key: newItemKey(),
    product_id: product?.product_id ?? "",
    sku: product?.sku ?? "",
    product_name: product?.product_name ?? "",
    deal_stage: "",
    expected_close_date: undefined,
    quantity: 1,
    probability_of_close: "0",
    notes: "",
    reason: product?.reason,
  };
}

/**
 * The same checks the single Add Deal form makes, per item. An item added
 * from the AI recommendation only has its product, so it starts with errors
 * here and its row asks for the rest.
 */
export function validateItem(item: DealItemDraft, now: Date = new Date()): DealItemErrors {
  const errs: DealItemErrors = {};
  if (!item.product_id) errs.product_id = "Product is required";
  if (!item.deal_stage) errs.deal_stage = "Deal stage is required";
  if (!item.expected_close_date) errs.expected_close_date = "Expected close date is required";
  // A new deal has no saved date, so any past day is refused (the calendar
  // already blocks it; this catches a dialog left open past midnight).
  else if (!isCloseDateAllowed(item.expected_close_date, undefined, now)) errs.expected_close_date = PAST_CLOSE_DATE_MESSAGE;
  if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
    errs.quantity = "Quantity must be a whole number greater than 0";
  }
  if (!item.probability_of_close || item.probability_of_close === "0") {
    errs.probability_of_close = "Probability is required";
  }
  return errs;
}

/** Fields of an item that are still empty or invalid, in form order. */
export function missingFields(item: DealItemDraft, now: Date = new Date()): DealItemField[] {
  const errs = validateItem(item, now);
  return (Object.keys(ITEM_FIELD_LABELS) as DealItemField[]).filter((f) => errs[f]);
}

export function isItemComplete(item: DealItemDraft, now: Date = new Date()): boolean {
  return missingFields(item, now).length === 0;
}

/** A product may be on the list once (one card per product). */
export function isProductTaken(items: DealItemDraft[], productId: string, exceptKey?: string): boolean {
  return items.some((i) => i.product_id === productId && i.key !== exceptKey);
}

/** The AI dropdown's "how many" input: a whole number 1-20, else null. */
export function parseLimit(raw: string): number | null {
  const n = Number(raw);
  if (!raw.trim() || !Number.isInteger(n)) return null;
  return n >= RECOMMENDATION_LIMIT.min && n <= RECOMMENDATION_LIMIT.max ? n : null;
}

/** "YYYY-MM-DD" in local time, the format the single form already sends. */
export function toApiDate(date?: Date): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DealShared {
  client_account: string;
  lead_id: string;
  assigned_to: string;
}

export function buildBulkBody(shared: DealShared, items: DealItemDraft[]): CreatePipelinesBulkRequest {
  return {
    client_account: shared.client_account,
    lead_id: shared.lead_id,
    // Empty = the API uses the lead's assignee.
    ...(shared.assigned_to ? { assigned_to: shared.assigned_to } : {}),
    items: items.map((i) => ({
      product_id: i.product_id,
      deal_stage: i.deal_stage,
      expected_close_date: toApiDate(i.expected_close_date),
      quantity: i.quantity,
      probability_of_close: Number(i.probability_of_close),
      notes: i.notes.trim() ? i.notes : null,
    })),
  };
}

const ITEM_FIELDS = new Set<string>([...Object.keys(ITEM_FIELD_LABELS), "notes"]);

/**
 * Splits a failed save into errors per item (by list position) and a message
 * for the whole deal. 422 field errors carry the item index in `loc`
 * (["body", "items", 1, "quantity"]); a 404 for a product names it in
 * `details.index`. Anything else (lead status, stage, client) has no item and
 * stays general.
 */
export function mapBulkErrors(result: CreatePipelinesBulkResult): {
  byIndex: Record<number, DealItemErrors>;
  general?: string;
} {
  const byIndex: Record<number, DealItemErrors> = {};
  const put = (index: number, field: string, msg: string) => {
    const key = (ITEM_FIELDS.has(field) ? field : "product_id") as keyof DealItemErrors;
    byIndex[index] = { ...byIndex[index], [key]: msg };
  };

  let general: string | undefined;
  for (const v of result.validation ?? []) {
    const at = v.loc.indexOf("items");
    const index = at >= 0 ? Number(v.loc[at + 1]) : NaN;
    if (Number.isInteger(index)) put(index, String(v.loc[at + 2] ?? "product_id"), v.msg);
    else general = general ?? v.msg;
  }
  if (result.details && Number.isInteger(result.details.index)) {
    put(result.details.index as number, "product_id", result.error || "Product not found");
  }
  if (Object.keys(byIndex).length === 0) general = general ?? result.error;
  return { byIndex, general };
}
