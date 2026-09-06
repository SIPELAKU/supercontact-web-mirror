"use client";
import type { AxiosError } from "axios";
import { create } from "zustand";
import api from "@/lib/utils/axiosClient";
import type { CategoryBrief } from "@/lib/types/ProductCategory";
import type { UnitBrief } from "@/lib/types/Unit";

export interface ValidationItem {
  type: string;
  loc: string[];
  msg: string;
  input?: unknown;
}

export interface ProductValidationResponse {
  error: string;
  details: ValidationItem[];
}

// Exact API vocabularies (app/models/product_model.py).
export type ProductType = "goods" | "service" | "subscription" | "bundle" | "digital";
export type ProductStatus = "active" | "archived";
export type BillingPeriod = "monthly" | "yearly";
/** GET /products `status` query: the server defaults to `active`. */
export type ProductStatusFilter = ProductStatus | "all";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  goods: "Barang",
  service: "Jasa",
  subscription: "Langganan",
  bundle: "Paket",
  digital: "Digital",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Aktif",
  archived: "Diarsipkan",
};

export const BILLING_PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: "Bulanan",
  yearly: "Tahunan",
};

/**
 * GET /products query. `category_id` (server includes descendants) and
 * `product_type` are FETCH PARAMS the page passes on every call - never
 * store state - so nothing a filter does on the product page can leak into
 * the quotation or deal pickers (spec S3-1).
 */
export type FetchProductParams = {
  page: number;
  limit: number;
  search?: string;
  status?: ProductStatusFilter;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  category_id?: string;
  product_type?: ProductType;
  /** Only the first batch asks for the COUNT(*); later batches send false. */
  include_total?: boolean;
  /**
   * COMMERCIAL Phase 5 (spec E5.1). `GET /products` defaults to TOP-LEVEL rows
   * only; these two put the children back where they are wanted.
   */
  parent_product_id?: string;
  include_variants?: boolean;
};

interface Pagination {
  page: number;
  limit: number;
  /** null until the first batch (with include_total) has landed. */
  total: number | null;
  totalPages: number | null;
}

/** ProductResponse (spec D4). Money is a Decimal string, never a float. */
export interface Product {
  id: string;
  product_name: string;
  sku: string;
  price: string;
  description: string | null;
  product_type: ProductType;
  status: ProductStatus;
  cost: string | null;
  image_url: string | null;
  capabilities: string[];
  billing_period: BillingPeriod | null;
  category_id: string | null;
  category: CategoryBrief | null;
  unit_id: string | null;
  unit: UnitBrief | null;
  custom_fields: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  /**
   * COMMERCIAL Phase 5 (spec D1 / I3). ALL OPTIONAL with defaults, so a leg
   * that predates the phase answers without them and nothing here breaks.
   *
   * A VARIANT IS A FULL PRODUCT ROW (A2): `parent_product_id` set, its own SKU,
   * price and cost, one level deep. A PARENT with `variant_count > 0` is not
   * quotable and its variants are quoted instead (A8) - no capability was
   * stripped, the refusal is an EXISTS check.
   */
  parent_product_id?: string | null;
  parent?: { id: string; product_name: string; sku: string } | null;
  /** REPLACED wholesale on update, never merged - a vanished axis must vanish. */
  variant_values?: Record<string, unknown>;
  variant_count?: number;
  /** Reachable through no schema, service, endpoint or screen before Phase 5 (A33). */
  meta_retailer_id?: string | null;
}

/** ProductCreateRequest / ProductUpdateRequest. `status` is update-only. No `image_file_id` (spec A10). */
export interface ProductPayload {
  product_name: string;
  price: number;
  sku: string;
  description?: string | null;
  product_type?: ProductType;
  status?: ProductStatus;
  cost?: number | null;
  image_url?: string | null;
  capabilities?: string[];
  billing_period?: BillingPeriod | null;
  /** Explicit `null` clears on update. */
  category_id?: string | null;
  unit_id?: string | null;
  /** Merged into the stored dict on update, validated strictly server-side. */
  custom_fields?: Record<string, unknown>;
  /**
   * COMMERCIAL Phase 5 (spec D1). The Meta catalogue field: the column has
   * existed since Phase 0 and was reachable through NO schema, service,
   * endpoint or screen until now (A33). No sync is built here - Phase 5 gives a
   * product the FIELD and nothing more.
   */
  meta_retailer_id?: string | null;
  /**
   * REPLACED WHOLESALE on update, unlike `custom_fields` which is MERGED - a
   * variant axis that disappears must actually disappear (D1). `parent_product_id`
   * is deliberately absent from the update path: re-parenting would silently
   * change which name-uniqueness bucket the row lives in and which quotations
   * already snapshot it.
   */
  variant_values?: Record<string, unknown>;
}

