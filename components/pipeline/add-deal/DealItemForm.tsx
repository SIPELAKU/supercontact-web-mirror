"use client";

// Add Deal › one product line: the same fields and checks as the single deal
// form (SKU, Product Name, Deal Stage, Expected Close Date, Quantity,
// Probability, Notes). Submit only puts the line on the list; nothing is saved
// until "Save deals".

import { useEffect, useMemo, useState } from "react";
import { startOfToday } from "date-fns";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { AppButton } from "@/components/ui/app-button";
import { AppDatePicker } from "@/components/ui/app-datepicker";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { useGetProductStore } from "@/lib/store/product";
import { FieldLabel, LockedField, type PickerOption } from "./DealFormParts";
import {
  PROBABILITY_OPTIONS,
  validateItem,
  type DealItemDraft,
  type DealItemErrors,
} from "./dealItems";

type Props = {
  item: DealItemDraft;
  /** A new line (from + Add Product) or one already on the list. */
  isNew: boolean;
  stageOptions: PickerOption[];
  /** Another line already has this product. */
  isTaken: (productId: string) => boolean;
  /** Errors the API returned for this line on the last save. */
  serverErrors?: DealItemErrors;
  onCancel: () => void;
  onSubmit: (item: DealItemDraft) => void;
};

export function DealItemForm({ item, isNew, stageOptions, isTaken, serverErrors, onCancel, onSubmit }: Props) {
  // The picker slice (page 1, limit 100, active) - never the product page's
  // list, whose page/search/status/sort would otherwise leak in here.
  const { catalogue, fetchCatalogue } = useGetProductStore();
  const [draft, setDraft] = useState<DealItemDraft>(item);
  // A line already on the list (e.g. added from the AI recommendation with
  // only its product) shows what it still needs straight away.
  const [showErrors, setShowErrors] = useState(!isNew);

  useEffect(() => {
    // Variants are the sellable rows, and the list is top-level only without this.
    fetchCatalogue({ includeVariants: true });
  }, [fetchCatalogue]);

  const errors: DealItemErrors = showErrors ? { ...serverErrors, ...validateItem(draft) } : {};

  const productOptions = useMemo(() => {
    const list: PickerOption[] = catalogue.map((p) => ({ value: p.id, label: p.sku }));
    // An AI-picked product may be outside the first 100 of the catalogue.
    if (draft.product_id && !list.some((o) => o.value === draft.product_id)) {
      list.unshift({ value: draft.product_id, label: draft.sku });
    }
    return list;
  }, [catalogue, draft.product_id, draft.sku]);

  const set = (patch: Partial<DealItemDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = () => {
    setShowErrors(true);
    if (Object.keys(validateItem(draft)).length > 0) return;
    onSubmit(draft);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <FieldLabel required>SKU</FieldLabel>
          <AppAutocomplete
            isBgWhite
            height="48px"
            rounded="8px"
            value={productOptions.find((p) => p.value === draft.product_id) || null}
            options={productOptions}
            getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
            // One card per product: a product already on the list can't be picked again.
            getOptionDisabled={(option) => typeof option !== "string" && isTaken(option.value)}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props as typeof props & { key: string };
              const product = catalogue.find((p) => p.id === option.value);
              return (
                <li key={option.value} {...optionProps}>
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="block">{option.label}</span>
                      {product?.product_name && <span className="block truncate text-xs text-gray-500">{product.product_name}</span>}
                    </div>
                    {isTaken(option.value) && <span className="shrink-0 text-xs text-gray-400">Already added</span>}
                  </div>
                </li>
              );
            }}
            onChange={(_, newValue) => {
              if (newValue && typeof newValue !== "string" && !Array.isArray(newValue)) {
                const picked = newValue as PickerOption;
                const product = catalogue.find((p) => p.id === picked.value);
                set({
                  product_id: picked.value,
                  sku: product?.sku ?? picked.label,
                  product_name: product?.product_name ?? draft.product_name,
                  // A reason belongs to the AI's product only.
                  reason: picked.value === item.product_id ? item.reason : undefined,
                });
              } else if (!newValue) {
                set({ product_id: "", sku: "", product_name: "", reason: undefined });
              }
            }}
            onInputChange={(_, inputValue, reason) => {
              if (reason !== "input") return;
              const keyword = inputValue.trim();
              fetchCatalogue(keyword ? { search: keyword, includeVariants: true } : { includeVariants: true });
            }}
            isOptionEqualToValue={(option, value) => {
              if (!value) return false;
              if (typeof option === "string" || typeof value === "string") return option === value;
              return option.value === (value as PickerOption).value;
            }}
            placeholder="Search by SKU"
            error={Boolean(errors.product_id)}
            helperText={errors.product_id}
          />
        </div>

        <div>
          <FieldLabel>Product Name</FieldLabel>
          <LockedField placeholder="Product name will appear here" value={draft.product_name} />
        </div>

        <div>
          <FieldLabel required>Deal Stage</FieldLabel>
          <AppSelect
            value={draft.deal_stage}
            onChange={(e) => set({ deal_stage: e.target.value as string })}
            options={stageOptions}
            placeholder="Select Deal Stage"
            isBgWhite
            height="48px"
            rounded="8px"
            error={Boolean(errors.deal_stage)}
            helperText={errors.deal_stage}
          />
        </div>

        <div>
          <FieldLabel required>Expected Close Date</FieldLabel>
          <AppDatePicker
            value={draft.expected_close_date}
            onChange={(value) => {
              if (Array.isArray(value)) return;
              set({ expected_close_date: value ?? undefined });
            }}
            placeholder="Select close date"
            // No past dates on a new deal.
            minDate={startOfToday()}
            isBgWhite
            error={Boolean(errors.expected_close_date)}
            helperText={errors.expected_close_date}
          />
        </div>

        <div>
          <FieldLabel required>Quantity</FieldLabel>
          <AppInput
            type="number"
            placeholder="1"
            value={draft.quantity}
            onChange={(e) => set({ quantity: Number(e.target.value) })}
            isBgWhite
            height="48px"
            rounded="8px"
            error={Boolean(errors.quantity)}
            helperText={errors.quantity}
          />
        </div>

        <div>
          <FieldLabel required>Probability of Close Won (%)</FieldLabel>
          <AppSelect
            value={draft.probability_of_close}
            onChange={(e) => set({ probability_of_close: e.target.value as string })}
            placeholder="0"
            options={PROBABILITY_OPTIONS}
            isBgWhite
            height="48px"
            rounded="8px"
            error={Boolean(errors.probability_of_close)}
            helperText={errors.probability_of_close}
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel>Notes</FieldLabel>
        <AppTextarea
          placeholder="Add any relevant notes here..."
          value={draft.notes}
          onChange={(e) => set({ notes: e.target.value })}
          isBgWhite
          rounded="8px"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <AppButton type="button" variantStyle="outline" color="gray" onClick={onCancel}>
          Cancel
        </AppButton>
        <AppButton type="button" variantStyle="primary" onClick={submit}>
          {isNew ? "Add to deal" : "Save product"}
        </AppButton>
      </div>
    </div>
  );
}
