"use client";
import { ChangeEvent, useMemo, useState, MouseEvent, Suspense } from "react";
import useDepartments from "../../../lib/hooks/useDepartments";
import { UsersType } from "../../../lib/type/Users";
import { useUsers } from "../../../lib/hooks/useUsers";
import { Card, CardHeader, Divider, Typography } from "@mui/material";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { ExportButton, TableFilterUsers } from "@/components/users";
import {
  DepartmentsCardInfo,
  AddMemberButton,
  DeleteMembersModal,
  DepartementTableMember,
  DepartmentsCardInfoSkeleton,
} from "@/components/organization";
import PageHeader from "@/components/ui-mui/page-header";
import InputSearch from "@/components/ui/input-search";
import Pagination from "@/components/ui/pagination";

export default function DetailDepartments() {
  const { id } = useParams();

  const { departments } = useDepartments();

  const {  isLoading, error } = useUsers();

  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const [tableFilter, setTableFilter] = useState<{
    role?: UsersType["role"];
    status?: UsersType["status"];
  }>({});

  // Reset pagination + update search
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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // search name
      const matchSearch = searchQuery
        ? user.fullName?.toLowerCase().includes(searchQuery)
        : true;

      // role filter
      const matchRole = tableFilter.role
        ? user.role === tableFilter.role
        : true;

      // status filter
      const matchStatus = tableFilter.status
        ? user.status === tableFilter.status
        : true;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, tableFilter]);

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const handleChangePage = (
    event: MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, rowsPerPage]);

  const handleSelectAll = (checked: boolean, data: UsersType[]) => {
    setSelected(checked ? data.map((u) => u.id) : []);
  };

  const handleSelectOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const departmentById = departments?.find((d) => Number(d.id) === Number(id));

  if (!departmentById) {
    return <DepartmentsCardInfoSkeleton />;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Organization Structure" },
          { label: `Department ${departmentById.department_name}` },
        ]}
      />

      <div className="my-5 px-4 py-4">
        <Typography component="h1" variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {departmentById.department_name}
        </Typography>
        <Typography className="text-gray-700">
          Details and members of the{" "}
          {departmentById.department_name.toLowerCase()} department
        </Typography>
      </div>

      <div className="mb-4 pb-4">
        <DepartmentsCardInfo department={departmentById} />
      </div>

      <Card sx={{ borderRadius: 4, padding: 1 }}>
        <CardHeader title="Departments Member List" />

        <TableFilterUsers filter={tableFilter} onChange={setTableFilter} />

        <Divider />

        <div className="px-4 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <ExportButton />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <Suspense>
                  <InputSearch
                    placeholder="Search User"
                    handleSearch={handleSearch}
                    searchParams={searchParams}
                  />
                </Suspense>
              </div>
              <AddMemberButton />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <DepartementTableMember
            data={paginatedUsers}
            selected={selected}
            isLoading={isLoading}
            error={error}
            actions={{
              onSelectOne: handleSelectOne,
              onSelectAll: handleSelectAll,
              onOpenDelete: () => setOpenDelete(true),
            }}
          />

          <DeleteMembersModal open={openDelete} setOpen={setOpenDelete} />

          <div className="flex justify-end pt-2">
            <Pagination
              page={page}
              rowsPerPage={rowsPerPage}
              count={filteredUsers.length}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
