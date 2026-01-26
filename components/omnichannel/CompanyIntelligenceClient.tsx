"use client";

import { ChangeEvent, MouseEvent, Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import { Plus, Upload } from "lucide-react";
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

  return (
    <div className="p-6">
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
        <div className="flex min-w-[490px] flex-col-reverse lg:flex-row items-center justify-between md:px-4 py-6 gap-5 lg:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-12">
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
              <InputSearch
                placeholder="Search Company"
                handleSearch={handleSearch}
                searchParams={searchParams}
              />
            </Suspense>
          </div>

          <div className="flex max-h-[38px] gap-3">
            <Button
              variant="contained"
              className="min-w-40! bg-[#5479EE]! pl-2! capitalize! hover:bg-[#5479EE]/80!"
            >
              <Plus className="mr-2 ml-1 h-3.5 w-3.5" /> Add Company
            </Button>

            <Button
              variant="outlined"
              className="min-w-[98px]! border-gray-500! text-gray-500! capitalize!"
            >
              <Upload className="mr-2 ml-1 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <CompanyTable
          company={paginatedCompany}
          isLoading={isLoading}
          error={error}
        />

        {/* Pagination */}
        <div className="flex min-w-[490px] justify-end">
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={company.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
