"use client";

import { Product } from "@/lib/store/product";
import type { ItemRow } from "@/lib/types/Quotation";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "../ui/app-button";
import { AppInput } from "../ui/app-input";
import { AppSelect } from "../ui/app-select";

export default function ProductsServicesCard({
  items,
  updateQty,
  updateItemField,
  addItem,
  removeItem,
  listProduct = [],
  loading = false,
  clientData = {},
  validationErrors = null,
}: {
  items: ItemRow[];
  updateQty: (i: number, qty: number) => void;
  updateItemField: (i: number, field: keyof ItemRow, value: any) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  listProduct?: Product[];
  loading?: boolean;
  clientData?: Record<string, any>;
  validationErrors?: any;
}) {
  const handleSKUChange = (index: number, sku: string) => {
    const selectedProduct = listProduct.find(p => p.sku === sku);
    if (selectedProduct) {
      updateItemField(index, "product_id", selectedProduct.id);
      updateItemField(index, "title", selectedProduct.product_name);
      updateItemField(index, "sku", selectedProduct.sku);
      updateItemField(index, "unitPrice", Number(selectedProduct.price));
    }
  };

  const skuOptions = listProduct.map(p => ({
    value: p.sku,
    label: p.sku
  }));

  const getSkuPlaceholder = () => {
    if (listProduct.length === 0) {
      return "No Products available";
    }
    return "Select SKU";
  };



  return (
    <div className="bg-white px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Products & Services
        </h1>
      </div>

      <div className="hidden sm:grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-200">
        <div className="col-span-2 text-xs font-semibold text-gray-700">SKU</div>
        <div className="col-span-3 text-xs font-semibold text-gray-700">Item</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Quantity</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Price</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Total</div>
        <div className="col-span-1"></div>
      </div>

      {items.map((item, i) => {
        // Extract error for this specific item if available
        // Expected structure: validationErrors.items[i].errors = [{ field: "discount", message: "Error msg" }]
        const itemError = validationErrors?.items?.[i];

        return (
          <div
            key={i}
            className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:items-center">
              {/* SKU Dropdown */}
              <div className="sm:col-span-2">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">SKU</span>
                <AppSelect
                  value={item.sku}
                  placeholder={getSkuPlaceholder()}
                  onChange={(e) => handleSKUChange(i, e.target.value as string)}
                  options={skuOptions}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  disabled={loading || (listProduct.length === 0 && !item.sku)}
                />
              </div>

              {/* Item/Product Name (Read-only) */}
              <div className="sm:col-span-3">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Item</span>
                <AppInput
                  value={item.title}
                  readOnly
                  placeholder="Product name will appear here"
                  isBgWhite
                  height="48px"
                  rounded="8px"
                />
              </div>

              {/* Quantity */}
              <div className="sm:col-span-2">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Quantity</span>
                <AppInput
                  type="number"
                  value={item.qty}
                  onChange={(e) => updateQty(i, Number(e.target.value))}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                />
              </div>

              {/* Price */}
              <div className="sm:col-span-2 text-sm text-gray-900 font-medium">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Price</span>
                Rp {Number(item.unitPrice).toLocaleString('id-ID')}
              </div>

              {/* Total */}
              <div className="sm:col-span-2 text-sm text-gray-900 font-semibold">
                <span className="sm:hidden block text-xs font-semibold text-gray-700 mb-1">Total</span>
                Rp {(item.qty * Number(item.unitPrice)).toLocaleString('id-ID')}
              </div>

              {/* Delete Button */}
              <div className="sm:col-span-1 flex justify-end">
                <button
                  onClick={() => removeItem(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Row 2: Notes and Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
              {/* Notes */}
              <div className="sm:col-span-8">
                <AppInput
                  label="Notes"
                  placeholder="Notes"
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  value={item.desc}
                  onChange={(e) => updateItemField(i, "desc", e.target.value)}
                />
              </div>

              {/* Discount Input */}
              <div className="sm:col-span-4">
                <AppInput
                  type="number"
                  label="Discount"
                  endIcon={<span className="text-gray-500 font-medium">%</span>}
                  placeholder="0"
                  value={item.discount || 0}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value);
                    if (isNaN(val)) val = 0;
                    if (val < 0) val = 0;
                    if (val > 100) val = 100;
                    updateItemField(i, "discount", val);
                  }}
                  isBgWhite
                  height="48px"
                  rounded="8px"
                  inputProps={{ min: 0, max: 100 }}
                  // Display error if exists for discount field
                  error={!!itemError?.errors?.find((e: any) => e.field === "discount")}
                  helperText={itemError?.errors?.find((e: any) => e.field === "discount")?.message}
                />
              </div>
            </div>
          </div>
        )
      })}

      <AppButton
        variantStyle="primary"
        color="primary"
        onClick={addItem}
        disabled={loading}
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </AppButton>
    </div>
  );
}
