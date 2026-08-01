"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { CompanyStats } from "@/components/omnichannel";
import CompanyTable from "@/components/data-intelligence/company-table/CompanyTable";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "../ui/app-button";
import { notify } from "@/lib/notifications";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import { useAuth } from "@/lib/context/AuthContext";
import { getMyTargetCompanies, deleteTargetCompany } from "@/lib/api/company-intelligence";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { CompanyIntelligenceItem, MyTargetCompaniesSummary } from "@/lib/types/company-intelligence";
import MyTopCompaniesContent from "./MyTopCompaniesContent";
import { SuperTableState } from "@/components/ui/super-table";

interface CompanyIntelligenceClientProps {
  breadcrumbs?: { label: string; href?: string }[];
  enableSearch?: boolean;
}

export default function CompanyIntelligenceClient({
  breadcrumbs,
  enableSearch = true,
}: CompanyIntelligenceClientProps) {
  const { getToken } = useAuth();
  const router = useRouter();
  const { showConfirmation } = useConfirmation();
  const [companies, setCompanies] = useState<CompanyIntelligenceItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<MyTargetCompaniesSummary | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"dashboard" | "top-companies">("dashboard");

  // ===== TABLE STATE (driven by SuperTable) ===== //
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 10 },
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
  });

  // Helper untuk normalize filter value ke array (MRT bisa return string atau array)
  const toArray = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as string[];
    if (typeof val === 'string') return [val];
    return [];
  };

  // Extract filters from SuperTable column filters
  const industryFilter = toArray(
    tableState.columnFilters.find((f) => f.id === 'industry')?.value
  );
  const locationFilter = toArray(
    tableState.columnFilters.find((f) => f.id === 'location')?.value
  );
  const statusFilter = tableState.columnFilters
    .find((f) => f.id === "status")?.value as string | undefined;

  const handleTableStateChange = useCallback((newState: SuperTableState) => {
    setTableState({
      pagination: {
        pageIndex: newState.pagination.pageIndex,
        pageSize: newState.pagination.pageSize,
      },
      globalFilter: newState.globalFilter || "",
      columnFilters: (newState.columnFilters || []) as { id: string; value: unknown }[],
    });
  }, []);

  const fetchCompanies = async () => {
    if (!enableSearch) return;

    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      const params = {
        industry: industryFilter.length > 0 ? industryFilter : [],
        location: locationFilter.length > 0 ? locationFilter : [],
        search: tableState.globalFilter || "",
        page: tableState.pagination.pageIndex + 1,
        limit: tableState.pagination.pageSize,
      };

      const data = await getMyTargetCompanies(token, params);
      setCompanies(data.data || []);
      setTotalCount(data.meta.total);
      setSummary(data.summary);
    } catch (err: any) {
      console.error("Failed to fetch companies:", err);
      setError(err.message || "Failed to fetch companies");
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side status filter (API tidak support param status)
  const filteredCompanies = statusFilter
    ? companies.filter((c) => {
        const val = (c.status || c.financial_status || "N/A").toLowerCase();
        return val === statusFilter.toLowerCase();
      })
    : companies;

  useEffect(() => {
    if (enableSearch) {
      fetchCompanies();
    }
  }, [
    tableState.globalFilter,
    tableState.columnFilters,
    tableState.pagination.pageIndex,
    tableState.pagination.pageSize,
    getToken,
    enableSearch,
  ]);

  // ===== EXPORT (loop all pages) ===== //
  const handleExportRequest = async (params: any): Promise<CompanyIntelligenceItem[]> => {
    try {
      const token = await getToken();
      let allData: CompanyIntelligenceItem[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const data = await getMyTargetCompanies(token, {
          industry: industryFilter.length > 0 ? industryFilter : [],
          location: locationFilter.length > 0 ? locationFilter : [],
          search: tableState.globalFilter || "",
          page: currentPage,
          limit: 50,
        });

        const items = data.data || [];
        const total = data.meta.total || 0;
        totalPages = Math.ceil(total / 50) || 1;

        allData = [...allData, ...items];
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  // ===== DELETE (single — with confirmation) ===== //
  const handleDelete = (id: string) => {
    const companyToDelete = companies.find((c) => c.id === id);
    const companyName = companyToDelete?.name || "this company";

    showConfirmation({
      type: "delete",
      title: "Delete Company",
      message: `Are you sure you want to delete ${companyName} from your target list?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const token = await getToken();
          await deleteTargetCompany(token, id);
          notify.success("Company deleted successfully");
          fetchCompanies();
        } catch (err: any) {
          console.error("Failed to delete company:", err);
          notify.error(err.message || "Failed to delete company");
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // ===== BULK DELETE (with confirmation + Promise.all) ===== //
  const handleBulkDelete = (ids: string[], clearSelection: () => void) => {
    if (ids.length === 0) return;

    showConfirmation({
      type: "delete",
      title: "Delete Companies",
      message: `Are you sure you want to delete ${ids.length} companies from your target list?`,
      confirmText: `Delete (${ids.length})`,
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const token = await getToken();
          await Promise.all(ids.map((id) => deleteTargetCompany(token, id)));
          notify.success(`${ids.length} companies deleted successfully`);
          clearSelection();
          fetchCompanies();
        } catch (err: any) {
          console.error("Failed to delete companies:", err);
          notify.error("Failed to delete some companies");
          fetchCompanies();
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // ===== PRINT PDF ===== //
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Saved Companies",
  });

  const printableColumns = [
    { header: "Company Name", accessorKey: "name" },
    { header: "Industry", accessorKey: "industry" },
    { header: "Location", accessorKey: "location" },
    { header: "Employees", accessorKey: "employee_count" },
    { header: "Financial Status", accessorKey: "financial_status" },
  ];

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Saved Companies"
        breadcrumbs={
          breadcrumbs || [{ label: "Data Intelligence" }, { label: "Saved Companies" }]
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <div
            className={`pb-4 px-1 cursor-pointer ${activeTab === "dashboard" ? "border-b-2 border-blue-600" : ""
              }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span
              className={`${activeTab === "dashboard" ? "text-blue-600" : "text-gray-500"
                } font-medium`}
            >
              Dashboard List
            </span>
          </div>
          <div
            className={`pb-4 px-1 cursor-pointer ${activeTab === "top-companies" ? "border-b-2 border-blue-600" : ""
              }`}
            onClick={() => setActiveTab("top-companies")}
          >
            <span
              className={`${activeTab === "top-companies" ? "text-blue-600" : "text-gray-500"
                } font-medium hover:text-gray-700`}
            >
              Top Companies in My Industry
            </span>
          </div>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <>
          {/* Stats Card */}
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
            <CompanyStats summary={summary} />
          </div>

          <CompanyTable
            companies={filteredCompanies}
            isLoading={isLoading}
            isError={!!error}
            rowCount={totalCount}
            onStateChange={handleTableStateChange}
            onExportRequest={handleExportRequest}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onRowClick={(row) =>
              router.push(`/data-intelligence/company/${row.id}?source=saved`)
            }
            renderTopLeftToolbar={() => (
              <>
                {/* Desktop Print button */}
                <div className="hidden md:flex">
                  <AppButton
                    variantStyle="outline"
                    color="gray"
                    onClick={handlePrint}
                    startIcon={<Printer size={16} />}
                  >
                    Print PDF
                  </AppButton>
                </div>
                {/* Mobile Print icon */}
                <div className="flex md:hidden">
                  <button
                    onClick={handlePrint}
                    className="flex items-center justify-center w-9 h-9 
                               rounded-md border border-gray-300 text-gray-600 
                               hover:bg-gray-50 transition-colors"
                    title="Print PDF"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </>
            )}
          />
        </>
      ) : (
        <MyTopCompaniesContent />
      )}

      {/* Hidden printable table */}
      <div style={{ display: "none" }}>
        <PrintableTable
          ref={componentRef}
          title="Saved Companies"
          columns={printableColumns}
          data={companies}
        />
      </div>
    </div>
  );
}
