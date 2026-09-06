"use client";

import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import {
  currencySymbol,
  formatMoney,
  formatPercent,
  formatQuantity,
  normalizeCurrencyCode,
} from "@/lib/helper/currency";
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
import { promoChipLabel } from "@/lib/constants/promotion";
import { variantValueChips } from "@/lib/utils/variantMatrix";
import { Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { AppAutocomplete } from "../ui/app-autocomplete";
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
  /**
   * COMMERCIAL Phase 5 (spec I8 / I9). A VARIANT is the sellable thing (A8), so
   * the picker has to tell one apart from its siblings AND name the family it
   * belongs to - "KAOS-MERAH-S" alone is unreadable in a list of thirty.
   */
  variant_values?: Record<string, unknown>;
  parent_name?: string | null;
  /** The product's configured conversions, for the select inside the Qty cell. */
  unit_options?: { id: string; label: string; precision: number }[];
}



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

/**
 * Chip tone for the price-source label under a unit price.
 *
 * COMMERCIAL Phase 5 (spec I8 / I2) adds `promo`, and it is its OWN tone rather
 * than a reuse of `list`: a reader must be able to tell "this line is on a
 * company promotion" from "this line came off a price list" at a glance, and
 * neither from the SELLER's discount. `priceSourceTone`'s return type was
 * widened for exactly this key (M-f).
 */
