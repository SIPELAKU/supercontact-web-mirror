"use client"

import ProductHeader from "@/components/product/ProductHeader"
import ProductTable from "@/components/product/ProductTable"
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetProductStore } from "@/lib/store/product"
import { useEffect } from "react";


export default function ProductPage() {
  const { fetchProduct, pagination, searchQuery } = useGetProductStore();
  const searchDebounce = useDebounce(searchQuery, 500)

  useEffect(() => {
    fetchProduct({
      page: pagination.page,
      limit: pagination.limit,
      search: searchDebounce
    });
  }, [searchDebounce])

  return (
    <div className="p-6">
      <ProductHeader />
      <ProductTable />
    </div>
  )
}