export type MutationResult = {
  success: boolean;
  error?: string;
  /** The API's `error.code` / `error.details`, so a form can route field errors. */
  code?: string;
  details?: unknown;
  validation?: ValidationItem[];
};

interface GetState {
  listProduct: Product[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;

  /**
   * The picker slice (quotation form, deal modal): ALWAYS page 1, limit 100,
   * status=active, include_total=false. Reads and writes nothing of the list
   * above - not its page, search, status or sort.
   */
  catalogue: Product[];
  catalogueLoading: boolean;

  fetchProduct: (params?: Partial<FetchProductParams>) => Promise<void>;
  fetchCatalogue: (params?: { search?: string; includeVariants?: boolean }) => Promise<void>;

  postFormProduct: (param?: ProductPayload) => Promise<MutationResult>;
  updateFormProduct: (param?: ProductPayload, id?: string) => Promise<MutationResult>;
  /** DELETE /products/{id} archives (idempotent); nothing is ever physically deleted. */
  archiveProduct: (id: string) => Promise<MutationResult & { status?: ProductStatus }>;
  duplicateProducts: (ids: string[]) => Promise<MutationResult>;
}

function readMutationError(error: unknown, fallback: string): MutationResult {
  const axiosErr = error as AxiosError<any>;
  if (axiosErr.response?.data?.error) {
    const errorData = axiosErr.response.data.error;
    if (typeof errorData === "object") {
      return {
        success: false,
        error: errorData.message ?? fallback,
        code: typeof errorData.code === "string" ? errorData.code : undefined,
        details: errorData.details,
        validation: Array.isArray(errorData.details) ? errorData.details : undefined,
      };
    }
    return { success: false, error: String(errorData) };
  }
  return {
    success: false,
    error: axiosErr.message ?? fallback,
  };
}

/** ProductResponse -> Product with safe defaults for every optional field. */
export function mapProduct(p: any): Product {
  return {
    id: p.id,
    product_name: p.product_name,
    sku: p.sku,
    price: p.price,
    description: p.description ?? null,
    product_type: p.product_type ?? "goods",
    status: p.status ?? "active",
    cost: p.cost ?? null,
    image_url: p.image_url ?? null,
    capabilities: Array.isArray(p.capabilities) ? p.capabilities : [],
    billing_period: p.billing_period ?? null,
    category_id: p.category_id ?? p.category?.id ?? null,
    category: p.category ?? null,
    unit_id: p.unit_id ?? p.unit?.id ?? null,
    unit: p.unit ?? null,
    custom_fields:
      p.custom_fields && typeof p.custom_fields === "object" && !Array.isArray(p.custom_fields)
        ? p.custom_fields
        : {},
    created_at: p.created_at,
    updated_at: p.updated_at,
    // COMMERCIAL Phase 5 (spec D1). Defaulted the same way `custom_fields` is,
    // so a response from a leg that predates the phase maps to a top-level
    // product with no variants rather than to `undefined` holes the screens
    // would each have to guard.
    parent_product_id: p.parent_product_id ?? p.parent?.id ?? null,
    parent: p.parent ?? null,
    variant_values:
      p.variant_values && typeof p.variant_values === "object" && !Array.isArray(p.variant_values)
        ? p.variant_values
        : {},
    variant_count: typeof p.variant_count === "number" ? p.variant_count : 0,
    meta_retailer_id: p.meta_retailer_id ?? null,
  };
}

/** Matches SuperTable's lazy batch size, so the first fetch and the first
 *  "load more" ask for consecutive rows rather than overlapping ones. */
const LIST_LIMIT = 25;
/** Catalogue page size for the pickers (one request, status=active). */
export const CATALOGUE_LIMIT = 100;

/**
 * The last LIST query as sent, kept outside the store's observable state.
 * A mutation refetches page 1 of exactly this query (same search, status,
 * sort, category and type) with the total, so the list the user was looking
 * at is what gets refreshed - not an unfiltered default. The pickers never
 * read it.
 */
let lastListQuery: FetchProductParams = { page: 1, limit: LIST_LIMIT, status: "active", include_total: true };

export const useGetProductStore = create<GetState>((set, get) => {
  const refetchAfterMutation = () =>
    get().fetchProduct({ ...lastListQuery, page: 1, include_total: true });

  return {
    listProduct: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: LIST_LIMIT,
      total: null,
      totalPages: null,
    },
    catalogue: [],
    catalogueLoading: false,

    fetchProduct: async (params) => {
      try {
        set({ loading: true, error: null });

        const page = params?.page ?? 1;
        const query: FetchProductParams = {
          page,
          limit: params?.limit ?? get().pagination.limit,
          // Passed explicitly even though the server defaults to `active`, so
          // the request says what it means and the filter is visible in logs.
          status: params?.status ?? "active",
          // The count is asked for once per query; every later batch skips
          // the COUNT(*) and the table remembers the number (spec I2).
          include_total: params?.include_total ?? page === 1,
        };
        if (params?.search && params.search.trim() !== "") query.search = params.search;
        if (params?.sort_by) {
          query.sort_by = params.sort_by;
          query.sort_order = params.sort_order ?? "asc";
        }
        if (params?.category_id) query.category_id = params.category_id;
        if (params?.product_type) query.product_type = params.product_type;
        // Phase 5: only sent when asked for. `GET /products` is top-level only
        // by default (E5.1), and sending `include_variants=false` explicitly
        // would say the same thing at the cost of a key in every log line.
        if (params?.parent_product_id) query.parent_product_id = params.parent_product_id;
        if (params?.include_variants) query.include_variants = true;
        lastListQuery = query;

        const res = await api.get("/products", { params: query });
        const data = res.data.data;
        const products: Product[] = (data.products as any[]).map(mapProduct);

        set((state) => ({
          listProduct: products,
          pagination: {
            page: typeof data.page === "number" ? data.page : page,
            limit: query.limit,
            // Never `|| 0`: a batch without a total (include_total=false)
            // must not read as "no rows", or the list stops after batch one.
            total: typeof data.total === "number" ? data.total : state.pagination.total,
            totalPages:
              typeof data.total_pages === "number" ? data.total_pages : state.pagination.totalPages,
          },
        }));
      } catch (err) {
        console.error(err);
        set({ error: "Failed to fetch data" });
      } finally {
        set({ loading: false });
      }
    },

    fetchCatalogue: async (params) => {
      try {
        set({ catalogueLoading: true });
        const query: Record<string, unknown> = {
          page: 1,
          limit: CATALOGUE_LIMIT,
          status: "active",
          include_total: false,
        };
        if (params?.search && params.search.trim() !== "") query.search = params.search.trim();
        // Phase 5 (spec I9 / M-e). `GET /products` became TOP-LEVEL ONLY, so a
        // picker that does not ask for variants can no longer offer them - and
        // a variant is the thing that gets quoted (A8). The deal modal passes
        // this for exactly that reason.
        if (params?.includeVariants) query.include_variants = true;
        const res = await api.get("/products", { params: query });
        const rows = res.data?.data?.products;
        set({ catalogue: Array.isArray(rows) ? rows.map(mapProduct) : [] });
      } catch (err) {
        console.error(err);
      } finally {
        set({ catalogueLoading: false });
      }
    },

    postFormProduct: async (body?: ProductPayload): Promise<MutationResult> => {
      try {
        set({ loading: true, error: null });
        const res = await api.post("/products", body);
        if (res.status === 200 || res.status === 201) {
          await refetchAfterMutation();
          return { success: true };
        }
        return { success: false, error: "Unexpected response" };
      } catch (error) {
        return readMutationError(error, "Failed to post product");
      } finally {
        set({ loading: false });
      }
    },

    updateFormProduct: async (body?: ProductPayload, id?: string): Promise<MutationResult> => {
      try {
        set({ loading: true, error: null });
        const res = await api.put(`/products/${id}`, body);
        if (res.status === 200) {
          await refetchAfterMutation();
          return { success: true };
        }
        return { success: false, error: "Unexpected response" };
      } catch (error) {
        return readMutationError(error, "Failed to update product");
      } finally {
        set({ loading: false });
      }
    },

    archiveProduct: async (id: string) => {
      try {
        set({ loading: true, error: null });
        const res = await api.delete(`/products/${id}`);
        if (res.status === 200) {
          await refetchAfterMutation();
          return { success: true, status: res.data?.data?.status as ProductStatus | undefined };
        }
        return { success: false, error: "Unexpected response" };
      } catch (error) {
        return readMutationError(error, "Failed to archive product");
      } finally {
        set({ loading: false });
      }
    },

    duplicateProducts: async (ids: string[]) => {
      try {
        set({ loading: true, error: null });
        // Mirrors POST /contacts/duplicate: { product_ids } -> { total, created, products }
        const res = await api.post(`/products/duplicate`, { product_ids: ids });
        if (res.status === 200 || res.status === 201) {
          await refetchAfterMutation();
          return { success: true };
        }
        return { success: false, error: "Unexpected response" };
      } catch (error) {
        return readMutationError(error, "Failed to duplicate products");
      } finally {
        set({ loading: false });
      }
    },
  };
});
