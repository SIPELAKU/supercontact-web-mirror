"use client";

import { useEffect } from "react";
import ProductHeader from "@/components/product/ProductHeader";
import ProductTable from "@/components/product/ProductTable";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetProductStore } from "@/lib/store/product";

export default function ProductClient() {
  const { fetchProduct, pagination, searchQuery } = useGetProductStore();
  const searchDebounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchProduct({
      page: 1, // Reset to page 1 on new search
      limit: pagination.limit,
      search: searchDebounce
    });
  }, [searchDebounce]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <ProductHeader />
      <ProductTable />
    </div>
  );
}
