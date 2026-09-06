"use client";

// components/product/ProductDetailClient.tsx
//
// The FIRST product detail route (COMMERCIAL Phase 5, spec I4).
//
// THE DECISION THAT UNBLOCKS THREE OF THE FIVE FEATURES, and it could not be
// deferred past the first screen: `AddProductModal` saves the product in ONE
// POST/PATCH, and variants, bundle items and unit conversions all need an
// EXISTING product id - so on CREATE they are impossible inside the modal. The
// only per-product child panel that existed (`ProductPriceListsPanel`) is
// mounted solely when `isEdit && product` and is read-only.
//
// Built on the `PriceListDetail` precedent: `AppTabs`, a header card of chips,
// and each tab owning its own lazy list + inline draft.
//
// TAB VISIBILITY IS TYPE- AND SHAPE-CONDITIONAL, which is the modal's existing
// idiom (Billing Period renders only for `subscription`):
//
//   Varian           the product has NO parent      (one level, A2)
//   Isi paket        product_type === "bundle"
//   Konversi satuan  the product HAS a unit_id, else an explanatory empty state
//
// A VARIANT viewed here shows its parent as a read-only chip and hides the
// Varian tab entirely - a variant cannot have variants.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Chip } from "@mui/material";
import { useQueries, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppTabs } from "@/components/ui/app-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { AddProductModal } from "@/components/product/AddProductModal";
import ProductBundleItemsTab from "@/components/product/ProductBundleItemsTab";
import ProductPriceListsPanel from "@/components/product/ProductPriceListsPanel";
import ProductUnitsTab from "@/components/product/ProductUnitsTab";
import ProductVariantsTab from "@/components/product/ProductVariantsTab";
import CustomFieldsReadOnly from "@/components/custom-fields/CustomFieldsReadOnly";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchWithTimeout } from "@/lib/api/api-client";
import { authHeaders, getFullUrl, handleResponse } from "@/lib/api/catalog-http";
import { fetchPriceListPrices } from "@/lib/api/price-lists";
import { PRICE_LISTS_KEY, useActivePriceLists } from "@/lib/hooks/usePriceLists";
import { formatMoney } from "@/lib/helper/currency";
import { useCustomFieldDefinitionsFor } from "@/lib/hooks/useCustomFieldDefinitions";
import { PRODUCT_STATUS_LABELS, PRODUCT_TYPE_LABELS, mapProduct, type Product } from "@/lib/store/product";
import { variantValueChips } from "@/lib/utils/variantMatrix";

type TabValue = "detail" | "variants" | "bundle" | "units" | "prices";

// The A15 scan fans out over the tenant's ACTIVE lists, exactly as
// `ProductPriceListsPanel` does (there is no "one product across all lists"
// endpoint yet), so it is capped the same way and runs ONLY while the
// "Konversi satuan" tab is open - a tab nobody opens costs nothing.
const MAX_LISTS_SCANNED = 12;

