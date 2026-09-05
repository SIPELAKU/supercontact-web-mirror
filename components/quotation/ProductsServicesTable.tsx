"use client";

import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import { formatRupiah } from "@/lib/helper/currency";
import { stepForPrecision } from "@/lib/helper/quantity";
import type { CustomFieldDefinitionLike } from "@/lib/types/CustomFieldDefinition";
import type {
  DiscountType,
  ItemRow,
  QuotationBillingPeriod,
  QuotationLineTotals,
  QuotationTotals,
} from "@/lib/types/Quotation";
import { billingPeriodSuffix, describePriceSource, priceSourceTone } from "@/lib/utils/priceSource";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { AppButton } from "../ui/app-button";
import { AppInput } from "../ui/app-input";
import { AppSelect } from "../ui/app-select";

/** The little the picker needs from a catalogue row. */
export interface PickerProduct {
  id: string;
  product_name: string;
  sku: string;
  price: string | number;
  /** Phase 1: the unit (precision = Qty step hint, name = suffix) and live attributes. */
  unit?: { id: string; code: string; name: string; precision: number } | null;
  custom_fields?: Record<string, unknown>;
  /** Phase 2: a recurring line prints its period after the price (spec A24). */
  billing_period?: QuotationBillingPeriod | null;
  /**
   * Phase 2 (spec D6): the price THIS customer resolves to, when the picker
   * knows it. `price` stays the catalogue row, which is what `listPrice` shows
   * struck through.
   */
  resolvedPrice?: string | number | null;
}

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "%" },
  { value: "amount", label: "Rp" },
];

/** Fields that get their own inline message; anything else shows on the row. */
const FIELD_SLOTS = new Set([
  "discount",
  "discount_value",
  "discount_type",
  "quantity",
  "product_id",
  // Phase 2: the server's override refusals land under the controls the seller
  // actually used, not in the unlabelled red paragraph at the bottom of the row.
  "unit_price",
  "override_reason",
]);

