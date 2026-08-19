"use client"
import PageHeader from "@/components/ui/page-header"


export default function QuotationHeader() {
  return (
    <>
      <PageHeader
        title="Quotations"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Quotation Builder" },
        ]}
      />
    </>
  )
}
