"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import ProductHeader from "@/components/product/ProductHeader";
import ProductTable from "@/components/product/ProductTable";
import { useGetProductStore, Product } from "@/lib/store/product";
import { useAuth } from "@/lib/context/AuthContext";
import { SuperTableState } from "@/components/ui/super-table";
import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import { AddProductModal } from "@/components/product/AddProductModal";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

export default function ProductClient() {
  const { listProduct, loading, pagination, setPage, setLimit, setSearchQuery, setSort, setEditId, deleteProduct, fetchProduct } = useGetProductStore();
  const { token } = useAuth();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const prevStateRef = useRef<{
    page: number;
    limit: number;
    search: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }>({
    page: 1,
    limit: 10,
    search: ""
  });

  useEffect(() => {
    fetchProduct({
      page: pagination.page,
      limit: pagination.limit,
      search: ""
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableStateChange = useCallback((state: SuperTableState) => {
    const newPage = state.pagination.pageIndex + 1;
    const newLimit = state.pagination.pageSize;
    const newSearch = state.globalFilter || "";
    
    const prev = prevStateRef.current;
    
    if (prev.limit !== newLimit) {
      prevStateRef.current = { ...prev, limit: newLimit, page: 1 };
      setLimit(newLimit); // setLimit sudah auto-fetch dengan page=1
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
  }, [setLimit, setPage, setSearchQuery, setSort, fetchProduct]);

  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    products: Product[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkDelete = async (
    selectedProducts: Product[],
    clearSelection: () => void
  ) => {
    setBulkDeleteTarget({ products: selectedProducts, clearSelection });
  };

  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { products: selectedProducts, clearSelection } = bulkDeleteTarget;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    const failedNames: string[] = [];
    
    for (const product of selectedProducts) {
      try {
        const result = await deleteProduct(product.id);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
          // Tampilkan nama produk yang gagal
          failedNames.push(product.product_name);
        }
      } catch (error: any) {
        failCount++;
        failedNames.push(product.product_name);
      }
    }
    
    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} product(s) deleted successfully`);
    }
    if (failCount > 0) {
      notify.error(
        `${failCount} product(s) could not be deleted because they are still linked to other data`,
        { description: `Produk: ${failedNames.join(', ')}` }
      );
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
         rowCount={pagination.total}
         onStateChange={handleTableStateChange}
         onExportRequest={handleExportRequest}
         renderTopLeftToolbar={renderTopLeftToolbar}
         onBulkDelete={handleBulkDelete}
         isBulkDeleting={isBulkDeleting}
      />
      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Delete ${bulkDeleteTarget?.products.length ?? 0} product(s)?`}
        description="The selected products will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