/** Chip tone for the price-source label under a unit price. */
const SOURCE_CHIP_CLASS: Record<string, string> = {
  neutral: "bg-gray-100 text-gray-600",
  list: "bg-sky-100 text-sky-800",
  manual: "bg-amber-100 text-amber-900",
};

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export default function ProductsServicesCard({
  items,
  updateQty,
  updateItemField,
  addItem,
  removeItem,
  listProduct = [],
  loading = false,
  totals = null,
  rowErrors = {},
  rowMessages = {},
  readOnly = false,
  productDefinitions,
  previewing = false,
  previewFailed = false,
  priceContext = "none",
}: {
  items: ItemRow[];
  updateQty: (i: number, qty: number) => void;
  updateItemField: (i: number, field: keyof ItemRow, value: any) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  /** Active catalogue rows (GET /products?status=active). */
  listProduct?: PickerProduct[];
  loading?: boolean;
  /** Server-computed lines, by row index. */
  totals?: QuotationTotals | null;
  /** Field-level messages per row (mapQuotationError().fieldsByRow). */
  rowErrors?: Record<number, Record<string, string>>;
  /** Row-level messages (mapQuotationError().byRow). */
  rowMessages?: Record<number, string>;
  readOnly?: boolean;
  /** The tenant's active `product` definitions, so line attributes print their labels. */
  productDefinitions?: CustomFieldDefinitionLike[];
  /** A preview is in flight: the price on screen is still the previous answer. */
  previewing?: boolean;
  /** The last preview failed, so there is no server price for these rows. */
  previewFailed?: boolean;
  /** `none` = priced with no customer context yet (spec A12). */
  priceContext?: "lead" | "none";
}) {
  const linesByIndex = useMemo(() => {
    const map = new Map<number, QuotationLineTotals>();
    totals?.lines?.forEach((line) => map.set(line.index, line));
    return map;
  }, [totals]);

  const handleProductChange = (index: number, productId: string) => {
    const selected = listProduct.find((p) => p.id === productId);
    if (!selected) return;
    updateItemField(index, "product_id", selected.id);
    updateItemField(index, "title", selected.product_name);
    updateItemField(index, "sku", selected.sku);
    // A fresh pick shows the customer's resolved price when the picker carries
    // one, else the catalogue price - both provisional until the preview lands,
    // which is what the "Harga sementara" note under the price says. An
    // existing row keeps what was stored (the form seeds unitPrice from
    // item.unit_price, never product.price).
    const seeded =
      selected.resolvedPrice !== null && selected.resolvedPrice !== undefined
        ? Number(selected.resolvedPrice)
        : Number(selected.price);
    updateItemField(index, "unitPrice", Number.isFinite(seeded) ? seeded : Number(selected.price));
    updateItemField(index, "listPrice", Number(selected.price));
    // The unit is a display/step hint; the server re-checks the quantity
    // against the unit's CURRENT precision at save time (spec A5/A12).
    updateItemField(index, "unitLabel", selected.unit?.name ?? null);
    updateItemField(index, "unitPrecision", selected.unit?.precision ?? 2);
    updateItemField(index, "attributes", selected.custom_fields ?? {});
    updateItemField(index, "billingPeriod", selected.billing_period ?? null);
    // A different product is a different price: an override typed for the old
    // one must not silently carry over, reason and all.
    updateItemField(index, "overridePrice", null);
    updateItemField(index, "overrideReason", "");
  };

  const baseOptions = useMemo(
    () =>
      listProduct.map((p) => ({
        value: p.id,
        label: `${p.sku} — ${p.product_name}`,
      })),
    [listProduct]
  );

  const optionsForRow = (item: ItemRow) => {
    // A stored line can point at a product that is no longer active (archived
    // since the draft was written). Keep it selectable-as-is so the row shows
    // its snapshot instead of a bare UUID; the server refuses it on save with
    // a message under this very row.
    if (item.product_id && !listProduct.some((p) => p.id === item.product_id)) {
      return [
        { value: item.product_id, label: `${item.sku || "?"} — ${item.title || "Produk tidak aktif"}` },
        ...baseOptions,
      ];
    }
    return baseOptions;
  };

  const getPlaceholder = () => (listProduct.length === 0 ? "Belum ada produk aktif" : "Pilih produk");

  return (
    <div className="bg-white px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
      </div>

      <div className="hidden sm:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-200">
        <div className="col-span-4 text-xs font-semibold text-gray-700">Produk</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Qty</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Harga satuan</div>
        <div className="col-span-3 text-xs font-semibold text-gray-700">Total baris</div>
        <div className="col-span-1"></div>
      </div>

      {items.map((item, i) => {
        const fields = rowErrors[i] ?? {};
        const discountError = fields.discount ?? fields.discount_value ?? fields.discount_type;
        const quantityError = fields.quantity;
        const productError = fields.product_id;
        const otherErrors = Object.entries(fields)
          .filter(([key]) => !FIELD_SLOTS.has(key))
          .map(([, message]) => message);
        // A row-level message with no field slot at all (malformed entry).
        if (otherErrors.length === 0 && rowMessages[i] && Object.keys(fields).length === 0) {
          otherErrors.push(rowMessages[i]);
        }

        const line = linesByIndex.get(i);
        const fallbackTotal = round2(item.qty * Number(item.unitPrice));
        const unitPriceError = fields.unit_price;
        const overrideReasonError = fields.override_reason;
        // The preview's line is the fresher answer and the one the server will
        // validate the override against; the stored row seeds a read-only view
        // before any preview runs.
        const priceList = line?.price_list ?? item.priceList ?? null;
        const overrideAllowed = line?.override_allowed ?? item.overrideAllowed ?? false;
        const billingPeriod = line?.billing_period ?? item.billingPeriod ?? null;
        const hasOverride = item.overridePrice !== null;
        const sourceLabel = line ? describePriceSource(line.price_source, priceList) : "";
        const sourceTone = line ? priceSourceTone(line.price_source) : "neutral";
        // Only the server prices a line. Until its answer lands the catalogue
        // price is provisional; once the preview has FAILED there is no price
        // to show at all, and printing the catalogue one would be a guess.
        const pricePending = !line && !previewFailed;
        const shownPrice = line
          ? line.unit_price
          : hasOverride
            ? item.overridePrice ?? 0
            : item.unitPrice;
        const overrideDisabledReason = overrideAllowed
          ? null
          : priceList
            ? "Daftar harga ini tidak mengizinkan harga manual"
            : "Harga manual belum tersedia — buat daftar harga di Settings › Sales › Daftar Harga";
        // The preview's snapshot wins once available; until then the catalogue unit.
        const unitLabel = line?.unit_label_snapshot ?? item.unitLabel ?? null;
        const precision = line?.unit_precision ?? item.unitPrecision ?? 2;
        const step = stepForPrecision(precision);

        return (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:items-start">
              {/* Product picker */}
              <div className="sm:col-span-4">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Produk</span>
                <AppSelect
                  value={item.product_id}
                  placeholder={getPlaceholder()}
                  onChange={(e) => handleProductChange(i, e.target.value as string)}
                  options={optionsForRow(item)}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={readOnly || loading || (listProduct.length === 0 && !item.product_id)}
                  error={!!productError}
                  helperText={productError}
                />
                {/* Product attributes: read-only under the name, never editable
                    per line and never price-bearing (spec A8). */}
                <CustomFieldsReadOnly
                  entityType="product"
                  values={item.attributes}
                  definitions={productDefinitions}
                />
              </div>

              {/* Quantity - what the user typed, rounded to 2 dp as the float
                  guard. `min`/`step` follow the unit precision as a HINT only;
                  the server's precision refusal lands under this field. */}
              <div className="sm:col-span-2">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Qty</span>
                <AppInput
                  type="number"
                  aria-label={`Qty baris ${i + 1}`}
                  value={item.qty}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    updateQty(i, Number.isNaN(parsed) ? 0 : round2(parsed));
                  }}
                  inputProps={{ min: step, step }}
                  endIcon={
                    unitLabel ? (
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{unitLabel}</span>
                    ) : undefined
                  }
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={readOnly}
                  error={!!quantityError}
                  helperText={quantityError}
                />
              </div>

              {/* Unit price: the SERVER's resolved price, why it is that price,
                  and - where the winning list permits it - the manual override. */}
              <div className="sm:col-span-2 text-sm text-gray-900 font-medium sm:pt-3">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Harga satuan</span>
                {previewFailed && !line ? (
                  <span className="text-gray-400" title="Harga belum bisa dihitung server">
                    &mdash;
                  </span>
                ) : (
                  <span className={pricePending ? "text-gray-500" : undefined}>
                    {formatRupiah(shownPrice)}
                    {billingPeriod && (
                      <span className="text-xs font-normal text-gray-500">
                        {billingPeriodSuffix(billingPeriod)}
                      </span>
                    )}
                  </span>
                )}
                {line && Number(line.list_price) !== Number(line.unit_price) && (
                  <span className="block text-xs text-gray-500 line-through">
                    {formatRupiah(line.list_price)}
                  </span>
                )}
                {pricePending && item.product_id && (
                  <span className="block text-[11px] text-gray-400">
                    {previewing ? "Menghitung harga..." : "Harga sementara"}
                  </span>
                )}
                {sourceLabel && (
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${SOURCE_CHIP_CLASS[sourceTone]}`}
                  >
                    {sourceLabel}
                  </span>
                )}
                {line?.override_reason && (
                  <span className="block text-[11px] text-gray-500">
                    Alasan: {line.override_reason}
                  </span>
                )}

                {/* The control lives with the price it changes; its inputs get
                    a full-width block below, because this column is 2/12 wide
                    and a reason textarea does not fit in it. */}
                {!readOnly && !hasOverride && (
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateItemField(i, "overridePrice", round2(Number(shownPrice) || 0));
                        updateItemField(i, "overrideReason", "");
                      }}
                      disabled={!overrideAllowed}
                      className="text-xs font-medium text-[#5479EE] underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
                    >
                      Ubah harga
                    </button>
                    {overrideDisabledReason && (
                      <span className="block text-[11px] text-gray-500">{overrideDisabledReason}</span>
                    )}
                    {priceContext === "none" && overrideAllowed && (
                      <span className="block text-[11px] text-gray-500">
                        Pilih pelanggan dulu agar harga manual dinilai dengan daftar harga yang benar.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Line total: server value once previewed, local qty x price
                  until then - and a DASH once the preview has failed, exactly
                  like the unit price above it. `item.unitPrice` is seeded from
                  the CATALOGUE row, which Phase 2 makes systematically wrong
                  for any tenant using price lists, so qty x that price is a
                  guess with no marker on it. */}
              <div className="sm:col-span-3 text-sm text-gray-900 font-semibold sm:pt-3">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Total baris</span>
                {line ? (
                  formatRupiah(line.line_total)
                ) : previewFailed ? (
                  <span className="text-gray-400" title="Total belum bisa dihitung server">
                    &mdash;
                  </span>
                ) : (
                  formatRupiah(fallbackTotal)
                )}
                {line && Number(line.discount_amount) > 0 && (
                  <span className="block text-xs text-gray-500 font-normal">
                    Diskon {formatRupiah(line.discount_amount)}
                  </span>
                )}
              </div>

              {/* Remove */}
              <div className="sm:col-span-1 flex justify-end sm:pt-3">
                {!readOnly && (
                  <button
                    type="button"
                    aria-label={`Hapus baris ${i + 1}`}
                    onClick={() => removeItem(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* The manual override, revealed by "Ubah harga". Both refusals the
                server can return for it land under their own control here
                (`unit_price`, `override_reason` are in FIELD_SLOTS). */}
            {!readOnly && hasOverride && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <AppInput
                      type="number"
                      label="Harga manual"
                      aria-label={`Harga manual baris ${i + 1}`}
                      value={item.overridePrice ?? 0}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        updateItemField(i, "overridePrice", Number.isNaN(parsed) ? 0 : round2(parsed));
                      }}
                      inputProps={{ min: 0, step: 1 }}
                      isBgWhite
                      height="48px"
                      rounded="8px"
                      error={!!unitPriceError}
                      helperText={unitPriceError}
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <AppInput
                      multiline
                      minRows={2}
                      label="Alasan harga manual"
                      required
                      aria-label={`Alasan harga manual baris ${i + 1}`}
                      placeholder="mis. kesepakatan kontrak tahunan"
                      value={item.overrideReason}
                      onChange={(e) => updateItemField(i, "overrideReason", e.target.value)}
                      inputProps={{ maxLength: 500 }}
                      isBgWhite
                      rounded="8px"
                      error={!!overrideReasonError}
                      helperText={
                        overrideReasonError ??
                        "Tersimpan bersama baris quotation dan tercatat di log aktivitas."
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateItemField(i, "overridePrice", null);
                    updateItemField(i, "overrideReason", "");
                  }}
                  className="mt-2 text-xs font-medium text-gray-600 underline-offset-2 hover:underline"
                >
                  Batalkan harga manual - kembali ke harga daftar
                </button>
              </div>
            )}

            {/* Row 2: notes and discount */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
              <div className="sm:col-span-7">
                <AppInput
                  label="Catatan"
                  placeholder="Catatan baris"
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  value={item.desc}
                  onChange={(e) => updateItemField(i, "desc", e.target.value)}
                  disabled={readOnly}
                />
              </div>

              <div className="sm:col-span-2">
                <AppSelect
                  label="Tipe diskon"
                  value={item.discountType}
                  onChange={(e) => updateItemField(i, "discountType", e.target.value as DiscountType)}
                  options={DISCOUNT_TYPE_OPTIONS}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={readOnly}
                />
              </div>

              <div className="sm:col-span-3">
                <AppInput
                  type="number"
                  label="Diskon"
                  endIcon={
                    <span className="text-gray-500 font-medium">
                      {item.discountType === "percent" ? "%" : "Rp"}
                    </span>
                  }
                  placeholder="0"
                  value={item.discountValue}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (Number.isNaN(val) || val < 0) val = 0;
                    // No 100 clamp here: the discount policy is the server's
                    // call and comes back under this field with its reason.
                    updateItemField(i, "discountValue", round2(val));
                  }}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  inputProps={{ min: 0, step: item.discountType === "percent" ? 0.01 : 1 }}
                  disabled={readOnly}
                  error={!!discountError}
                  helperText={discountError}
                />
              </div>
            </div>

            {otherErrors.length > 0 && (
              <p className="mt-2 text-xs text-red-600" role="alert">
                {otherErrors.join("; ")}
              </p>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <AppButton variantStyle="primary" color="primary" onClick={addItem} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" /> Tambah baris
        </AppButton>
      )}
    </div>
  );
}
