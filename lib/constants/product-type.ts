// lib/constants/product-type.ts
// GET /products `product_type` values as the user reads them - the options of
// the product page's pinned "Tipe" filter chip and the form's type select.

import { PRODUCT_TYPE_LABELS, type ProductType } from "@/lib/store/product";

export const PRODUCT_TYPE_VALUES = Object.keys(PRODUCT_TYPE_LABELS) as ProductType[];

export const PRODUCT_TYPE_OPTIONS: { value: ProductType; label: string }[] = PRODUCT_TYPE_VALUES.map(
  (value) => ({ value, label: PRODUCT_TYPE_LABELS[value] })
);

/** A filter value back to the enum, or undefined when it is not one. */
export function readProductType(value: unknown): ProductType | undefined {
  return typeof value === "string" && (PRODUCT_TYPE_VALUES as string[]).includes(value)
    ? (value as ProductType)
    : undefined;
}
