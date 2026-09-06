// lib/api/product-categories.ts
// Product categories (Phase 1, spec F): reads on `products` or
// `sales:config:manage`, writes on `sales:config:manage`. DELETE archives.

import type {
  ProductCategory,
  ProductCategoryArchiveResponse,
  ProductCategoryCreate,
  ProductCategoryListParams,
  ProductCategoryListResponse,
  ProductCategoryTreeNode,
  ProductCategoryUpdate,
} from "@/lib/types/ProductCategory";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

export async function fetchProductCategories(
  token: string,
  params: ProductCategoryListParams = {}
): Promise<ProductCategoryListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/product-categories${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<ProductCategoryListResponse>(res, "Failed to load product categories");
  return json.data;
}

export async function fetchProductCategoryTree(token: string): Promise<ProductCategoryTreeNode[]> {
  const res = await fetchWithTimeout(getFullUrl("/product-categories/tree"), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<{ data: ProductCategoryTreeNode[] }>(
    res,
    "Failed to load product category tree"
  );
  return Array.isArray(json.data?.data) ? json.data.data : [];
}

export async function createProductCategory(
  token: string,
  data: ProductCategoryCreate
): Promise<ProductCategory> {
  const res = await fetchWithTimeout(getFullUrl("/product-categories"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductCategory>(res, "Failed to create product category");
  return json.data;
}

export async function updateProductCategory(
  token: string,
  id: string,
  data: ProductCategoryUpdate
): Promise<ProductCategory> {
  const res = await fetchWithTimeout(getFullUrl(`/product-categories/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ProductCategory>(res, "Failed to update product category");
  return json.data;
}

/** DELETE archives (idempotent); nothing is physically deleted. */
export async function archiveProductCategory(
  token: string,
  id: string
): Promise<ProductCategoryArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/product-categories/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<ProductCategoryArchiveResponse>(res, "Failed to archive product category");
  return json.data;
}
