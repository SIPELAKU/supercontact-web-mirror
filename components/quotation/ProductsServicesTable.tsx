"use client";

import { formatRupiah } from "@/lib/helper/currency";
import type { DiscountType, ItemRow, QuotationLineTotals, QuotationTotals } from "@/lib/types/Quotation";
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
}

const DISCOUNT_TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: "percent", label: "%" },
  { value: "amount", label: "Rp" },
];

/** Fields that get their own inline message; anything else shows on the row. */
const FIELD_SLOTS = new Set(["discount", "discount_value", "discount_type", "quantity", "product_id"]);

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
    // A fresh pick prices from the catalogue; an existing row keeps what was
    // stored (the form seeds unitPrice from item.unit_price, never product.price).
    updateItemField(index, "unitPrice", Number(selected.price));
    updateItemField(index, "listPrice", Number(selected.price));
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
              </div>

              {/* Quantity - two decimals, sent rounded so 0.1+0.2 never 422s */}
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
                  inputProps={{ min: 0.01, step: 0.01 }}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={readOnly}
                  error={!!quantityError}
                  helperText={quantityError}
                />
              </div>

              {/* Unit price (stored on edit, catalogue on pick) */}
              <div className="sm:col-span-2 text-sm text-gray-900 font-medium sm:pt-3">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Harga satuan</span>
                {formatRupiah(line ? line.unit_price : item.unitPrice)}
                {line && Number(line.list_price) !== Number(line.unit_price) && (
                  <span className="block text-xs text-gray-500 line-through">
                    {formatRupiah(line.list_price)}
                  </span>
                )}
              </div>

              {/* Line total: server value once previewed, local qty x price until then */}
              <div className="sm:col-span-3 text-sm text-gray-900 font-semibold sm:pt-3">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Total baris</span>
                {line ? formatRupiah(line.line_total) : formatRupiah(fallbackTotal)}
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
