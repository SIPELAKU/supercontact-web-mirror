"use client";

import { ChangeEvent, MouseEvent, Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, Divider } from "@mui/material";
import { useUsers } from "@/lib/hooks/useUsers";
import { UsersType } from "@/lib/types/Users";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import {
  CardStatUsers,
  DeleteUserModal,
  DetailUsersModal,
  EditUsersModal,
  TableFilterUsers,
  TableListUsers,
} from "@/components/users";
import { AppButton } from "../ui/app-button";
import { DownloadIcon, Plus, Upload } from "lucide-react";
import { AppInput } from "../ui/app-input";

export default function UsersClient() {
  const { data: usersResponse, isLoading, error } = useUsers();

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
    const apiUsers = usersResponse?.data?.users || [];

    // Convert API User[] to UsersType[]
    const users: UsersType[] = apiUsers.map((user) => ({
      id: parseInt(user.id),
      fullName: user.fullname,
      email: user.email,
      role: user.role,
      status: "active" as const, // Default status since API doesn't provide it
      avatar_initial: user.fullname.charAt(0).toUpperCase(),
      id_employee: user.id,
    }));

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
  }, [usersResponse?.data?.users, searchQuery, tableFilter]);

  // ===== PAGINATION ===== //
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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="p-8">
      <PageHeader
        title="Manage User"
        breadcrumbs={[{ label: "User Management" }, { label: "Manage User" }]}
      />

      {/* Card Statistik */}
      <CardStatUsers />

      {/* Card Table */}
      <Card
        sx={{
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <CardHeader
          title="Filters"
          titleTypographyProps={{
            variant: "h6",
            sx: { fontWeight: 500, fontSize: "18px" },
          }}
        />

        {/* Filter */}
        <TableFilterUsers filter={tableFilter} onChange={setTableFilter} />

        <Divider />

        {/* Search & Button */}
        <div className="px-4 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <AppButton
              variantStyle="outline"
              color="gray"
              startIcon={<Upload />}
              onClick={() => {}}
            >
              Export
            </AppButton>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <Suspense>
                  {/* <InputSearch
                    placeholder="Search User"
                    handleSearch={handleSearch}
                    searchParams={searchParams}
                  /> */}
                  <AppInput
                    placeholder="Search User"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    isBgWhite
                  />
                </Suspense>
              </div>
              <AppButton
                variantStyle="primary"
                color="primary"
                startIcon={<Plus />}
                onClick={() => {}}
              >
                Add New User
              </AppButton>
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
