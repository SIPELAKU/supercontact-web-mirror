"use client";

import useRoles from "@/lib/hooks/useRoles";

import { ChangeEvent, MouseEvent, Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import InputSearch from "@/components/ui/input-search";
import { AddPermissionsButton, AddRoleButton, RolesTable } from "@/components/roles";
import PageHeader from "@/components/ui-mui/page-header";
import Pagination from "@/components/ui/pagination";

export default function RolesPage() {
  const { roles, isLoading, error } = useRoles();

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

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;

    return roles.filter((role) => {
      const roleName = role.permissionName?.toLowerCase() ?? "";
      return roleName.includes(searchQuery);
    });
  }, [roles, searchQuery]);

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const handleChangePage = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedRoles = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRoles.slice(start, end);
  }, [filteredRoles, page, rowsPerPage]);

  return (
    <>
      {/* Header */}
      <PageHeader title="Roles & Permissions" breadcrumbs={[{ label: "User Management" }, { label: "Roles & Permissions" }]} />

      <div className="mt-[63px] overflow-auto rounded-xl border">
        <div className="flex min-w-[490px] items-center justify-between px-6 py-4">
          <Suspense>
            <InputSearch placeholder="Search Permissions" handleSearch={handleSearch} searchParams={searchParams} />
          </Suspense>

          <div className="flex flex-row items-center gap-2">
            <AddRoleButton />
            <AddPermissionsButton />
          </div>
        </div>

        {/* Table Data */}
        <RolesTable roles={paginatedRoles} isLoading={isLoading} error={error} />

        {/* Pagination */}
        <div className="flex min-w-[490px] justify-end">
          <Pagination page={page} rowsPerPage={rowsPerPage} count={filteredRoles.length} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
        </div>
      </div>
    </>
  );
}
