"use client";

import {
  ChangeEvent,
  MouseEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useRoles from "@/lib/hooks/useRoles";
import {
  AddPermissionsButton,
  AddRoleButton,
  RolesTable,
} from "@/components/roles";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import { AppInput } from "../ui/app-input";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function RolesClient() {
  // ===== SEARCH ===== //
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, replace, searchParams]);

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchQuery = searchParams.get("search")?.toLowerCase() ?? "";

  const { roles, isLoading, isError } = useRoles(
    page + 1,
    rowsPerPage,
    searchQuery,
  );

  // Set total count when data changes
  useEffect(() => {
    if (roles?.total) {
      setTotalCount(roles.total);
    }
  }, [roles]);

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

  const paginatedRoles = useMemo(() => {
    if (!Array.isArray(roles.roles)) return [];
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return roles.roles.slice(start, end);
  }, [roles.roles, page, rowsPerPage]);

  return (
    <div className="p-6">
      {/* Header */}
      <PageHeader
        title="Roles & Permissions"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Roles & Permissions" },
        ]}
      />

      <div className="mt-[63px] overflow-auto rounded-xl border">
        <div className="flex min-w-[490px] items-center justify-between px-6 py-4">
          <Suspense>
            <AppInput
              placeholder="Search Permissions"
              onChange={(e) => handleSearch(e.target.value)}
              value={searchTerm}
              className="w-[250px]!"
              isBgWhite
            />
          </Suspense>

          <div className="flex flex-row items-center gap-2">
            <AddRoleButton />
            {/* <AddPermissionsButton /> */}
          </div>
        </div>

        {/* Table Data */}
        <RolesTable
          roles={paginatedRoles}
          isLoading={isLoading}
          isError={isError}
        />

        {/* Pagination */}
        <div className="flex min-w-[490px] justify-end">
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={totalCount}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </div>
    </div>
  );
}
