"use client"

import PageHeader from '@/components/ui/page-header'


export default function ProductHeader() {
  return (
    <>
      <PageHeader
        title="Product Catalog"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Product Catalog" },
        ]}
      />
    </>
  )
}
