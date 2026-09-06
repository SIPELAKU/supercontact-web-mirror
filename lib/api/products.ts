// lib/api/products.ts
//
// The product endpoints the page calls OUTSIDE the zustand store: the
// stateless image upload and the paged fetch the export loop walks. Both go
// straight to NEXT_PUBLIC_API_URL with the `useAuth` token - the export used
// to call `/api/proxy/products` although the token was already in hand.

import type { Product, ProductStatusFilter, ProductType } from "@/lib/store/product";
import type {
  ProductBundleItem,
  ProductBundleItemCreate,
  ProductBundleItemDeleteResponse,
  ProductBundleItemListResponse,
  ProductBundleItemUpdate,
  ProductUnitConversion,
  ProductUnitConversionCreate,
  ProductUnitConversionUpdate,
  ProductUnitListResponse,
  ProductVariantBulkCreateRequest,
  ProductVariantBulkCreateResponse,
} from "@/lib/types/Products";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

/** Mirrors the API's PRODUCT_IMAGE_ALLOWED_TYPES / PRODUCT_IMAGE_MAX_BYTES. */
export const PRODUCT_IMAGE_MIME_ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const PRODUCT_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export interface ProductImageUploadResult {
  url: string;
  file_id: string;
  name: string;
  content_type: string;
  size_bytes: number;
}

/**
 * POST /products/image-uploads - stateless (no product id), so the create
 * modal can upload before the first save. Returns the public URL the product
 * stores as `image_url`. Copy of `uploadTemplateMedia`: no Content-Type, the
 * browser sets the multipart boundary.
 */
