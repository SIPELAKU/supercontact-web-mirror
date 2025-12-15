"use client"

import ProductHeader from "@/components/product/ProductHeader"
import ProductTable from "@/components/product/ProductTable"
import { useGetProductStore } from "@/lib/store/product"
import { useEffect } from "react";


export default function ProductPage() {
  const { fetchProduct } = useGetProductStore();

  useEffect(() => {
    fetchProduct();
  }, [])

  return (
    <div className="p-6">
      <ProductHeader />
      <ProductTable />
    </div>
  )
}
