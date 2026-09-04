// lib/types/ProductCategory.ts
//
// Product categories (Phase 1, spec D1). A tree of at most three levels
// (root = depth 0), archived rather than deleted; `code` is immutable.

export interface ProductCategory {
  id: string;
  company_id: string;
  parent_id: string | null;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  depth: number;
  /** "Makanan > Minuman panas" - the flat list shows this instead of indenting. */
  path: string;
  /** Filled on the list endpoint only. */
  product_count: number | null;
  created_at: string;
  updated_at: string;
}

/** GET /product-categories/tree - active nodes only, nested, ordered (sort_order, name). */
export interface ProductCategoryTreeNode {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  depth: number;
  children: ProductCategoryTreeNode[];
}

export interface ProductCategoryCreate {
  code: string;
  name: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order?: number;
}

/** `parent_id: null` moves the node to the root. `code` cannot be sent. */
export interface ProductCategoryUpdate {
  name?: string;
  description?: string | null;
  parent_id?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export type ProductCategorySortBy = "name" | "code" | "sort_order" | "created_at" | "is_active";

export interface ProductCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_inactive?: boolean;
  parent_id?: string | null;
  sort_by?: ProductCategorySortBy;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
}

export interface ProductCategoryListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  categories: ProductCategory[];
}

export interface ProductCategoryArchiveResponse {
  id: string;
  is_active: false;
  archived: true;
}

/** Embedded on products and quotation lines. */
export interface CategoryBrief {
  id: string;
  code: string;
  name: string;
}
