"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ItemRow } from "@/lib/types/Quotation";
import { Plus, Trash2 } from "lucide-react";
import DropdownSelect from "../ui/dropdown-menu";
import { Product } from "@/lib/store/product";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";

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
  const handleProductChange = (index: number, productId: string) => {
    const selectedProduct = listProduct.find(p => p.id === productId);
    if (selectedProduct) {
      updateItemField(index, "product_id", selectedProduct.id);
      updateItemField(index, "title", selectedProduct.product_name);
      updateItemField(index, "sku", selectedProduct.sku);
      updateItemField(index, "unitPrice", selectedProduct.price);
    }
  };

  return (
    <div className="bg-white px-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Products & Services
      </h1>

      <div className="grid grid-cols-12 gap-4 mb-4 pb-3 border-b border-gray-200">
        <div className="col-span-4 text-xs font-semibold text-gray-700">Item</div>
        <div className="col-span-3 text-xs font-semibold text-gray-700">SKU</div>
        <div className="col-span-2 text-xs font-semibold text-gray-700">Quantity</div>
        <div className="col-span-1 text-xs font-semibold text-gray-700">Price</div>
        <div className="col-span-1 text-xs font-semibold text-gray-700">Total</div>
        <div className="col-span-1"></div>
      </div>

      {items.map((item, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
        >
          <div className="grid grid-cols-12 gap-4 items-center">

            <div className="col-span-4">
              <DropdownSelect
                value={item.title}
                options={listProduct.map(p => p.product_name)}
                onChange={(val) => {
                  const product = listProduct.find(p => p.product_name === val);
                  if (product) handleProductChange(i, product.id);
                }}
                placeholder={loading ? "Loading Products..." : "Select Product"}
                className="border rounded-md h-10 px-3 flex items-center justify-between text-sm text-gray-600 bg-white"
              />
            </div>

            <div className="col-span-3">
              <AppInput
                value={item.sku}
                readOnly
                placeholder="SKU"
                isBgWhite
                height="40px"
              />
            </div>

            <div className="col-span-2">
              <AppInput
                type="number"
                value={item.qty}
                onChange={(e) => updateQty(i, Number(e.target.value))}
                isBgWhite
                height="40px"
              />
            </div>

            <div className="col-span-1 text-sm text-gray-900 font-medium">
              ${item.unitPrice.toLocaleString()}
            </div>

            <div className="col-span-1 text-sm text-gray-900 font-semibold">
              ${(item.qty * item.unitPrice).toLocaleString()}
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeItem(i)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-4">

            <div className="col-span-7">
              <AppInput
                placeholder="Description"
                isBgWhite
                height="40px"
                value={item.desc}
                onChange={(e) => updateItemField(i, "desc", e.target.value)}
              />
            </div>

            <div className="col-span-5 flex items-center text-sm text-gray-700">
              <span className="mr-2">Discount:</span>
              <span className="font-semibold">{item.discount ?? 0}%</span>
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
