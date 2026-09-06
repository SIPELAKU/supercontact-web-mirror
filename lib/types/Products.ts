import type { Product } from "@/lib/store/product";
import type { UnitBrief } from "@/lib/types/Unit";

export interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The row being edited - the modal's single source of truth. null/undefined = create. */
  product?: Product | null;
  /** Fired after a successful create or update, so the page can reset its lazy list. */
  onSaved?: () => void;
}

// ── COMMERCIAL Phase 5 (spec D1 / D2 / D3) ────────────────────────────────
//
// A VARIANT IS A FULL PRODUCT ROW (A2), not a JSON blob on the parent: it has
// its own id, SKU, price, cost and image, and it is the thing that gets quoted.
// ONE LEVEL only - a variant can never itself have variants.
//
// A parent that HAS variants is not quotable; its variants are quoted instead
// (A8). No capability was stripped and the parent is still a real, editable
// catalogue row - the refusal is an EXISTS check, and the screens say exactly
// that rather than claiming the product "stopped being sellable".

/** `ProductParentBrief` (D1): what a variant shows about the family it is in. */
export interface ProductParentBrief {
  id: string;
  product_name: string;
  sku: string;
}

/**
 * `POST /products/{id}/variants` - ONE bulk request, never a client loop (A9).
 *
 * The modal's SKU suggestion derives its counter from the CURRENTLY LOADED rows
 * only (its own comment concedes the server's 409 is the real guard), so a
 * twelve-variant client loop would collide and half-create with no rollback.
 * The server does the whole batch in ONE transaction.
 */
export interface ProductVariantCreate {
  sku: string;
  /** Decimal money as a number on the way out; `ge=1` server-side. */
  price: number;
  /** At least one axis. REPLACED wholesale on update, never merged (D1). */
  variant_values: Record<string, unknown>;
  product_name?: string | null;
  cost?: number | null;
  image_url?: string | null;
  meta_retailer_id?: string | null;
  capabilities?: string[] | null;
  billing_period?: "monthly" | "yearly" | null;
}

export interface ProductVariantBulkCreateRequest {
  /** `min_length=1, max_length=50` server-side. */
  variants: ProductVariantCreate[];
}

export interface ProductVariantBulkCreateResponse {
  total: number;
  parent: ProductParentBrief;
  products: Product[];
}

/** One component of a bundle (D2). ONE LEVEL: a component is never itself a bundle. */
export interface ProductBundleItem {
  id: string;
  component_product_id: string;
  component: {
    id: string;
    product_name: string;
    sku: string;
    price?: string | null;
  };
  /** Decimal-as-string, `gt=0`, 2 decimal places. */
  quantity: string;
  unit_id?: string | null;
  unit?: UnitBrief | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * `GET /products/{id}/bundle-items` (D2).
 *
 * BOTH numbers, deliberately: a bundle price MAY differ from the sum of its
 * components - that is the entire point of a bundle - so the screen states the
 * difference plainly and NEVER as an error (I4).
 */
export interface ProductBundleItemListResponse {
  total: number;
  items: ProductBundleItem[];
  bundle_price: string;
  components_sum: string;
}

export interface ProductBundleItemCreate {
  component_product_id: string;
  quantity: number;
  unit_id?: string | null;
  sort_order?: number;
}

export interface ProductBundleItemUpdate {
  quantity?: number;
  unit_id?: string | null;
  sort_order?: number;
}

export interface ProductBundleItemDeleteResponse {
  id: string;
  deleted: boolean;
}

/**
 * One unit conversion for one product (D3 / A6).
 *
 * `factor_to_base` means BASE UNITS PER ROW UNIT: 1 karton = 12 pcs is
 * `factor_to_base = 12.0000` on the karton row of a product whose own unit is
 * pcs. Numeric(12,4).
 */
export interface ProductUnitConversion {
  id: string;
  unit_id: string;
  unit: UnitBrief;
  factor_to_base: string;
  is_active: boolean;
  /** The product's OWN unit, echoed so "1 karton = 12 pcs" needs no 2nd call. */
  base_unit?: UnitBrief | null;
  /**
   * The honesty flag from E7. FALSE means a quantity of 1 in this unit already
   * yields a base quantity that cannot be stored at 2dp - the line would be
   * silently rounded, so the form warns AT ENTRY TIME rather than at save.
   */
  base_quantity_representable: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductUnitListResponse {
  total: number;
  items: ProductUnitConversion[];
  base_unit?: UnitBrief | null;
}

export interface ProductUnitConversionCreate {
  unit_id: string;
  factor_to_base: number;
}

export interface ProductUnitConversionUpdate {
  factor_to_base?: number;
  is_active?: boolean;
}
