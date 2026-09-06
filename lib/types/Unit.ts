// lib/types/Unit.ts
//
// Units of measure (Phase 1, spec D2). `precision` is how many decimals a
// quotation quantity may carry for products sold in this unit; the ceiling is
// 2 because quotation_items.quantity is Numeric(12,2).

export type UnitPrecision = 0 | 1 | 2;

export interface Unit {
  id: string;
  company_id: string;
  code: string;
  /** What quotation lines snapshot into `unit_label_snapshot` (both String(32)). */
  name: string;
  precision: UnitPrecision;
  is_active: boolean;
  /** Filled on the list endpoint only. */
  product_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface UnitCreate {
  code: string;
  name: string;
  precision?: UnitPrecision;
}

/** `code` is immutable. Lowering `precision` affects NEW quotation lines only. */
export interface UnitUpdate {
  name?: string;
  precision?: UnitPrecision;
  is_active?: boolean;
}

export type UnitSortBy = "name" | "code" | "precision" | "created_at" | "is_active";

export interface UnitListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_inactive?: boolean;
  sort_by?: UnitSortBy;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
}

export interface UnitListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  units: Unit[];
}

export interface UnitArchiveResponse {
  id: string;
  is_active: false;
  archived: true;
}

/** Embedded on products and quotation lines. */
export interface UnitBrief {
  id: string;
  code: string;
  name: string;
  precision: number;
}
