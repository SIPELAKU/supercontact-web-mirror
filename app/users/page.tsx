"use client";

import { ChangeEvent, Suspense, useMemo, useState, MouseEvent } from "react";

import { UsersType } from "../../lib/type/Users";
import useUsers from "../../lib/hooks/useUsers";

import { Card, CardHeader, Divider } from "@mui/material";
import Pagination from "@/components/ui/pagination";
import PageHeader from "@/components/ui-mui/page-header";
import {
  AddUserButton,
  ExportButton,
  EditUsersModal,
  DeleteUserModal,
  DetailUsersModal,
  TableListUsers,
  CardStatUsers,
  TableFilterUsers,
} from "@/components/users";
import InputSearch from "@/components/ui/input-search";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function UsersManagePage() {
  const { users, isLoading, error } = useUsers();

  const [selectedUser, setSelectedUser] = useState<UsersType | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
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

  return (
    <div className="p-8">
      <PageHeader
        title="Manage User"
        breadcrumbs={[{ label: "User Management" }, { label: "Manage User" }]}
      />

      <div className="my-4 py-5">
        <CardStatUsers />
      </div>

      <Card>
        <CardHeader title="Filters" />

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
              <AddUserButton />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <TableListUsers
            data={paginatedUsers}
            selected={selected}
            isLoading={isLoading}
            error={error}
            actions={{
              onSelectOne: handleSelectOne,
              onSelectAll: handleSelectAll,
              onOpenEdit: (user) => {
                setSelectedUser(user);
                setOpenEdit(true);
              },
              onOpenDetail: (user) => {
                setSelectedUser(user);
                setOpenDetail(true);
              },
              onOpenDelete: () => setOpenDelete(true),
            }}
          />

          <DeleteUserModal open={openDelete} setOpen={setOpenDelete} />

          {selectedUser && (
            <EditUsersModal
              open={openEdit}
              setOpen={setOpenEdit}
              user={selectedUser}
            />
          )}

          {selectedUser && (
            <DetailUsersModal
              open={openDetail}
              setOpen={setOpenDetail}
              user={selectedUser}
            />
          )}

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
