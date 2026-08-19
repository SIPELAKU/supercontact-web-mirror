"use client";

import { useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { Typography } from "@mui/material";

import { useAuth } from "@/lib/context/AuthContext";
import {
  useDepartmentDetail,
  useDepartmentMembers,
  useDeleteMember,
} from "@/lib/hooks/useDepartments";

import {
  AddMemberButton,
  DeleteMembersModal,
  DepartementTableMember as DepartmentsTableMember,
  DepartmentsCardInfo,
  DepartmentsCardInfoSkeleton,
} from "@/components/organization";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { SuperTableState } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";

interface FormattedMember {
  id: string;
  fullName: string;
  email: string;
  position: string;
  status: string;
  avatar_initial: string;
  id_employee: string;
  department_id: string;
}

export default function DetailDepartments() {
  const { id } = useParams() as { id: string };
  const { token } = useAuth();

  // Modal State
  const [openDelete, setOpenDelete] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Table State
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 10 },
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
    sorting: [] as { id: string; desc: boolean }[],
  });

  // Extract filters from SuperTable state
  const positionFilter = tableState.columnFilters
    .find((f) => f.id === "position")?.value as string | undefined;
  const statusFilter = tableState.columnFilters
    .find((f) => f.id === "status")?.value as string | undefined;

  // Server-side sorting: map table column ids to backend field names
  const MEMBER_SORT_KEYS: Record<string, string> = {
    user: "name", // backend member whitelist key for the joined User.fullname
    id_employee: "employee_code",
  };
  const sortParam = tableState.sorting[0];
  const sortByParam = sortParam ? (MEMBER_SORT_KEYS[sortParam.id] ?? sortParam.id) : undefined;
  const sortOrderParam: "asc" | "desc" | undefined = sortParam
    ? (sortParam.desc ? "desc" : "asc")
    : undefined;

  // React Query Hooks
  const { data: departmentResponse, isLoading: isLoadingDept } =
    useDepartmentDetail(id);

  const {
    data: membersResponse,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
  } = useDepartmentMembers(
    id,
    tableState.pagination.pageIndex,
    tableState.pagination.pageSize,
    tableState.globalFilter,
    {
      position: positionFilter || undefined,
      status: statusFilter || undefined,
    },
    sortByParam,
    sortOrderParam
  );

  const deleteMutation = useDeleteMember(id, ""); // memberId is required in hook params for React Query key, but the mutation actually takes args if not supplied in hook or we can just use regular hook. The hook is useDeleteMember(deptId, memberId) which is suboptimal for bulk.
  // Wait, let's look at useDeleteMember implementation.

  const departmentData = departmentResponse?.data;
  const totalItems = membersResponse?.data?.total || 0;

  // Transform Data
  const members = useMemo<FormattedMember[]>(() => {
    const apiMembers = membersResponse?.data?.members || [];
    return apiMembers.map((member) => ({
      id: member.id,
      fullName: member.fullname,
      email: member.email,
      position: member.position,
      status: member.status, // Keep original case for logic, styling handles capitalization
      avatar_initial: member.fullname.charAt(0).toUpperCase(),
      id_employee: member.employee_code,
      department_id: id,
    }));
  }, [membersResponse, id]);

  const handleTableStateChange = useCallback((newState: SuperTableState) => {
    setTableState({
      pagination: {
        pageIndex: newState.pagination.pageIndex,
        pageSize: newState.pagination.pageSize,
      },
      globalFilter: newState.globalFilter,
      columnFilters: (newState.columnFilters || []) as { id: string; value: unknown }[],
      sorting: (newState.sorting || []) as { id: string; desc: boolean }[],
    });
  }, []);

  // Bulk Delete
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    members: FormattedMember[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkDelete = async (
    selectedMembers: FormattedMember[],
    clearSelection: () => void
  ) => {
    setBulkDeleteTarget({ members: selectedMembers, clearSelection });
  };

  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { members: selectedMembers, clearSelection } = bulkDeleteTarget;
    if (!token) return;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const member of selectedMembers) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/departments/${id}/members/${member.id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} member(s) deleted successfully`);
      // Simpan trigeger manual refresh walau tidak pakai useMutation via API call langsung, atau anggap table refetch on close (karena hook tak dirender ulang otomatis)
      // Idealnya reload dengan me-mutate SWR/ReactQuery key
    }
    if (failCount > 0) {
      notify.error(`${failCount} member(s) failed to delete`);
    }

    // We should trigger a refetch here. Just reloading the page is dirty, let the user manually refresh or we can keep it as is.
    // Actually, `useDeleteMember` hook automatically invalidates. Let's look at `useDeleteMember` signature:
    // export function useDeleteMember(departmentId: string, memberId: string)
    // Here we can't easily loop it since it's a hook. Calling native fetch is correct for bulk delete loop.
    if (successCount > 0) {
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Export CSV
  const handleExportRequest = async (params: any): Promise<FormattedMember[]> => {
    if (!token) return [];
    try {
      let allData: FormattedMember[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", "50");

        if (params.currentState?.globalFilter) {
          urlParams.set("search", params.currentState.globalFilter);
        }

        const posFilter = params.currentState?.columnFilters?.find(
          (f: any) => f.id === "position"
        )?.value;
        const statFilter = params.currentState?.columnFilters?.find(
          (f: any) => f.id === "status"
        )?.value;

        if (posFilter) urlParams.set("position", posFilter);
        if (statFilter) urlParams.set("status", statFilter);

        const response = await fetch(
          `/api/proxy/departments/${id}/members?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error("Export failed");

        const data = await response.json();
        const apiMembers = data?.data?.members || [];
        const total = data?.data?.total || 0;

        // Calculate total pages manually since it's missing from response
        totalPages = Math.ceil(total / 50) || 1;

        const formattedPage = apiMembers.map((member: any) => ({
          id: member.id,
          fullName: member.fullname,
          email: member.email,
          position: member.position,
          status: member.status,
          avatar_initial: member.fullname.charAt(0).toUpperCase(),
          id_employee: member.employee_code,
          department_id: id,
        }));

        allData = [...allData, ...formattedPage];
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  if (isLoadingDept) {
    return <DepartmentsCardInfoSkeleton />;
  }

  if (!departmentData) {
    return <div>Department not found</div>;
  }

  return (
    <div className="w-full max-w-full mx-auto space-y-6">
      <SettingsPageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Organization", href: "/settings/organization" },
          { label: `Department ${departmentData.department}` },
        ]}
      />

      <div className="my-5">
        <Typography component="h1" variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {departmentData.department}
        </Typography>
        <Typography className="text-gray-700">
          Details and members of the {departmentData.department.toLowerCase()}{" "}
          department
        </Typography>
      </div>

      <DepartmentsCardInfo department={departmentData} />

      <DepartmentsTableMember
        members={members}
        isLoading={isLoadingMembers}
        isError={isErrorMembers}
        rowCount={totalItems}
        departmentId={id}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onDelete={(deptId, mbId) => {
          setMemberId(mbId);
          setOpenDelete(true);
        }}
        renderTopLeftToolbar={() => (
          <>
            <div className="hidden md:flex">
              <AddMemberButton />
            </div>
            {/* Mobile (blue plus icon w-9 h-9) */}
            <div className="flex md:hidden">
              <button
                onClick={() => {
                  // Internal trigger
                  const addBtn = document.querySelector('[data-testid="add-member-btn"]') as HTMLButtonElement;
                  if (addBtn) addBtn.click();
                }}
                className="flex items-center justify-center w-9 h-9
                           rounded-md bg-[#5479EE] text-white
                           hover:bg-[#3F66E0] transition-colors"
                title="Add Member"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </>
        )}
      />

      {memberId && (
        <DeleteMembersModal
          open={openDelete}
          setOpen={setOpenDelete}
          departmentId={id}
          memberId={memberId}
        />
      )}

      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Remove ${bulkDeleteTarget?.members.length ?? 0} member(s)?`}
        description="The selected members will be removed from this department. This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />
    </div>
  );
}
