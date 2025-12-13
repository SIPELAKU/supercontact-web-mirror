"use client";

import Pagination from "@/components/ui/pagination";
import { Button, FormControl, MenuItem, Select } from "@mui/material";
import { Plus, Upload } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent, MouseEvent, Suspense, useMemo, useState } from "react";

import PageHeader from "@/components/ui-mui/page-header";
import useCompanies from "@/lib/hooks/useCompanies";
import InputSearch from "@/components/ui/input-search";
import { CompanyStats, CompanyTable } from "@/components/omnichannel";

export default function CompaniesPage() {
  const { companies, isLoading, error } = useCompanies();

  const [industry, setIndustry] = useState("");

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
    if (!searchQuery) return companies;

    return companies.filter((company) => {
      const companyName = company.name?.toLowerCase() ?? "";
      return companyName.includes(searchQuery);
    });
  }, [companies, searchQuery]);

  // ===== PAGINATION  ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const handleChangePage = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      {/* Header */}
      <PageHeader title="All Companies" breadcrumbs={[{ label: "Omnichannel" }, { label: "All Companies" }]} />

      {/* Stats Card */}
      <div className="mt-[63px] grid grid-cols-[repeat(auto-fit,minmax(267px,1fr))] gap-5">
        <CompanyStats />
      </div>

      <div className="mt-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-10">
            <FormControl size="small">
              <Select
                displayEmpty
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                renderValue={(selected) => {
                  if (selected === "") {
                    return <span className="text-gray-400">Select Industry</span>;
                  }
                  return selected;
                }}
                className="max-h-[38px]! min-w-[175px]! rounded-md!"
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small">
              <Select
                displayEmpty
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                renderValue={(selected) => {
                  if (selected === "") {
                    return <span className="text-gray-400">Select Status</span>;
                  }
                  return selected;
                }}
                className="max-h-[38px]! min-w-[175px]! rounded-md!"
              >
                <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
              </Select>
            </FormControl>

            <Suspense>
              <InputSearch placeholder="Search Company" handleSearch={handleSearch} searchParams={searchParams} />
            </Suspense>
          </div>

          <div className="flex max-h-[38px] gap-3">
            <Button variant="contained" className="min-w-40! bg-[#5479EE]! pl-2! capitalize! hover:bg-[#5479EE]/80!">
              <Plus className="mr-2 ml-1 h-3.5 w-3.5" /> Add Company
            </Button>

            <Button variant="outlined" className="min-w-[98px]! border-gray-500! text-gray-500! capitalize!">
              <Upload className="mr-2 ml-1 h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <CompanyTable companies={filteredAllCompanies} />

        {/* Pagination */}
        <div className="flex min-w-[490px] justify-end">
          <Pagination page={page} rowsPerPage={rowsPerPage} count={5} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        </div>
      </div>
    </>
  );
}
