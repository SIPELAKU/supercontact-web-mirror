"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProductHeader from "@/components/product/ProductHeader";
import ProductTable from "@/components/product/ProductTable";
import {
  useGetProductStore,
  type FetchProductParams,
  type Product,
  type ProductStatusFilter,
  type ProductType,
} from "@/lib/store/product";
import { readProductType } from "@/lib/constants/product-type";
import { fetchProductsPage } from "@/lib/api/products";
import { useProductCategoryTree } from "@/lib/hooks/useProductCategories";
import { flattenTree } from "@/lib/utils/categoryTree";
import { useAuth } from "@/lib/context/AuthContext";
import { SuperTableState } from "@/components/ui/super-table";
import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import { AddProductModal } from "@/components/product/AddProductModal";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

const STATUS_FILTER_VALUES: ProductStatusFilter[] = ["active", "archived", "all"];

function readStatusFilter(value: unknown): ProductStatusFilter {
  return typeof value === "string" && (STATUS_FILTER_VALUES as string[]).includes(value)
    ? (value as ProductStatusFilter)
    : "active";
}

/** Everything that defines the list the user is looking at. */
interface ListState {
  page: number;
  limit: number;
  search: string;
  status: ProductStatusFilter;
  categoryId?: string;
  productType?: ProductType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  /**
   * COMMERCIAL Phase 5 (spec I5 / E5.1). `GET /products` is top-level only by
   * default; the "Tampilkan varian" chip flattens the children back in.
   */
  includeVariants?: boolean;
}

const INITIAL_LIST: ListState = {
  page: 1,
  limit: 25, // matches SuperTable's lazy batch
  search: "",
  status: "active",
};

function toFetchParams(state: ListState): Partial<FetchProductParams> {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search,
    status: state.status,
    category_id: state.categoryId,
    product_type: state.productType,
    sort_by: state.sortBy,
    sort_order: state.sortOrder,
    include_variants: state.includeVariants,
  };
}

function sameQuery(a: ListState, b: ListState): boolean {
  return (
    a.limit === b.limit &&
    a.search === b.search &&
    a.status === b.status &&
    a.categoryId === b.categoryId &&
    a.productType === b.productType &&
    a.sortBy === b.sortBy &&
    a.sortOrder === b.sortOrder &&
    a.includeVariants === b.includeVariants
  );
}

