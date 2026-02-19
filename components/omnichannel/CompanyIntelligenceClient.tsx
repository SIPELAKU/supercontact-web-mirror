"use client";

import { ChangeEvent, MouseEvent, Suspense, useMemo, useState, useRef, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Slider, Box, Typography } from "@mui/material";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { Plus, Search, Upload } from "lucide-react";
import { CompanyStats, CompanyTable } from "@/components/omnichannel";
// Removed FilterByIndustry and FilterByStatus as they are replaced by new filters
import InputSearch from "@/components/ui/input-search";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import {
  CompanyStatus,
  Industry,
  IndustryOption,
  StatusOption,
} from "@/lib/types/Company";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
// import ExportPopover from "./ExportPopover";
import { notify } from "@/lib/notifications";
// import { useReactToPrint } from "react-to-print";
// import { PrintableTable } from "@/components/ui/printable-table";
import { useAuth } from "@/lib/context/AuthContext";
import { getMyTargetCompanies, deleteTargetCompany } from "@/lib/api/company-intelligence";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { CompanyIntelligenceItem, MyTargetCompaniesSummary } from "@/lib/types/company-intelligence";
import { INDUSTRY_OPTIONS, LOCATION_OPTIONS } from "@/lib/data/company-intelligence-options";

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

  // Filter States
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const componentRef = useRef<HTMLDivElement>(null);

  // ===== SEARCH & PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchCompanies = async () => {
    if (!enableSearch) return;

    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      const params = {
        industry: selectedIndustries,
        location: selectedLocations,
        search: debouncedSearchQuery,
        page: page + 1, // API is 1-indexed
        limit: rowsPerPage,
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

  useEffect(() => {
    if (enableSearch) {
      fetchCompanies();
    }
  }, [debouncedSearchQuery, selectedIndustries, selectedLocations, page, rowsPerPage, getToken, enableSearch]);

  // ===== PAGINATION  ===== //

  const columns = [
    { id: "name", label: "Company Name" },
    { id: "industry", label: "Industry" },
    { id: "location", label: "Location" },
    { id: "employees", label: "Employees" },
    { id: "status", label: "Status" },
    { id: "action", label: "Action" },
  ];

  const printableColumns = [
    { header: "Company Name", accessorKey: "name" },
    { header: "Industry", accessorKey: "industry" },
    { header: "Location", accessorKey: "location" },
    { header: "Employees", accessorKey: "employee_count" },
    { header: "Financial Status", accessorKey: "financial_status" },
  ];

  /* Export and Print handlers removed */

  const handleChangePage = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(companies.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

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

          // Refresh the list & clear selection if needed
          setSelectedIds((prev) => prev.filter((i) => i !== id));
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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;

    showConfirmation({
      type: "delete",
      title: "Delete Companies",
      message: `Are you sure you want to delete ${selectedIds.length} companies from your target list?`,
      confirmText: `Delete (${selectedIds.length})`,
      cancelText: "Cancel",
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const token = await getToken();
          await Promise.all(selectedIds.map((id) => deleteTargetCompany(token, id)));
          notify.success(`${selectedIds.length} companies deleted successfully`);

          // Clear selection first
          setSelectedIds([]);
          // Then refresh
          fetchCompanies();
        } catch (err: any) {
          console.error("Failed to delete companies:", err);
          notify.error("Failed to delete some companies");
          // Refresh anyway to show current state
          fetchCompanies();
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="My Target Companies"
        breadcrumbs={
          breadcrumbs || [{ label: "Data Intelligence" }, { label: "My Target Companies" }]
        }
      />

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <div className="pb-4 border-b-2 border-blue-600 px-1">
            <span className="text-blue-600 font-medium cursor-pointer">
              Dashboard List
            </span>
          </div>
          <div
            className="pb-4 px-1 cursor-pointer"
            onClick={() => router.push("/data-intelligence/industry-leaders")}
          >
            <span className="text-gray-500 font-medium hover:text-gray-700">
              Industry Leaders
            </span>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyStats summary={summary} />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow-sm border border-gray-100 p-6">
        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Industry AppAutocomplete */}
            <div className="w-full md:w-[200px]">
              <AppAutocomplete
                multiple
                options={INDUSTRY_OPTIONS}
                value={selectedIndustries}
                onChange={(event, newValue) => {
                  setSelectedIndustries(newValue);
                }}
                placeholder="Industry"
                size="small"
                isBgWhite
              />
            </div>

            {/* Location AppAutocomplete */}
            <div className="w-full md:w-[200px]">
              <AppAutocomplete
                multiple
                options={LOCATION_OPTIONS}
                value={selectedLocations}
                onChange={(event, newValue) => {
                  setSelectedLocations(newValue);
                }}
                placeholder="Location"
                size="small"
                isBgWhite
              />
            </div>

            {/* Search Input */}
            <div className="w-full md:w-[300px]">
              <Suspense>
                <AppInput
                  placeholder="Search Company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  isBgWhite
                  startIcon={null}
                />
              </Suspense>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex w-full md:w-auto justify-end">
              <AppButton
                onClick={handleBulkDelete}
                variantStyle="danger"
              >
                Delete ({selectedIds.length})
              </AppButton>
            </div>
          )}
        </div>

        {/* Table */}
        <CompanyTable
          company={companies}
          isLoading={isLoading}
          error={error}
          showAction={true}
          showInsightScore={false}
          onDelete={handleDelete}
          onRowClick={(id) => router.push(`/data-intelligence/industry-leaders/profile/${id}?type=target`)}
          selectedIds={selectedIds}
          onSelectOne={handleSelectOne}
          onSelectAll={handleSelectAll}
        />

        {/* Pagination - Aligned to match mockup */}
        <div className="flex w-full justify-end mt-4">
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>

      <div style={{ display: "none" }}>
        {/* PrintableTable removed */}
      </div>
    </div>
  );
}
