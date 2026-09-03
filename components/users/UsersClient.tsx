"use client";

import { useRef, useState, useEffect } from "react";
import { Card } from "@mui/material";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import { useManagedUsers, useDeleteManagedUser } from "@/lib/hooks/useManagedUser";
import { ManageUser } from "@/lib/types/manage-users";
import { useAuth } from "@/lib/context/AuthContext";
import {
  AddUsersModal,
  CardStatUsers,
  EditUsersModal,
  TableListUsers,
} from "@/components/users";
import { useRouter } from "next/navigation";

// Fitur SuperTable
import { AppButton } from "@/components/ui/app-button";
import { Plus, Printer } from "lucide-react";
import { SuperTableState } from "@/components/ui/super-table";
import { fetchManagedUsers } from "@/lib/api/manage-users";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

export default function UsersClient() {
  const { token } = useAuth();
  
  // Modals Setup
  const [selectedUser, setSelectedUser] = useState<ManageUser | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // Bulk Delete State & Hook
  const deleteMutation = useDeleteManagedUser();
  const router = useRouter();

  // Ported as-is from the deleted DeleteUserModal (users-modal/delete-users)
  const handleConfirmDelete = async () => {
    if (!selectedUser?.id) {
      notify.error("Please select a user.");
      return;
    }
    if (!token) {
      notify.error("You are not authorized to delete this user.", {
        description: "Please login first.",
      });
      router.push("/login");
      return;
    }
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      notify.success("User deleted successfully");
      setOpenDelete(false);
    } catch (error: any) {
      const message = handleError(error, "Delete Managed User");
      notify.error("Failed to delete user: ", {
        description: message,
      });
    }
  };
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Printing Setup
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Managed Users",
  });

  const [allPositions, setAllPositions] = useState<string[]>([]);

  // SuperTable State Hook
  const [tableState, setTableState] = useState({
    pageIndex: 0,
    pageSize: 25,
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
    sorting: [] as { id: string; desc: boolean }[]
  });

  const handleTableStateChange = (state: SuperTableState) => {
    setTableState({
      pageIndex: state.pagination.pageIndex,
      pageSize: state.pagination.pageSize,
      globalFilter: state.globalFilter,
      columnFilters: state.columnFilters || [],
      sorting: state.sorting || []
    });
  };

  const getFilterValue = (id: string) => {
    const filter = tableState.columnFilters.find(
      (f: { id: string; value: unknown }) => f.id === id
    );
    return filter ? (filter.value as string) : "";
  };

  // Extract variables for API
  const pageParam = tableState.pageIndex + 1; // Backend 1-indexed
  const limitParam = tableState.pageSize;
  const searchParam = tableState.globalFilter || "";
  
  // Extract column filters
  const positionFilter = (() => {
    const val = getFilterValue("position");
    return val && val !== "All" ? val : undefined;
  })();
  const statusFilter = getFilterValue("status") || undefined;

  // Server-side sorting (sort_by/sort_order contract)
  const sortParam = tableState.sorting[0];
  const sortByParam = sortParam?.id;
  const sortOrderParam: "asc" | "desc" | undefined = sortParam
    ? (sortParam.desc ? "desc" : "asc")
    : undefined;

  // React Query Fetcher (Main Table Data)
  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useManagedUsers(pageParam, limitParam, searchParam, positionFilter, statusFilter, sortByParam, sortOrderParam);

  // Error Handling
  useEffect(() => {
    if (isError && error) {
      const message = handleError(error, "Fetch Managed Users");
      notify.error("Failed to load users", { description: message });
    }
  }, [isError, error]);

  const displayUsers = usersResponse?.data?.manage_users || [];
  const totalCount = usersResponse?.data?.total || 0;

  useEffect(() => {
    if (displayUsers && displayUsers.length > 0) {
      const positions = Array.from(
        new Set(displayUsers.map(u => u.position).filter(Boolean))
      );
      setAllPositions(prev => {
        const merged = new Set([...prev, ...positions]);
        return Array.from(merged);
      });
    }
  }, [displayUsers]);

  // Manual API Fetcher for Export Function (Do-While Loop)
  const handleExportRequest = async (params: { format: 'excel' | 'csv' }): Promise<ManageUser[]> => {
    if (!token) throw new Error("No authorization token");
    let allData: ManageUser[] = [];
    let currentPage = 1;
    let totalPages = 1;
    
    // We fetch without arbitrary limit restrictions to export everything reflecting current filters
    do {
      const resp = await fetchManagedUsers(
        token,
        currentPage,
        1000, // Safe large chunk threshold
        searchParam,
        positionFilter,
        statusFilter,
        sortByParam,
        sortOrderParam
      );
      
      if (!resp.success) {
        throw new Error("Failed to fetch page data for export");
      }
      
      allData = [...allData, ...resp.data.manage_users];
      
      // Calculate remaining pages assuming backend limits resp.data.limit per request
      totalPages = Math.ceil(resp.data.total / resp.data.limit);
      currentPage++;
      
    } while (currentPage <= totalPages);
    
    return allData;
  };

  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    users: ManageUser[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkDelete = async (
    selectedUsers: ManageUser[],
    clearSelection: () => void
  ) => {
    setBulkDeleteTarget({ users: selectedUsers, clearSelection });
  };

  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { users: selectedUsers, clearSelection } = bulkDeleteTarget;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    
    for (const user of selectedUsers) {
      try {
        await deleteMutation.mutateAsync(user.id);
        successCount++;
      } catch {
        failCount++;
      }
    }
    
    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} user(s) deleted successfully`);
    }
    if (failCount > 0) {
      notify.error(`${failCount} user(s) failed to delete`);
    }
  };

  const printableColumns = [
    { header: "User", accessorKey: "fullname" },
    { header: "Email", accessorKey: "email" },
    { header: "Position", accessorKey: "position" },
    { header: "Employee ID", accessorKey: "employee_code" },
  ];

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <SettingsPageHeader
        title="Users"
        breadcrumbs={[{ label: "Settings", href: "/settings" }, { label: "Users" }]}
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
        <div className="space-y-2 overflow-x-auto w-full">
          <TableListUsers
            users={displayUsers}
            positionOptions={["All", ...allPositions]}
            isLoading={isLoading}
            isError={isError}
            errorMessage={isError && error ? handleError(error, "Fetch Managed Users") : undefined}
            onRetry={() => refetch()}
            onAdd={() => setOpenAdd(true)}
            rowCount={totalCount}
            onStateChange={handleTableStateChange}
            onExportRequest={handleExportRequest}
            onBulkDelete={handleBulkDelete}
            isBulkDeleting={isBulkDeleting}
            onEdit={(user) => {
              setSelectedUser(user);
              setOpenEdit(true);
            }}
            onDelete={(user) => {
              setSelectedUser(user);
              setOpenDelete(true);
            }}
            renderTopLeftToolbar={() => (
              <>
                {/* Desktop */}
                <div className="hidden md:flex gap-2">
                  <AppButton onClick={() => setOpenAdd(true)}
                    startIcon={<Plus size={16} />}>
                    Add User
                  </AppButton>
                  <AppButton variantStyle="outline" onClick={handlePrint}
                    startIcon={<Printer size={16} />}>
                    Print PDF
                  </AppButton>
                </div>

                {/* Mobile — icon only w-9 h-9 */}
                <div className="flex md:hidden gap-2">
                  <button onClick={() => setOpenAdd(true)}
                    className="flex items-center justify-center w-9 h-9 
                               rounded-md bg-[#5479EE] text-white 
                               hover:bg-[#3F66E0] transition-colors">
                    <Plus size={16} />
                  </button>
                  <button onClick={handlePrint}
                    className="flex items-center justify-center w-9 h-9 
                               rounded-md border border-[#5479EE] 
                               text-[#5479EE] hover:bg-blue-50 
                               transition-colors">
                    <Printer size={16} />
                  </button>
                </div>
              </>
            )}
          />

          <AddUsersModal open={openAdd} setOpen={setOpenAdd} />

          <ConfirmationPopup
            isOpen={openDelete}
            onClose={() => setOpenDelete(false)}
            onConfirm={handleConfirmDelete}
            title="Are you sure you want to delete this user?"
            description="This action is permanent and cannot be undone"
            confirmText="Delete User"
            cancelText="Cancel"
            variant="danger"
            isLoading={deleteMutation.isPending}
          />

          {selectedUser && (
            <EditUsersModal
              open={openEdit}
              setOpen={setOpenEdit}
              user={selectedUser}
            />
          )}

        </div>
      </Card>

      <div style={{ display: "none" }}>
        <PrintableTable
          ref={componentRef}
          title="Managed Users"
          data={displayUsers}
          columns={printableColumns}
        />
      </div>

      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Delete ${bulkDeleteTarget?.users.length ?? 0} user(s)?`}
        description="The selected users will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