export default function ProductClient() {
  const { listProduct, loading, error, pagination, archiveProduct, duplicateProducts, fetchProduct } =
    useGetProductStore();
  const { getToken } = useAuth();
  const { data: tree } = useProductCategoryTree();

  const categoryOptions = useMemo(
    () => flattenTree(tree ?? []).map((node) => ({ value: node.id, label: node.label })),
    [tree]
  );

  // Class A row interaction: the modal edits the ROW OBJECT handed to it.
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  // Bumped after every successful mutation: the store refetched page 1 of
  // the current query, and this sends SuperTable back to batch 1 so the
  // accumulated rows cannot go stale (S3-4).
  const [mutationSeq, setMutationSeq] = useState(0);

  const prevStateRef = useRef<ListState>(INITIAL_LIST);

  useEffect(() => {
    fetchProduct(toFetchParams(INITIAL_LIST));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableStateChange = useCallback(
    (state: SuperTableState) => {
      const sort = state.sorting?.[0];
      const categoryId = state.filters?.category_id;
      // Declarative `filters` land here as a flat object; category and type
      // are forwarded as fetch params (page 1 on change), never stored.
      const next: ListState = {
        page: state.pagination.pageIndex + 1,
        limit: state.pagination.pageSize,
        search: state.globalFilter || "",
        status: readStatusFilter(state.filters?.status),
        categoryId: typeof categoryId === "string" && categoryId ? categoryId : undefined,
        productType: readProductType(state.filters?.product_type),
        sortBy: sort?.id,
        sortOrder: sort ? (sort.desc ? "desc" : "asc") : undefined,
        includeVariants: state.filters?.include_variants ? true : undefined,
      };
      const prev = prevStateRef.current;

      if (!sameQuery(prev, next)) {
        // A new query starts from the first batch whatever page the table
        // reports mid-transition; SuperTable resets to page 1 itself and the
        // echo of that reset then matches `prev` and is ignored.
        const first = { ...next, page: 1 };
        prevStateRef.current = first;
        fetchProduct(toFetchParams(first));
        return;
      }
      if (prev.page !== next.page) {
        prevStateRef.current = next;
        fetchProduct(toFetchParams(next));
      }
    },
    [fetchProduct]
  );

  // The store already refetched page 1 of the current query; align the
  // tracked page so the table's reset echo does not fetch it a second time.
  const afterMutation = useCallback(() => {
    prevStateRef.current = { ...prevStateRef.current, page: 1 };
    setMutationSeq((seq) => seq + 1);
  }, []);

  const openCreate = () => {
    setEditProduct(null);
    setIsModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  const handleArchive = async (product: Product) => {
    const result = await archiveProduct(product.id);
    if (result.success) afterMutation();
    return result;
  };

  const [bulkArchiveTarget, setBulkArchiveTarget] = useState<{
    products: Product[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkArchive = async (selectedProducts: Product[], clearSelection: () => void) => {
    setBulkArchiveTarget({ products: selectedProducts, clearSelection });
  };

  const performBulkArchive = async () => {
    if (!bulkArchiveTarget) return;
    const { products: selectedProducts, clearSelection } = bulkArchiveTarget;
    setIsBulkArchiving(true);
    let successCount = 0;
    let failCount = 0;
    const failedNames: string[] = [];

    for (const product of selectedProducts) {
      try {
        const result = await archiveProduct(product.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          failedNames.push(product.product_name);
        }
      } catch {
        failCount++;
        failedNames.push(product.product_name);
      }
    }

    setIsBulkArchiving(false);
    setBulkArchiveTarget(null);
    clearSelection();
    if (successCount > 0) afterMutation();

    if (successCount > 0) {
      notify.success(`${successCount} produk diarsipkan`, {
        description: "Produk yang diarsipkan tidak muncul di quotation baru.",
      });
    }
    if (failCount > 0) {
      notify.error(`${failCount} produk gagal diarsipkan`, { description: `Produk: ${failedNames.join(", ")}` });
    }
  };

  // Mirrors ContactClient's handleDuplicate: POST /products/duplicate with
  // { product_ids }, then refresh list + clear selection + toast.
  const handleDuplicate = async (products: Product[], clearSelection?: () => void) => {
    setIsDuplicating(true);
    try {
      const ids = products.map((p) => p.id);
      const result = await duplicateProducts(ids);
      if (result.success) {
        notify.success(`${products.length} product(s) duplicated successfully.`);
        clearSelection?.();
        afterMutation();
      } else {
        notify.error(result.error || "Failed to duplicate product(s).");
      }
    } catch (err: any) {
      notify.error(err.message || "Failed to duplicate product(s).");
    } finally {
      setIsDuplicating(false);
    }
  };

  // An export is the whole catalogue matching the current search, type and
  // category, archived rows included - fetched page by page straight from
  // the API with the token already in hand (no /api/proxy).
  const handleExportRequest = async (params: {
    format: "csv" | "excel";
    currentState: SuperTableState;
    onProgress?: (fetched: number, total: number) => void;
  }) => {
    try {
      const token = await getToken();
      const current = prevStateRef.current;
      const search = params.currentState.globalFilter || current.search;
      const LIMIT_PER_PAGE = 100;
      let allProducts: Product[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const page = await fetchProductsPage(token, {
          page: currentPage,
          limit: LIMIT_PER_PAGE,
          status: "all",
          search: search || undefined,
          category_id: current.categoryId,
          product_type: current.productType,
          sort_by: current.sortBy,
          sort_order: current.sortOrder,
          include_total: currentPage === 1,
          // COMMERCIAL Phase 5 (spec I5). An EXPORT is the whole catalogue, and
          // `GET /products` is top-level only now - so without this the export
          // would silently stop containing every variant the tenant sells.
          include_variants: true,
        });
        if (currentPage === 1) totalPages = page.total_pages ?? 1;
        allProducts = [...allProducts, ...page.products];
        params.onProgress?.(allProducts.length, (page.total ?? totalPages * LIMIT_PER_PAGE) || allProducts.length);
        currentPage++;
      } while (currentPage <= totalPages);

      return allProducts;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  const renderTopLeftToolbar = () => (
    <>
      {/* Desktop */}
      <div className="hidden md:flex gap-2">
        <AppButton onClick={openCreate} startIcon={<Plus size={16} />}>
          Add Product
        </AppButton>
      </div>

      {/* Mobile — icon only, ukuran w-9 h-9 */}
      <div className="flex md:hidden gap-2">
        <button
          onClick={openCreate}
          aria-label="Add Product"
          className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </>
  );

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <ProductHeader />
      <AddProductModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditProduct(null);
        }}
        product={editProduct}
        onSaved={afterMutation}
      />
      <ProductTable
        products={listProduct}
        isLoading={loading}
        isError={!!error}
        errorMessage={error || undefined}
        onRetry={() => fetchProduct(toFetchParams(prevStateRef.current))}
        onAdd={openCreate}
        // Only a real number: a batch without a total must not read as 0 rows.
        rowCount={typeof pagination.total === "number" ? pagination.total : undefined}
        resetPageKey={mutationSeq}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        renderTopLeftToolbar={renderTopLeftToolbar}
        onEdit={openEdit}
        onArchive={handleArchive}
        onBulkArchive={handleBulkArchive}
        isBulkArchiving={isBulkArchiving}
        onDuplicate={handleDuplicate}
        isDuplicating={isDuplicating}
        categoryOptions={categoryOptions}
      />
      <ConfirmationPopup
        isOpen={!!bulkArchiveTarget}
        onClose={() => setBulkArchiveTarget(null)}
        onConfirm={performBulkArchive}
        title={`Arsipkan ${bulkArchiveTarget?.products.length ?? 0} produk?`}
        description="Produk yang diarsipkan tidak akan muncul di quotation baru. Quotation yang sudah ada tidak berubah, dan produk bisa diaktifkan kembali lewat Edit."
        confirmText="Arsipkan"
        cancelText="Batal"
        variant="warning"
        isLoading={isBulkArchiving}
      />
    </div>
  );
}
