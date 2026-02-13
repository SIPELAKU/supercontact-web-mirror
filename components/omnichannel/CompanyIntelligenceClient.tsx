"use client";

import { ChangeEvent, MouseEvent, Suspense, useMemo, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { Plus, Search, Upload } from "lucide-react";
import { CompanyStats, CompanyTable } from "@/components/omnichannel";
import FilterByIndustry from "@/components/omnichannel/company/filter/FilterByIndustry";
import FilterByStatus from "@/components/omnichannel/company/filter/FilterByStatus";
import InputSearch from "@/components/ui/input-search";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import useCompany from "@/lib/hooks/useCompany";
import {
  CompanyStatus,
  Industry,
  IndustryOption,
  StatusOption,
} from "@/lib/types/Company";
import { AppInput } from "../ui/app-input";
import { AppButton } from "../ui/app-button";
import ExportPopover from "./ExportPopover";
import { notify } from "@/lib/notifications";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";

const INDUSTRY_OPTIONS: IndustryOption[] = [
  { label: "All Industries", value: "all" },
  { label: "SaaS", value: "saas" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Logistics", value: "logistics" },
  { label: "Finance", value: "finance" },
  { label: "Healthcare", value: "healthcare" },
];

const STATUS_OPTIONS: StatusOption[] = [
  { label: "All Status", value: "all" },
  { label: "Connected", value: "connected" },
  { label: "Enriching", value: "enriching" },
  { label: "Disconnected", value: "disconnected" },
];

interface CompanyIntelligenceClientProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export default function CompanyIntelligenceClient({
  breadcrumbs,
}: CompanyIntelligenceClientProps) {
  const { company, isLoading, error } = useCompany();

  const [industry, setIndustry] = useState<Industry>("all");
  const [status, setStatus] = useState<CompanyStatus>("all");
  const componentRef = useRef<HTMLDivElement>(null);

  // ===== SEARCH ===== //
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const searchQuery = searchParams.get("q")?.toLowerCase() ?? "";

  const filteredAllCompanies = useMemo(() => {
    return company.filter((item) => {
      // SEARCH
      const companyName = item.name?.toLowerCase() ?? "";
      const matchesSearch = searchQuery
        ? companyName.includes(searchQuery)
        : true;

      // FILTER BY INDUSTRY
      const matchesIndustry =
        industry === "all"
          ? true
          : (item.industry?.toLowerCase() ?? "") === industry;

      // FILTER BY STATUS
      const matchesStatus =
        status === "all" ? true : (item.status?.toLowerCase() ?? "") === status;

      return matchesSearch && matchesIndustry && matchesStatus;
    });
  }, [company, searchQuery, industry, status]);

  // ===== PAGINATION  ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

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

  const paginatedCompany = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredAllCompanies.slice(start, end);
  }, [filteredAllCompanies, page, rowsPerPage]);

  const columns = [
    { id: "name", label: "Company Name" },
    { id: "industry", label: "Industry" },
    { id: "location", label: "Location" },
    { id: "employees", label: "Employees" },
    { id: "insightScore", label: "Insight Score" },
    { id: "status", label: "Status" },
  ];

  const printableColumns = [
    { header: "Company Name", accessorKey: "name" },
    { header: "Industry", accessorKey: "industry" },
    { header: "Location", accessorKey: "location" },
    { header: "Employees", accessorKey: "employees" },
    { header: "Insight Score", accessorKey: "insightScore" },
    { header: "Status", accessorKey: "status" },
  ];

  const handleExportCSV = () => {
    if (!paginatedCompany || paginatedCompany.length === 0) return notify.error("Error", {
      description: "Company data is empty"
    })
    const headers = columns.map((col) => col.label);
    const keys = columns.map((col) => col.id);

    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const csvContent = [
      headers.join(","),
      ...paginatedCompany.map((item) =>
        keys
          .map((key) => {
            const val = getNestedValue(item, key) || "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "companies_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Company Data Intelligence",
  });

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="All Companies"
        breadcrumbs={
          breadcrumbs || [{ label: "Omnichannel" }, { label: "All Companies" }]
        }
      />

      {/* Stats Card */}
      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyStats />
      </div>

      <div className="mt-6 overflow-auto rounded-lg shadow-lg">
        <div className="flex w-full flex-col-reverse justify-between gap-4 py-6 md:px-4 lg:flex-row lg:items-center">
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:w-auto">
            {/* Filter by Industry */}
            <FilterByIndustry
              INDUSTRY_OPTIONS={INDUSTRY_OPTIONS}
              value={industry}
              onChange={setIndustry}
            />

            {/* Filter by Status */}
            <FilterByStatus
              STATUS_OPTIONS={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />

            {/* Search */}
            <Suspense>
              <AppInput
                placeholder="Search Company"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                isBgWhite
                startIcon={<Search />}
              />
            </Suspense>
          </div>

          <div className="flex w-full gap-3 lg:w-auto lg:justify-end">
            <AppButton variantStyle="primary" startIcon={<Plus />}>
              Add Company
            </AppButton>

            <ExportPopover
              onExportCSV={handleExportCSV}
              onPrint={handlePrint}
            />
          </div>
        </div>

        {/* Table */}
        <CompanyTable
          company={paginatedCompany}
          isLoading={isLoading}
          error={error}
        />

        {/* Pagination */}
        <div className="flex w-full justify-end">
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={company.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>

      <div style={{ display: "none" }}>
        <PrintableTable
          ref={componentRef}
          title="Company Data Intelligence"
          data={paginatedCompany}
          columns={printableColumns}
        />
      </div>
    </div>
  );
}
