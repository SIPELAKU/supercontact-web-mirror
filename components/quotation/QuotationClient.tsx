"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { format } from "date-fns";
import QuotationHeader from "@/components/quotation/QuotationHeader";
import QuotationTable from "@/components/quotation/QuotationTable";
import { useGetQuotationstore, Quotation } from "@/lib/store/quotation";
import { SuperTableState } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notifications";

export default function QuotationClient() {
  const router = useRouter();
  const { token } = useAuth();
  
  const { 
    fetchQuotations, 
    listQuotations, 
    loading, 
    error,
    pagination, 
    setPage,
    setLimit,
    setSearchQuery,
    dateRangeFilter,
    setDateRangeFilter // To handle Date Range Filter externally if mapped
  } = useGetQuotationstore();

  const [tableState, setTableState] = useState({
    pagination: {
      pageIndex: 0,
      pageSize: 10,
    },
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[]
  });

  // Initial fetch on mount
  useEffect(() => {
    fetchQuotations({
      limit: 10,
      page: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableStateChange = useCallback((newState: SuperTableState) => {
    setTableState({
      pagination: {
        pageIndex: newState.pagination.pageIndex,
        pageSize: newState.pagination.pageSize,
      },
      globalFilter: newState.globalFilter,
      columnFilters: (newState.columnFilters || []) as { id: string; value: unknown }[]
    });
    
    // Date extract untuk dipass ke API (fetchQuotations)
    const dateFilterValue = newState.columnFilters.find((f: any) => f.id === "expire_date")?.value as [Date | null, Date | null] | undefined;
    
    let date_from: string | undefined = undefined;
    let date_to: string | undefined = undefined;
    
    if (dateFilterValue) {
      if (dateFilterValue[0]) date_from = format(dateFilterValue[0], 'yyyy-MM-dd');
      if (dateFilterValue[1]) date_to = format(dateFilterValue[1], 'yyyy-MM-dd');
    }

    // Trigger API fetch with combined payload params
    // Cast any pada fetchQuotations jika index.ts tidak expose date_from di tipenya
    (fetchQuotations as any)({
        page: newState.pagination.pageIndex + 1,
        limit: newState.pagination.pageSize,
        search: newState.globalFilter,
        date_from,
        date_to
    });

  }, [setPage, setLimit, setSearchQuery, fetchQuotations]);


  const handleExportRequest = async (params: any): Promise<Quotation[]> => {
    try {
      let allData: Quotation[] = [];
      let currentPage = 1;
      let totalPages = 1;
      
      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", "50");
        
        if (params.currentState?.globalFilter) {
          urlParams.set("search", params.currentState.globalFilter);
        }
        
        const response = await fetch(
          `/api/proxy/quotations?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const data = await response.json();
        const items = data?.data?.quotations || [];
        totalPages = data?.data?.total_pages || 1;
        
        allData = [...allData, ...items];
        currentPage++;
      } while (currentPage <= totalPages);
      
      return allData;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  // Client-Side Status Filter Logic
  const statusFilter = tableState.columnFilters
    .find((f: {id: string; value: unknown}) => f.id === 'quotation_status')
    ?.value as string | undefined;

  const filteredQuotations = useMemo(() => {
    const all = listQuotations || [];
    if (!statusFilter || statusFilter === '') return all;
    return all.filter(q => q.quotation_status === statusFilter);
  }, [listQuotations, statusFilter]);

  const handleOpenAddForm = () => {
    router.push("/sales/quotation/add");
  };

  const handleView = (quotation: Quotation) => {
    router.push(`/sales/quotation/${quotation.id}`);
  };

  const handleEdit = (quotation: Quotation) => {
    // Sesuaikan path edit sesuai pola existing (".../edit/[id]" dsb)
    router.push(`/sales/quotation/${quotation.id}`);
  };

  const handleDelete = (quotation: Quotation) => {
     // TODO: Implement deletion when API and store are ready for Quotation
     notify.info(`Delete module for Quotation ${quotation.quotation_number} is not fully integrated yet!`);
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <QuotationHeader />
      
      <QuotationTable 
         quotations={filteredQuotations}
         isLoading={loading}
         isError={!!error}
         rowCount={pagination.total}
         onStateChange={handleTableStateChange}
         onExportRequest={handleExportRequest}
         onView={handleView}
         onEdit={handleEdit}
         onDelete={handleDelete}
         renderTopLeftToolbar={() => (
           <>
             {/* Desktop */}
             <div className="hidden md:flex gap-2">
               <AppButton onClick={handleOpenAddForm}
                 startIcon={<Plus size={16} />}>
                 Create Quotation
               </AppButton>
             </div>

             {/* Mobile — icon only w-9 h-9 */}
             <div className="flex md:hidden gap-2">
               <button onClick={handleOpenAddForm}
                 className="flex items-center justify-center w-9 h-9 
                            rounded-md bg-[#5479EE] text-white 
                            hover:bg-[#3F66E0] transition-colors">
                 <Plus size={16} />
               </button>
             </div>
           </>
         )}
      />
    </div>
  );
}