const SOURCE_CHIP_CLASS: Record<string, string> = {
  neutral: "bg-gray-100 text-gray-600",
  list: "bg-sky-100 text-sky-800",
  manual: "bg-amber-100 text-amber-900",
  promo: "bg-emerald-100 text-emerald-900",
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
  currency,
  onSearchProducts,
  searching = false,
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
  /**
   * COMMERCIAL Phase 5 (spec I8). The QUOTATION's currency - every amount in
   * this table prints in it. Undefined falls back to the company currency, so
   * an un-updated caller keeps printing rupiah exactly as before.
   */
  currency?: string;
  /**
   * COMMERCIAL Phase 5 (spec I9 / A34). Server-side product search, debounced
   * by the caller.
   *
   * The picker WAS an unsearched `AppSelect` fed by ONE request for the first
   * 100 active products (`CATALOGUE_LIMIT = 100`). Dev's largest tenant already
   * holds 193, so 93 were ALREADY unreachable with no error and no marker - the
   * seller simply saw "that product does not exist". Variants make it
   * structurally worse: 20 products x 6 variants is 120 rows.
   *
   * Passing this switches the control to `AppAutocomplete`; omitting it keeps
   * the old select, so nothing that has not been updated breaks.
   */
  onSearchProducts?: (query: string) => void;
  searching?: boolean;
}) {
  const currencyCode = normalizeCurrencyCode(totals?.currency || currency);
  const money = (value: string | number | null | undefined) =>
    formatMoney(value, currencyCode);
  // The amount-discount label was the literal 'Rp' (spec I8): on a USD line it
  // read as "discount 100 rupiah" against a server discounting 100 dollars.
  const discountTypeOptions: { value: DiscountType; label: string }[] = [
    { value: "percent", label: "%" },
    { value: "amount", label: currencySymbol(currencyCode) },
  ];
  const linesByIndex = useMemo(() => {
    const map = new Map<number, QuotationLineTotals>();
    totals?.lines?.forEach((line) => map.set(line.index, line));
    return map;
  }, [totals]);

  // Spec I3: "the seller's margin column renders only when the API returned
  // `margin_percent`". All-null is exactly the shape the API returns for a
  // caller without `quotations:margin:view` (it forces both fields to None),
  // and also for a tenant whose products carry no cost at all - in both cases
  // an empty column would be furniture that explains nothing. One line with a
  // value is enough to show it, because the other lines' blanks then MEAN
  // something: no cost recorded on that product, or a net of <= 0 (spec A7).
  const showMargin = useMemo(
    () => items.some((item) => item.marginPercent !== null && item.marginPercent !== undefined),
    [items]
  );

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
    // COMMERCIAL Phase 5 (spec I8): the picked product's own variant axes, its
    // family, and the units it can be quoted in.
    updateItemField(index, "variantValues", selected.variant_values ?? {});
    updateItemField(index, "parentName", selected.parent_name ?? null);
    updateItemField(index, "unitOptions", selected.unit_options ?? []);
    // A different product has different conversions: a unit carried over from
    // the previous product would be refused by the server with a message the
    // seller cannot act on.
    updateItemField(index, "unitId", null);
    // A different product is a different price: an override typed for the old
    // one must not silently carry over, reason and all.
    updateItemField(index, "overridePrice", null);
    updateItemField(index, "overrideReason", "");
  };

  /**
   * `SKU — Name`, and for a VARIANT `SKU — Parent / Name` (spec I9).
   *
   * Without the parent, a list of "KAOS-MERAH-S", "KAOS-MERAH-M" says nothing
   * about which family a row belongs to - and after Phase 5 a variant is the
   * thing a seller picks.
   */
  const optionLabel = (p: PickerProduct) =>
    p.parent_name
      ? `${p.sku} — ${p.parent_name} / ${p.product_name}`
      : `${p.sku} — ${p.product_name}`;

  const baseOptions = useMemo(
    () =>
      listProduct.map((p) => ({
        value: p.id,
        label: optionLabel(p),
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
        {showMargin && (
          <div className="col-span-1 text-right text-xs font-semibold text-gray-700">Margin</div>
        )}
        {/* Literal class names, both of them: Tailwind v4 scans the source for
            utilities and a template-built `col-span-${n}` is never generated. */}
        <div
          className={
            showMargin
              ? "col-span-2 text-xs font-semibold text-gray-700"
              : "col-span-3 text-xs font-semibold text-gray-700"
          }
        >
          Total baris
        </div>
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
        // `includePromo: false` (spec I8): the dedicated promo chip renders
        // immediately beside this one, and two adjacent chips both spelling
        // "LEBARAN" reads as a rendering bug. This chip names the price's
        // ORIGIN; the chip beside it names the promotion.
        const sourceLabel = line
          ? describePriceSource(line.price_source, priceList, { includePromo: false })
          : "";
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
        const unitLabel = line?.unit_label_snapshot ?? line?.unit_label ?? item.unitLabel ?? null;
        // COMMERCIAL Phase 5 (spec I8): the precision follows the CHOSEN unit,
        // because a carton and a piece do not allow the same decimals.
        const chosenUnit = item.unitOptions.find((option) => option.id === item.unitId) ?? null;
        const precision = chosenUnit?.precision ?? line?.unit_precision ?? item.unitPrecision ?? 2;
        const step = stepForPrecision(precision);
        const variantChips = variantValueChips(item.variantValues);
        // The preview is the fresher answer; the stored snapshot renders a
        // read-only view before any preview runs.
        const bundleComponents = line?.bundle_components ?? item.bundleComponents ?? null;
        const promoCode = line?.promo_code ?? item.promoCode ?? null;
        const promoAmount = line?.promo_discount_amount ?? item.promoDiscountAmount ?? null;

        return (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:items-start">
              {/* Product picker.
                  COMMERCIAL Phase 5 (spec I9 / A34): SERVER-SIDE SEARCH when
                  the caller supplies `onSearchProducts`, on the
                  `CatalogProductPicker` pattern already in the repo. The old
                  unsearched select showed the first 100 active products and
                  nothing else - 93 of dev's largest tenant's 209 were already
                  unreachable, and the failure looked exactly like "that product
                  does not exist". Variants make that structurally worse. */}
              <div className="sm:col-span-4">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Produk</span>
                {onSearchProducts ? (
                  <AppAutocomplete<{ value: string; label: string }, false, false, false>
                    isBgWhite
                    // A SEARCHABLE control must never disable itself on an
                    // empty result: a typo that returns nothing would disable
                    // the input, and a disabled input can no longer be edited
                    // or cleared - `onInputChange` never fires again, the
                    // search term is stuck forever and EVERY row's picker is
                    // dead until a full page reload throws the draft away. The
                    // emptiness term below exists only for the unsearched
                    // legacy select, which cannot go empty from user input.
                    placeholder="Cari produk (SKU atau nama)"
                    disabled={readOnly}
                    loading={searching}
                    error={!!productError}
                    helperText={productError}
                    value={
                      optionsForRow(item).find((option) => option.value === item.product_id) ?? null
                    }
                    options={optionsForRow(item)}
                    // The server already filtered; filtering again in the
                    // browser would hide rows whose match is in a column the
                    // label does not show.
                    filterOptions={(x) => x}
                    isOptionEqualToValue={(option, selected) => option.value === selected.value}
                    getOptionLabel={(option) =>
                      typeof option === "string" ? option : option.label
                    }
                    onInputChange={(_event, next, reason) => {
                      if (reason === "input") onSearchProducts(next);
                      if (reason === "clear") onSearchProducts("");
                      // Closing the popup with nothing chosen restores the
                      // unfiltered catalogue, so an abandoned search cannot
                      // leave the row looking empty.
                      // `!next` is what separates the two resets MUI fires:
                      // choosing an option resets the input to that option's
                      // LABEL (non-empty, leave the search alone), while
                      // closing the popup with no value resets it to "".
                      if (reason === "reset" && !next && !item.product_id) onSearchProducts("");
                    }}
                    onChange={(_event, next) => {
                      if (next) handleProductChange(i, next.value);
                    }}
                    noOptionsText="Produk tidak ditemukan"
                  />
                ) : (
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
                )}

                {/* VARIANT VALUES as a compact chip row directly under the
                    picker (spec I8), where `CustomFieldsReadOnly` already
                    prints the product's live attributes - the same register,
                    because both answer "which exact thing is this line". */}
                {variantChips.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {item.parentName && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                        {item.parentName}
                      </span>
                    )}
                    {variantChips.map((chip) => (
                      <span
                        key={chip.key}
                        className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800"
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Product attributes: read-only under the name, never editable
                    per line and never price-bearing (spec A8). */}
                <CustomFieldsReadOnly
                  entityType="product"
                  values={item.attributes}
                  definitions={productDefinitions}
                />

                {/* BUNDLE COMPONENTS: a read-only indented sub-block in the same
                    register - names, quantities, units, and NO MONEY (spec I8 /
                    A5). A per-component amount would imply a per-component price
                    that does not exist: the bundle is priced as ONE line. */}
                {bundleComponents && bundleComponents.length > 0 && (
                  <div className="mt-2 border-l-2 border-gray-200 pl-3">
                    <p className="text-[11px] font-medium text-gray-600">Isi paket</p>
                    <ul className="mt-0.5 space-y-0.5">
                      {bundleComponents.map((component, index) => (
                        <li
                          key={`${component.product_id}-${index}`}
                          className="text-[11px] text-gray-500"
                        >
                          {formatQuantity(component.quantity)}
                          {component.unit_label ? ` ${component.unit_label}` : ""}{" "}
                          &times; {component.product_name}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Paket ini dihargai sebagai satu baris; komponennya tidak dihargai satu per
                      satu.
                    </p>
                  </div>
                )}
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
                    /* COMMERCIAL Phase 5 (spec I8). THE UNIT SELECT GOES INSIDE
                       THE QTY CELL, replacing the static unit end-icon.

                       Nothing gets a new COLUMN: the 12-column grid is fully
                       allocated (Produk 4, Qty 2, Harga 2, Margin 1, Total 2-3,
                       delete 1) and Tailwind v4 never generates a
                       template-built `col-span-${n}`.

                       Switching it re-runs the preview (the row's `unitId` is in
                       the form's dependency array) and the precision hint above
                       follows the chosen unit. */
                    item.unitOptions.length > 0 && !readOnly ? (
                      <select
                        aria-label={`Satuan baris ${i + 1}`}
                        value={item.unitId ?? ""}
                        onChange={(e) => updateItemField(i, "unitId", e.target.value || null)}
                        className="max-w-24 border-0 bg-transparent text-xs font-medium text-gray-600 focus:outline-none"
                      >
                        <option value="">{item.unitLabel ?? "Satuan dasar"}</option>
                        {item.unitOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : unitLabel ? (
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
                    {money(shownPrice)}
                    {billingPeriod && (
                      <span className="text-xs font-normal text-gray-500">
                        {billingPeriodSuffix(billingPeriod)}
                      </span>
                    )}
                  </span>
                )}
                {line && Number(line.list_price) !== Number(line.unit_price) && (
                  <span className="block text-xs text-gray-500 line-through">
                    {money(line.list_price)}
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
                {/* THE PROMO CHIP, in its own tone beside the price-source chip
                    (spec I8). The amount is captioned SEPARATELY from
                    "Diskon <amount>" below, so a reader can never confuse the
                    COMPANY's promotion with the SELLER's discount. */}
                {promoCode && (
                  <span
                    className={`mt-1 ml-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${SOURCE_CHIP_CLASS.promo}`}
                  >
                    {promoChipLabel(promoCode)}
                  </span>
                )}
                {promoAmount && Number(promoAmount) > 0 && (
                  <span className="block text-[11px] text-emerald-700">
                    {/* `promo_discount_amount` is written per LINE (per-unit x
                        quantity, quotation_service.py E3.4), so no "per satuan"
                        here - it read quantity-times too large, and contradicted
                        the header's "Termasuk promo", which sums the very same
                        per-line numbers. */}
                    Promo perusahaan {money(promoAmount)}
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

              {/* Margin per line (spec I3). The value comes from the STORED
                  line - the preview carries none - so it appears once the
                  quotation has been saved, and only for a caller the API
                  returned it to. A dash means "no margin recorded", never 0. */}
              {showMargin && (
                <div className="sm:col-span-1 text-sm sm:pt-3 sm:text-right">
                  <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Margin</span>
                  {item.marginPercent !== null && item.marginPercent !== undefined ? (
                    <span className="font-medium text-gray-900">
                      {formatPercent(item.marginPercent)}%
                    </span>
                  ) : (
                    <span
                      className="text-gray-400"
                      title="Produk ini belum punya HPP, atau nilai bersih barisnya nol"
                    >
                      &mdash;
                    </span>
                  )}
                </div>
              )}

              {/* Line total: server value once previewed, local qty x price
                  until then - and a DASH once the preview has failed, exactly
                  like the unit price above it. `item.unitPrice` is seeded from
                  the CATALOGUE row, which Phase 2 makes systematically wrong
                  for any tenant using price lists, so qty x that price is a
                  guess with no marker on it. */}
              <div
                className={
                  showMargin
                    ? "sm:col-span-2 text-sm text-gray-900 font-semibold sm:pt-3"
                    : "sm:col-span-3 text-sm text-gray-900 font-semibold sm:pt-3"
                }
              >
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Total baris</span>
                {line ? (
                  money(line.line_total)
                ) : previewFailed ? (
                  <span className="text-gray-400" title="Total belum bisa dihitung server">
                    &mdash;
                  </span>
                ) : (
                  money(fallbackTotal)
                )}
                {line && Number(line.discount_amount) > 0 && (
                  <span className="block text-xs text-gray-500 font-normal">
                    Diskon {money(line.discount_amount)}
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
                  options={discountTypeOptions}
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
                      {item.discountType === "percent" ? "%" : currencySymbol(currencyCode)}
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
