"use client";

import type { ItemRow } from "@/lib/types/Quotation";
import { Plus, Trash2 } from "lucide-react";
import { Product } from "@/lib/store/product";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import { AppSelect } from "../ui/app-select";

export default function ProductsServicesCard({
  items,
  updateQty,
  updateItemField,
  addItem,
  removeItem,
  listProduct = [],
  loading = false,
}: {
  items: ItemRow[];
  updateQty: (i: number, qty: number) => void;
  updateItemField: (i: number, field: keyof ItemRow, value: any) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  listProduct?: Product[];
  loading?: boolean;
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

  const discountOptions = [
    { value: "0", label: "0%" },
    { value: "5", label: "5%" },
    { value: "10", label: "10%" },
    { value: "15", label: "15%" },
    { value: "20", label: "20%" },
    { value: "25", label: "25%" },
  ];

  return (
    <div className="bg-white px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Products & Services
      </h1>

      <div className="grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-200">
        <div className="col-span-2 text-xs font-semibold text-gray-700">SKU</div>
        <div className="col-span-3 text-xs font-semibold text-gray-700">Item</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Quantity</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Price</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Total</div>
        <div className="col-span-1"></div>
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
        >
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* SKU Dropdown */}
            <div className="col-span-2">
              <AppSelect
                value={item.sku}
                placeholder="Select SKU"
                onChange={(e) => handleSKUChange(i, e.target.value as string)}
                options={skuOptions}
                isBgWhite
                height="48px"
                rounded="8px"
                disabled={loading}
              />
            </div>

            {/* Item/Product Name (Read-only) */}
            <div className="col-span-3">
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
            <div className="col-span-2">
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
            <div className="col-span-2 text-sm text-gray-900 font-medium">
              Rp {Number(item.unitPrice).toLocaleString('id-ID')}
            </div>

            {/* Total */}
            <div className="col-span-2 text-sm text-gray-900 font-semibold">
              Rp {(item.qty * Number(item.unitPrice)).toLocaleString('id-ID')}
            </div>

            {/* Delete Button */}
            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeItem(i)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Row 2: Notes and Discount */}
          <div className="grid grid-cols-12 gap-4 mt-4">
            {/* Notes */}
            <div className="col-span-8">
              <AppInput
                placeholder="Notes"
                isBgWhite
                height="48px"
                rounded="8px"
                value={item.desc}
                onChange={(e) => updateItemField(i, "desc", e.target.value)}
              />
            </div>

            {/* Discount Dropdown */}
            <div className="col-span-4">
              <AppSelect
                value={String(item.discount || 0)}
                placeholder="Discount"
                onChange={(e) => updateItemField(i, "discount", Number(e.target.value))}
                options={discountOptions}
                isBgWhite
                height="48px"
                rounded="8px"
              />
            </div>
          </div>
        </div>
      ))}

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
