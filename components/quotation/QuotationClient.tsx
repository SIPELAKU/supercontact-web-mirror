"use client";

import { useEffect } from "react";
import QuotationHeader from "@/components/quotation/QuotationHeader";
import QuotationTable from "@/components/quotation/QuotationTable";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useGetQuotationstore } from "@/lib/store/quotation";

export default function QuotationClient() {
  const { fetchQuotations, pagination, dateRangeFilter, searchQuery, statusFilter } = useGetQuotationstore();
  const searchDebounce = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchQuotations({
      limit: pagination.limit,
      page: pagination.page,
      dateRange: dateRangeFilter,
      status: statusFilter,
      search: searchDebounce
    });
  }, [dateRangeFilter, searchDebounce, statusFilter, pagination.page, pagination.limit]);

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <QuotationHeader />
      <QuotationTable />
    </div>
  );
}
