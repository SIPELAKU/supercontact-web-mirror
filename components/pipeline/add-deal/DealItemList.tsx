"use client";

// Add Deal › the product lines waiting to be saved. Each row shows what it
// holds, or which required fields it still needs (amber); a click opens it.

import { format } from "date-fns";
import { AlertTriangle, PackagePlus, Pencil, Sparkles, Trash2 } from "lucide-react";
import { ITEM_FIELD_LABELS, missingFields, type DealItemDraft, type DealItemErrors } from "./dealItems";

type Props = {
  items: DealItemDraft[];
  /** Errors the API returned on the last save, by item key. */
  serverErrors: Record<string, DealItemErrors>;
  /** After a failed "Save deals" every incomplete row is outlined. */
  highlightIncomplete: boolean;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
};

export function DealItemList({ items, serverErrors, highlightIncomplete, onEdit, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center">
        <PackagePlus className="h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-700">No products yet</p>
        <p className="max-w-sm text-xs text-gray-500">
          Add products from the AI recommendation or with + Add Product. Each product becomes its own card on the
          pipeline.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const missing = missingFields(item);
        const apiErrors = Object.values(serverErrors[item.key] ?? {}).filter(Boolean);
        const needsWork = missing.length > 0 || apiErrors.length > 0;
        const outlined = apiErrors.length > 0 || (highlightIncomplete && missing.length > 0);
        return (
          <li
            key={item.key}
            className={`group flex items-start gap-3 rounded-xl border p-3 transition-colors ${
              outlined
                ? "border-amber-400 bg-amber-50/60"
                : needsWork
                  ? "border-amber-200 bg-white"
                  : "border-gray-200 bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => onEdit(item.key)}
              className="min-w-0 flex-1 text-left"
              aria-label={`Edit ${item.product_name || item.sku || `product ${index + 1}`}`}
            >
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold text-gray-900">{item.product_name || "Product"}</span>
                {item.sku && <span className="font-mono text-[11.5px] text-gray-500">{item.sku}</span>}
                {item.reason && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FD] px-2 py-0.5 text-[11px] font-semibold text-[#3E63D8]">
                    <Sparkles size={11} /> AI
                  </span>
                )}
              </div>

              {needsWork ? (
                <p className="mt-1 flex items-start gap-1.5 text-xs font-medium text-amber-700">
                  <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>
                    {apiErrors.length > 0
                      ? apiErrors.join(" · ")
                      : `Complete the data: ${missing.map((f) => ITEM_FIELD_LABELS[f]).join(", ")}`}
                  </span>
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-600">
                  {[
                    item.deal_stage,
                    `Qty ${item.quantity}`,
                    item.expected_close_date && `Close ${format(item.expected_close_date, "dd MMM yyyy")}`,
                    `${item.probability_of_close}%`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
            </button>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(item.key)}
                aria-label="Edit"
                title={needsWork ? "Complete the data" : "Edit"}
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.key)}
                aria-label="Delete"
                title="Delete"
                className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
