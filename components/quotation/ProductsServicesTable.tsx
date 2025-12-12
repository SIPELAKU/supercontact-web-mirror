"use client";

import { Input } from "@/components/ui-mui/input";
import { Button } from "@/components/ui-mui/button";
import { Trash2, Plus, ChevronDown, Search } from "lucide-react";
import type { ItemRow } from "@/lib/type/Quotation";
import DropdownSelect, { DropdownSelectSearch } from "../ui-mui/dropdown-menu";

export default function ProductsServicesCard({
  items,
  updateQty,
  addItem,
  removeItem,
}: {
  items: ItemRow[];
  updateQty: (i: number, qty: number) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
}) {  
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
                options={["All","App Design", "Web Development", "SEO", "Branding"]}
                onChange={(val) => {
                  // updateItemTitle(i, val);                  
                }}
                className="border rounded-md h-10 px-3 flex items-center justify-between text-sm text-gray-600 bg-white"
              />
            </div>

            <div className="col-span-3">
              <DropdownSelectSearch
                value={item.sku}
                options={["BLJ-SA-001", "BLJ-SA-002", "BLJ-SA-003", "MKJ-BD-001", "BKR-LO-001"]}
                onChange={(v) => {
                  // updateSKU(i, v)
                }}
                className="border rounded-md h-10 px-3 flex items-center text-sm text-gray-600 bg-white"
              />
            </div>

            <div className="col-span-2">
              <Input
                type="number"
                value={item.qty}
                onChange={(e) => updateQty(i, Number(e.target.value))}
                className="h-10 text-center"
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
              <Input
                placeholder="Description"
                className="h-10"
                value={item.desc}
                readOnly
              />
            </div>

            <div className="col-span-5 flex items-center text-sm text-gray-700">
              <span className="mr-2">Discount:</span>
              <span className="font-semibold">{item.discount ?? 28}%</span>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="default"
        size="sm"
        onClick={addItem}
        className="mt-2 bg-[#5479EE] text-white px-4"
      >
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </div>
  );
}
