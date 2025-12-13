"use client"

import QuotationHeader from "@/components/quotation/QuotationHeader"
import QuotationTable from "@/components/quotation/QuotationTable"

export default function QuotationPage() {
  return (
    <div className="p-6">
      <QuotationHeader />
      <QuotationTable />
    </div>
  )
}
