"use client"

import { useState } from "react"
import PageHeader from '@/components/ui-mui/page-header'


export default function ProductHeader() {
  return (
    <>
      <PageHeader
        title="Product Catalog"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Product Catalog" },
        ]}
      />
    </>
  )
}