export async function uploadProductImage(token: string, file: File): Promise<ProductImageUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetchWithTimeout(getFullUrl("/products/image-uploads"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = await handleResponse<ProductImageUploadResult>(res, "Gagal mengunggah gambar");
  return json.data;
}

export interface FetchProductsPageParams {
  page: number;
  limit: number;
  status?: ProductStatusFilter;
  search?: string;
  category_id?: string;
  product_type?: ProductType;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
  /**
   * COMMERCIAL Phase 5 (spec D1 / E5.1). `GET /products` is TOP-LEVEL ONLY by
   * default now, so a catalogue of 20 products x 6 variants lists 20 rows and
   * not 120.
   *
   * `parent_product_id` lists ONE family; `include_variants` flattens children
   * back into the list for the cases where a flat list is genuinely wanted -
   * the quotation picker being the important one, because a VARIANT is the
   * thing that gets quoted (A8).
   */
  parent_product_id?: string;
  include_variants?: boolean;
}

export interface ProductsPage {
  products: Product[];
  total: number | null;
  total_pages: number | null;
  page: number;
  limit: number;
}

/** One page of GET /products, as the API returns it (no store side effects). */
export async function fetchProductsPage(token: string, params: FetchProductsPageParams): Promise<ProductsPage> {
  const res = await fetchWithTimeout(getFullUrl(`/products${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<ProductsPage>(res, "Failed to load products");
  const data = json.data;
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    total: typeof data?.total === "number" ? data.total : null,
    total_pages: typeof data?.total_pages === "number" ? data.total_pages : null,
    page: data?.page ?? params.page,
    limit: data?.limit ?? params.limit,
  };
}

// ── COMMERCIAL Phase 5: product sub-resources (spec F1) ────────────────────
//
// Three collections that all need an EXISTING product id, which is why they
// live on `/sales/product/[id]` and not inside `AddProductModal`: the modal
// saves in ONE POST/PATCH, so on CREATE there is no id to hang them off (I4).
//
// Permissions, as the router declares them (F1):
//   variants / bundle items  MANAGE = `products`
//   unit conversions         MANAGE = `sales:config:manage`
//
// The split is a DECISION, not an accident: a conversion changes what a carton
// costs, so it sits with the pricing-config authority, while variants and
// bundle composition are catalogue authorship.

/**
 * ONE bulk request for the whole matrix (A9) - never a client-side loop.
 *
 * The server runs the batch in a single transaction, so twelve variants either
 * all exist or none do. A loop would half-create on the first duplicate SKU and
 * leave the tenant to clean it up by hand.
 */
export async function createVariants(
  token: string,
  productId: string,
  payload: ProductVariantBulkCreateRequest
): Promise<ProductVariantBulkCreateResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/variants`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<ProductVariantBulkCreateResponse>(
    res,
    "Gagal membuat varian"
  );
  return json.data;
}

/** One family's children. Same `ProductListResponse` shape as `GET /products`. */
export async function listVariants(
  token: string,
  productId: string,
  params: Partial<FetchProductsPageParams> = {}
): Promise<ProductsPage> {
  const query = { page: 1, limit: 100, include_total: true, ...params };
  const res = await fetchWithTimeout(
    getFullUrl(`/products/${productId}/variants${buildQuery(query)}`),
    { headers: authHeaders(token) }
  );
  const json = await handleResponse<ProductsPage>(res, "Gagal memuat varian");
  const data = json.data;
  return {
    products: Array.isArray(data?.products) ? data.products : [],
    total: typeof data?.total === "number" ? data.total : null,
    total_pages: typeof data?.total_pages === "number" ? data.total_pages : null,
    page: data?.page ?? query.page,
    limit: data?.limit ?? query.limit,
  };
}

/** Both the bundle's own price AND the sum of its components (D2). */
export async function listBundleItems(
  token: string,
  productId: string
): Promise<ProductBundleItemListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/bundle-items`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<any>(res, "Gagal memuat isi paket");
  const data = json.data ?? {};
  return {
    total: typeof data.total === "number" ? data.total : 0,
    items: Array.isArray(data.items) ? (data.items as ProductBundleItem[]) : [],
    bundle_price: typeof data.bundle_price === "string" ? data.bundle_price : "0.00",
    components_sum: typeof data.components_sum === "string" ? data.components_sum : "0.00",
  };
}

export async function addBundleItem(
  token: string,
  productId: string,
  data: ProductBundleItemCreate
): Promise<ProductBundleItem> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/bundle-items`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductBundleItem>(res, "Gagal menambah isi paket");
  return json.data;
}

export async function updateBundleItem(
  token: string,
  productId: string,
  itemId: string,
  data: ProductBundleItemUpdate
): Promise<ProductBundleItem> {
  const res = await fetchWithTimeout(
    getFullUrl(`/products/${productId}/bundle-items/${itemId}`),
    { method: "PATCH", headers: jsonHeaders(token), body: JSON.stringify(data) }
  );
  const json = await handleResponse<ProductBundleItem>(res, "Gagal mengubah isi paket");
  return json.data;
}

/** The one Phase 5 product sub-resource that is genuinely removed from the set. */
export async function removeBundleItem(
  token: string,
  productId: string,
  itemId: string
): Promise<ProductBundleItemDeleteResponse> {
  const res = await fetchWithTimeout(
    getFullUrl(`/products/${productId}/bundle-items/${itemId}`),
    { method: "DELETE", headers: authHeaders(token) }
  );
  const json = await handleResponse<ProductBundleItemDeleteResponse>(
    res,
    "Gagal menghapus isi paket"
  );
  return json.data;
}

/** The product's conversions, plus the BASE unit they are all expressed in (D3). */
export async function listProductUnits(
  token: string,
  productId: string
): Promise<ProductUnitListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/units`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<any>(res, "Gagal memuat konversi satuan");
  const data = json.data ?? {};
  return {
    total: typeof data.total === "number" ? data.total : 0,
    items: Array.isArray(data.items) ? (data.items as ProductUnitConversion[]) : [],
    base_unit: data.base_unit ?? null,
  };
}

export async function addProductUnit(
  token: string,
  productId: string,
  data: ProductUnitConversionCreate
): Promise<ProductUnitConversion> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/units`), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductUnitConversion>(res, "Gagal menambah konversi satuan");
  return json.data;
}

export async function updateProductUnit(
  token: string,
  productId: string,
  productUnitId: string,
  data: ProductUnitConversionUpdate
): Promise<ProductUnitConversion> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/units/${productUnitId}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductUnitConversion>(res, "Gagal mengubah konversi satuan");
  return json.data;
}

/**
 * DEACTIVATES (`is_active = false`) and returns the row - it does not delete
 * (A27). A stored quotation line that was priced through this conversion keeps
 * its `unit_factor_used` snapshot, and the row still explains it.
 */
export async function removeProductUnit(
  token: string,
  productId: string,
  productUnitId: string
): Promise<ProductUnitConversion> {
  const res = await fetchWithTimeout(getFullUrl(`/products/${productId}/units/${productUnitId}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<ProductUnitConversion>(
    res,
    "Gagal menonaktifkan konversi satuan"
  );
  return json.data;
}
