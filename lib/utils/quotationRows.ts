// lib/utils/quotationRows.ts
//
// The quotation form's line builders that don't depend on React state: a blank
// line, and the lines a client's order fills in.

import type { QuotationLeadItem } from "@/lib/api/quotations";
import type { ItemRow } from "@/lib/types/Quotation";

export const newRow = (): ItemRow => ({
  product_id: "",
  title: "",
  sku: "",
  desc: "",
  qty: 1,
  unitPrice: 0,
  listPrice: 0,
  discountType: "percent",
  discountValue: 0,
  unitLabel: null,
  unitPrecision: 2,
  attributes: {},
  overridePrice: null,
  overrideReason: "",
  overrideAllowed: false,
  priceList: null,
  billingPeriod: null,
  // A row that has never been saved has no server-computed margin, and the
  // preview does not carry one. Null, never 0 - see ItemRow.
  costSnapshot: null,
  marginPercent: null,
  // COMMERCIAL Phase 5 (spec I8). `unitId` null = the product's own unit,
  // which is what every pre-Phase-5 line means; everything else is read-only
  // context the server decides and the preview fills in.
  unitId: null,
  unitOptions: [],
  variantValues: {},
  parentName: null,
  bundleComponents: null,
  promoCode: null,
  promoDiscountAmount: null,
  prePromoUnitPrice: null,
});

/**
 * The price a freshly picked product shows until the preview lands: the
 * customer's resolved price when known, else the catalogue price. Both are
 * provisional, which is what the "Harga sementara" note under the price says.
 */
export function seedUnitPrice(
  price: string | number,
  resolvedPrice?: string | number | null
): number {
  const seeded =
    resolvedPrice !== null && resolvedPrice !== undefined ? Number(resolvedPrice) : Number(price);
  return Number.isFinite(seeded) ? seeded : Number(price);
}

/**
 * Lines from what the client ordered: the products of their Proposal-stage
 * deals, which `GET /quotations/lead` returns as the lead's `items`.
 *
 * Each line is seeded the way picking the product by hand seeds it (see
 * `handleProductChange` in ProductsServicesTable), plus the deal's quantity
 * and notes. They are ordinary lines: every field stays editable, and the
 * preview re-prices them like any other.
 */
export function rowsFromLeadOrder(items: QuotationLeadItem[]): ItemRow[] {
  return items.map((item) => ({
    ...newRow(),
    product_id: item.id,
    title: item.product_name,
    sku: item.sku,
    desc: item.notes ?? "",
    qty: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    unitPrice: seedUnitPrice(item.price, item.resolved_unit_price),
    listPrice: Number(item.price),
    unitLabel: item.unit?.name ?? null,
    unitPrecision: item.unit?.precision ?? 2,
    attributes: item.custom_fields ?? {},
    variantValues: item.variant_values ?? {},
    parentName: item.parent?.product_name ?? null,
  }));
}

/**
 * What a client's order does to the lines already on the form: fill them when
 * no product has been picked yet, ask first when one has (the seller's own
 * work would be replaced), and nothing when there is no order.
 */
export function orderFillAction(
  currentRows: ItemRow[],
  orderRows: ItemRow[]
): "fill" | "confirm" | "none" {
  if (orderRows.length === 0) return "none";
  return currentRows.some((row) => row.product_id) ? "confirm" : "fill";
}
