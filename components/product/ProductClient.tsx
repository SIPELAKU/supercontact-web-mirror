"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import ProductHeader from "@/components/product/ProductHeader";
import ProductTable from "@/components/product/ProductTable";
import { useGetProductStore, Product, ProductStatusFilter } from "@/lib/store/product";
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

export default function ProductClient() {
  const {
    listProduct, loading, error, pagination,
    setPage, setLimit, setSearchQuery, setStatusFilter, setSort, setEditId,
    archiveProduct, duplicateProducts, fetchProduct,
  } = useGetProductStore();
  const { token } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkArchiving, setIsBulkArchiving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const prevStateRef = useRef<{
    page: number;
    limit: number;
    search: string;
    status: ProductStatusFilter;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>({
    page: 1,
    limit: 25, // matches SuperTable's lazy batch
    search: "",
    status: "active",
  });

  useEffect(() => {
    fetchProduct({
      page: pagination.page,
      limit: pagination.limit,
      search: "",
      status: "active",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableStateChange = useCallback((state: SuperTableState) => {
    const newPage = state.pagination.pageIndex + 1;
    const newLimit = state.pagination.pageSize;
    const newSearch = state.globalFilter || "";
    // Declarative `filters` land here as a flat object; no filter means the
    // server default (active).
    const newStatus = readStatusFilter(state.filters?.status);

    const prev = prevStateRef.current;

    if (prev.limit !== newLimit) {
      prevStateRef.current = { ...prev, limit: newLimit, page: 1 };
      setLimit(newLimit); // setLimit sudah auto-fetch dengan page=1
      return;
    }

    if (prev.status !== newStatus) {
      prevStateRef.current = { ...prev, status: newStatus, page: 1 };
      setStatusFilter(newStatus);
      fetchProduct({ status: newStatus, page: 1 });
      return;
    }

    if (prev.page !== newPage) {
      prevStateRef.current = { ...prev, page: newPage };
      setPage(newPage); // setPage sudah auto-fetch
      return;
    }

    if (prev.search !== newSearch) {
      prevStateRef.current = { ...prev, search: newSearch, page: 1 };
      setSearchQuery(newSearch);
      // store.setSearchQuery tidak melakukan fetching di index.ts, maka kita tembak manual
      fetchProduct({ search: newSearch, page: 1 });
      return;
    }

    // Server-side sorting (sort_by/sort_order contract)
    const sort = state.sorting?.[0];
    const newSortBy = sort?.id;
    const newSortOrder: "asc" | "desc" | undefined = sort
      ? (sort.desc ? "desc" : "asc")
      : undefined;
    if (prev.sortBy !== newSortBy || prev.sortOrder !== newSortOrder) {
      prevStateRef.current = { ...prev, sortBy: newSortBy, sortOrder: newSortOrder };
      setSort(newSortBy, newSortOrder);
      fetchProduct({ sort_by: newSortBy, sort_order: newSortOrder });
      return;
    }
  }, [setLimit, setPage, setSearchQuery, setStatusFilter, setSort, fetchProduct]);

  const [bulkArchiveTarget, setBulkArchiveTarget] = useState<{
    products: Product[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkArchive = async (
    selectedProducts: Product[],
    clearSelection: () => void
  ) => {
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
      } catch (error: any) {
        failCount++;
        failedNames.push(product.product_name);
      }
    }

    setIsBulkArchiving(false);
    setBulkArchiveTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} produk diarsipkan`, {
        description: "Produk yang diarsipkan tidak muncul di quotation baru.",
      });
    }
    if (failCount > 0) {
      notify.error(
        `${failCount} produk gagal diarsipkan`,
        { description: `Produk: ${failedNames.join(', ')}` }
      );
    }
  };

  // Mirrors ContactClient's handleDuplicate: POST /products/duplicate with
  // { product_ids }, then refresh list + clear selection + toast.
  const handleDuplicate = async (products: Product[], clearSelection?: () => void) => {
    setIsDuplicating(true);
    try {
      const ids = products.map(p => p.id);
      const result = await duplicateProducts(ids);
      if (result.success) {
        notify.success(`${products.length} product(s) duplicated successfully.`);
        clearSelection?.();
      } else {
        notify.error(result.error || "Failed to duplicate product(s).");
      }
    } catch (err: any) {
      notify.error(err.message || "Failed to duplicate product(s).");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleExportRequest = async (params: { format: "csv" | "excel", currentState: SuperTableState }) => {
    try {
      const search = params.currentState.globalFilter;
      const LIMIT_PER_PAGE = 100;
      let allProducts: Product[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", String(LIMIT_PER_PAGE));
        // An export is the whole catalogue, archived rows included.
        urlParams.set("status", "all");
        if (search) urlParams.set("search", search);

        const response = await fetch(
          `/api/proxy/products?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();

        const products = data?.data?.products || [];
        totalPages = data?.data?.total_pages || 1;
        allProducts = [...allProducts, ...products];
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
        <AppButton
          onClick={() => {
            setEditId("");
            setIsAddModalOpen(true);
          }}
          startIcon={<Plus size={16} />}
        >
          Add Product
        </AppButton>
      </div>

      {/* Mobile — icon only, ukuran w-9 h-9 */}
      <div className="flex md:hidden gap-2">
        <button
          onClick={() => {
            setEditId("");
            setIsAddModalOpen(true);
          }}
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
      <AddProductModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
      <ProductTable
         products={listProduct}
         isLoading={loading}
         isError={!!error}
         errorMessage={error || undefined}
         onRetry={() => fetchProduct()}
         onAdd={() => setIsAddModalOpen(true)}
         rowCount={pagination.total}
         onStateChange={handleTableStateChange}
         onExportRequest={handleExportRequest}
         renderTopLeftToolbar={renderTopLeftToolbar}
         onBulkArchive={handleBulkArchive}
         isBulkArchiving={isBulkArchiving}
         onDuplicate={handleDuplicate}
         isDuplicating={isDuplicating}
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
