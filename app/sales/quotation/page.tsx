"use client"

import { useEffect } from "react"
import QuotationHeader from "@/components/quotation/QuotationHeader"
import QuotationTable from "@/components/quotation/QuotationTable"
import { useGetQuotationstore } from "@/lib/store/quotation"
import { useDebounce } from "@/lib/hooks/useDebounce"


export default function QuotationPage() {
  const { fetchQuotations, pagination, dateRangeFilter, searchQuery } = useGetQuotationstore();
  const searchDebounce = useDebounce(searchQuery, 500)

  useEffect(() => {
    fetchQuotations({
      limit: pagination.limit,
      page: pagination.page,
      dateRange: dateRangeFilter,
      search: searchDebounce
    })
  }, [dateRangeFilter, searchDebounce])

  return (
    <div className="p-6">
      <QuotationHeader />
      <QuotationTable />
    </div>
  )
}