export default function ProductDetailClient({ productId }: { productId: string }) {
  const { getToken } = useAuth();
  const [tab, setTab] = useState<TabValue>("detail");
  const [editOpen, setEditOpen] = useState(false);
  const [refreshSeq, setRefreshSeq] = useState(0);
  const { definitions: productDefinitions } = useCustomFieldDefinitionsFor("product");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["product", productId, refreshSeq],
    queryFn: async () => {
      const res = await fetchWithTimeout(getFullUrl(`/products/${productId}`), {
        headers: authHeaders(await getToken()),
      });
      const json = await handleResponse<any>(res, "Gagal memuat produk");
      // Through the store's own mapper, so every Phase 5 field arrives with the
      // same defaults the list rows get and no screen has to guard `undefined`.
      return mapProduct(json.data) as Product;
    },
  });

  const product = data ?? null;

  const variantChips = useMemo(
    () => variantValueChips(product?.variant_values),
    [product?.variant_values]
  );

  // A15 / I4: the units a GRANDFATHERED price row is priced in - one that is
  // neither the product's own unit nor an ACTIVE conversion, so the quote path
  // can never resolve it. `GET /price-lists/{id}/prices` marks those rows
  // `unit_conversion_missing`, and ProductUnitsTab turns each one into a
  // one-click "add this conversion". Without this the warning and its action
  // are unreachable on every tenant.
  const unitsTabOpen = tab === "units";
  const { data: priceListsData } = useActivePriceLists({ enabled: unitsTabOpen });
  const scannedLists = useMemo(
    () => (priceListsData?.price_lists ?? []).slice(0, MAX_LISTS_SCANNED),
    [priceListsData]
  );
  const priceRowQueries = useQueries({
    queries: scannedLists.map((list) => ({
      // The SAME key `ProductPriceListsPanel` uses, so opening both tabs costs
      // one fetch, not two.
      queryKey: [PRICE_LISTS_KEY, "prices", list.id, { product_id: productId, only_open: true }],
      queryFn: async () =>
        fetchPriceListPrices(await getToken(), list.id, {
          page: 1,
          limit: 25,
          product_id: productId,
          only_open: true,
          include_total: false,
        }),
      enabled: unitsTabOpen,
    })),
  });
  const missingConversionUnitIds = Array.from(
    new Set(
      priceRowQueries.flatMap((result) =>
        (result.data?.prices ?? [])
          .filter((price) => price.unit_conversion_missing && price.unit?.id)
          .map((price) => price.unit!.id)
      )
    )
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        title="Produk tidak ditemukan"
        description="Produk mungkin sudah dihapus, atau milik workspace lain."
        action={{ label: "Coba lagi", onClick: () => refetch() }}
      />
    );
  }

  const isVariant = !!product.parent_product_id;
  const hasVariants = (product.variant_count ?? 0) > 0;

  const tabs: { value: TabValue; label: string }[] = [
    { value: "detail", label: "Detail" },
    // A variant cannot have variants (A2), so the tab is not rendered at all
    // rather than rendered empty.
    ...(isVariant ? [] : [{ value: "variants" as TabValue, label: "Varian" }]),
    ...(product.product_type === "bundle"
      ? [{ value: "bundle" as TabValue, label: "Isi paket" }]
      : []),
    { value: "units", label: "Konversi satuan" },
    { value: "prices", label: "Daftar harga" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">{product.product_name}</h2>
            <span className="font-mono text-xs text-gray-500">{product.sku}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip
              label={PRODUCT_STATUS_LABELS[product.status] ?? product.status}
              color={product.status === "active" ? "success" : "default"}
              size="small"
            />
            <Chip
              label={PRODUCT_TYPE_LABELS[product.product_type] ?? product.product_type}
              size="small"
              variant="outlined"
            />
            <Chip label={formatMoney(product.price)} size="small" variant="outlined" />
            {product.unit?.name && (
              <Chip label={`Satuan ${product.unit.name}`} size="small" variant="outlined" />
            )}
            {product.category?.name && (
              <Chip label={product.category.name} size="small" variant="outlined" />
            )}
            {/* A parent that has variants is NOT quotable and its variants are
                quoted instead (A8). The chip states the consequence, not a
                claim that the product "stopped being sellable". */}
            {hasVariants && (
              <Chip
                label={`${product.variant_count} varian - varian yang dipilih di quotation`}
                color="info"
                size="small"
              />
            )}
          </div>

          {/* A variant shows its parent read-only, with its axes (I5). */}
          {isVariant && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
              <span>Varian dari</span>
              <Link
                href={`/sales/product/${product.parent_product_id}`}
                className="font-medium text-[#5479EE] underline-offset-2 hover:underline"
              >
                {product.parent?.product_name ?? "produk induk"}
              </Link>
              {variantChips.map((chip) => (
                <Chip key={chip.key} label={chip.label} size="small" variant="outlined" />
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/sales/product">
            <AppButton variantStyle="outline">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Daftar produk
            </AppButton>
          </Link>
          <AppButton variantStyle="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-1.5 h-4 w-4" />
            Ubah produk
          </AppButton>
        </div>
      </div>

      <AppTabs<TabValue> value={tab} onChange={setTab} tabs={tabs} />

      {tab === "detail" && (
        <div className="grid grid-cols-1 gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">Deskripsi</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{product.description || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">HPP</p>
            <p className="mt-1 text-sm">
              {product.cost === null || product.cost === undefined
                ? "Belum ada HPP"
                : formatMoney(product.cost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Meta retailer id</p>
            <p className="mt-1 font-mono text-sm">{product.meta_retailer_id || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Atribut produk</p>
            <CustomFieldsReadOnly
              entityType="product"
              values={product.custom_fields}
              definitions={productDefinitions}
              className="mt-1 text-sm"
            />
          </div>
        </div>
      )}

      {tab === "variants" && (
        <ProductVariantsTab product={product} onChanged={() => setRefreshSeq((n) => n + 1)} />
      )}
      {tab === "bundle" && (
        <ProductBundleItemsTab product={product} onChanged={() => setRefreshSeq((n) => n + 1)} />
      )}
      {tab === "units" && (
        <ProductUnitsTab
          product={product}
          missingConversionUnitIds={missingConversionUnitIds}
          onChanged={() => setRefreshSeq((n) => n + 1)}
        />
      )}
      {tab === "prices" && (
        <ProductPriceListsPanel productId={product.id} basePrice={product.price} />
      )}

      <AddProductModal
        open={editOpen}
        onOpenChange={setEditOpen}
        product={product}
        onSaved={() => setRefreshSeq((n) => n + 1)}
      />
    </div>
  );
}
