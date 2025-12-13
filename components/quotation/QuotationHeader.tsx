"use client"
import PageHeader from "@/components/ui-mui/page-header"


export default function QuotationHeader() {
  return (
    <>
      <PageHeader
        title="Quotation Builder"
        breadcrumbs={[
          { label: "Sales" },
          { label: "Quotation Builder" },
        ]}
      />
    </>
  )
}
