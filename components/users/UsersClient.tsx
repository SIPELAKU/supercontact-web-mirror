"use client";

import {
  ChangeEvent,
  MouseEvent,
  Suspense,
  useMemo,
  useState,
  useEffect,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, Divider } from "@mui/material";
import { useManagedUsers } from "@/lib/hooks/useManagedUser";
import { ManageUser } from "@/lib/types/manage-users";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import {
  AddUsersModal,
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
import { useDebounce } from "@/lib/hooks/useDebounce";
import ExportPopover from "./ExportPopover";

export default function UsersClient() {
  const [selectedUser, setSelectedUser] = useState<ManageUser | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const [tableFilter, setTableFilter] = useState<{
    position?: ManageUser["position"];
    status?: ManageUser["status"];
  }>({});

  // Reset pagination + update search
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [totalCount, setTotalCount] = useState<number>(0);

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

    setPage(0);
    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, replace, searchParams]);

  const searchQuery = searchParams.get("search")?.toLowerCase() ?? "";

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useManagedUsers(
    page + 1, // API usually expects 1-indexed page
    rowsPerPage,
    searchQuery,
    tableFilter.position,
    tableFilter.status,
  );

  // Set total count when data changes
  useEffect(() => {
    if (usersResponse?.data?.total) {
      setTotalCount(usersResponse.data.total);
    }
  }, [usersResponse]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredUsers = useMemo(() => {
    const apiUsers = usersResponse?.data?.manage_users || [];

    return apiUsers;
  }, [usersResponse?.data]);

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

  // No more slicing here, data is already paginated from backend
  const displayUsers = filteredUsers;

  const handleSelectAll = (checked: boolean, data: ManageUser[]) => {
    setSelected(checked ? data.map((u) => u.id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const columns = [
    { id: "fullname", label: "User" },
    { id: "email", label: "Email" },
    { id: "position", label: "Position" },
    { id: "employee_code", label: "Employee ID" },
  ];

  const handleExportCSV = () => {
    const headers = columns.map((col) => col.label);
    const keys = columns.map((col) => col.id);

    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((item) =>
        keys
          .map((key) => {
            const val = (item as any)[key] || "";
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
      link.setAttribute("download", "managed_users_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    const printContent = filteredUsers;
    const printWindow = window.open("", "", "height=600,width=800");

    if (printWindow) {
      printWindow.document.write("<html><head><title>Print Managed Users</title>");
      printWindow.document.write(`
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .logo-text { font-size: 24px; font-weight: bold; color: #5479EE; }
          .sub-text { font-size: 14px; color: #666; }
          .divider { border-bottom: 2px solid #eee; margin: 15px 0; }
          .page-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .page-title { font-size: 20px; font-weight: bold; margin: 0; }
          .date { color: #888; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      `);
      printWindow.document.write("</head><body>");
      printWindow.document.write(`
        <div class="header">
          <div class="logo-text">SuperContact <span class="sub-text">(Smart Relationship Management)</span></div>
        </div>
        <div class="divider"></div>
        <div class="page-info">
          <h2 class="page-title">Managed Users</h2>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      `);
      printWindow.document.write("<table>");
      printWindow.document.write(`
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Position</th>
            <th>Employee ID</th>
          </tr>
        </thead>
        <tbody>
      `);

      printContent.forEach((item) => {
        printWindow.document.write(`
          <tr>
            <td>${item.fullname || "-"}</td>
            <td>${item.email || "-"}</td>
            <td>${item.position || "-"}</td>
            <td>${item.employee_code || "-"}</td>
          </tr>
        `);
      });

      printWindow.document.write("</tbody></table>");
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };


  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
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
            <ExportPopover
              onExportCSV={handleExportCSV}
              onPrint={handlePrint}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <Suspense>
                  <AppInput
                    placeholder="Search User"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    isBgWhite
                  />
                </Suspense>
              </div>
              <AppButton
                variantStyle="primary"
                color="primary"
                startIcon={<Plus />}
                onClick={() => setOpenAdd(true)}
              >
                Add New User
              </AppButton>
            </div>
          </div>
        </div>

        <div className="space-y-2 overflow-x-auto">
          <TableListUsers
            data={displayUsers}
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

          <AddUsersModal open={openAdd} setOpen={setOpenAdd} />

          <DeleteUserModal
            open={openDelete}
            setOpen={setOpenDelete}
            managedUserId={selectedUser?.id}
          />

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
              count={totalCount}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
