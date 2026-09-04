// lib/api/products.ts
//
// The product endpoints the page calls OUTSIDE the zustand store: the
// stateless image upload and the paged fetch the export loop walks. Both go
// straight to NEXT_PUBLIC_API_URL with the `useAuth` token - the export used
// to call `/api/proxy/products` although the token was already in hand.

import type { Product, ProductStatusFilter, ProductType } from "@/lib/store/product";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse } from "./catalog-http";

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
