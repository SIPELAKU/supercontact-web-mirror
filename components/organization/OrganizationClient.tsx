"use client";

import { useState, useCallback, useRef } from "react";
import useDepartments, { useBranches } from "@/lib/hooks/useDepartments";
import {
  AddDepartmentsButton,
  AddDepartmentsModal,
  DeleteDepartmentsModal,
  DepartmentsTableList,
  EditDepartmentsModal,
} from "@/components/organization";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { DepartmentsType } from "@/lib/types/Departments";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import { SuperTableState } from "@/components/ui/super-table";
import { Plus, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import { handleError } from "@/lib/utils/errorHandler";
import { notify } from "@/lib/notifications";

export default function OrganizationClient() {
  const { token } = useAuth();

  // Modal state
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentsType | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openAddMobile, setOpenAddMobile] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Table state driven by SuperTable
  const [tableState, setTableState] = useState({
    pagination: { pageIndex: 0, pageSize: 10 },
    globalFilter: "",
    columnFilters: [] as { id: string; value: unknown }[],
    sorting: [] as { id: string; desc: boolean }[],
  });

  // Extract filters from tableState
  const departmentFilter = tableState.columnFilters
    .find((f) => f.id === "department")?.value as string | undefined;
  const branchFilter = tableState.columnFilters
    .find((f) => f.id === "branch")?.value as string | undefined;

  // Server-side sorting (sort_by/sort_order contract). Sortable column ids
  // (department, branch, created_at) match the backend whitelist directly;
  // manager/manager_code/member_count are computed and have sorting disabled.
  const sortParam = tableState.sorting[0];
  const sortByParam = sortParam?.id;
  const sortOrderParam: "asc" | "desc" | undefined = sortParam
    ? (sortParam.desc ? "desc" : "asc")
    : undefined;

  // Fetch departments with React Query
  const { departments, total, isLoading, isError, error, refetch, deleteDepartment } = useDepartments(
    tableState.pagination.pageIndex,
    tableState.pagination.pageSize,
    tableState.globalFilter,
    {
      department: departmentFilter || undefined,
      branch: branchFilter || undefined,
    },
    sortByParam,
    sortOrderParam
  );

  // Fetch branch options for filter dropdown
  const { data: branchesData } = useBranches();
  const branchOptions = branchesData?.data || [];

  // Error notification
  if (isError && error) {
    const message = handleError(error, "Fetching departments");
    // Only notify once via useEffect would be better, but keeping simple
  }

  // Handle SuperTable state changes
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

  // Export request handler — loop pagination
  const handleExportRequest = async (params: any): Promise<DepartmentsType[]> => {
    try {
      let allData: DepartmentsType[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const urlParams = new URLSearchParams();
        urlParams.set("page", String(currentPage));
        urlParams.set("limit", "50");

        if (params.currentState?.globalFilter) {
          urlParams.set("search", params.currentState.globalFilter);
        }

        // Extract department & branch filters from current state
        const deptFilter = params.currentState?.columnFilters
          ?.find((f: any) => f.id === "department")?.value;
        const brFilter = params.currentState?.columnFilters
          ?.find((f: any) => f.id === "branch")?.value;

        if (deptFilter) urlParams.set("department", deptFilter);
        if (brFilter) urlParams.set("branch", brFilter);

        const response = await fetch(
          `/api/proxy/departments?${urlParams.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        const items = data?.data?.departments || [];
        totalPages = data?.data?.total_pages || 1;

        allData = [...allData, ...items];
        currentPage++;
      } while (currentPage <= totalPages);

      return allData;
    } catch (err) {
      console.error("Export error:", err);
      return [];
    }
  };

  // Bulk delete handler
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<{
    departments: DepartmentsType[];
    clearSelection: () => void;
  } | null>(null);

  const handleBulkDelete = async (
    selectedDepts: DepartmentsType[],
    clearSelection: () => void
  ) => {
    setBulkDeleteTarget({ departments: selectedDepts, clearSelection });
  };

  const performBulkDelete = async () => {
    if (!bulkDeleteTarget) return;
    const { departments: selectedDepts, clearSelection } = bulkDeleteTarget;
    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;

    for (const dept of selectedDepts) {
      try {
        await deleteDepartment(dept.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsBulkDeleting(false);
    setBulkDeleteTarget(null);
    clearSelection();

    if (successCount > 0) {
      notify.success(`${successCount} department(s) deleted successfully`);
    }
    if (failCount > 0) {
      notify.error(`${failCount} department(s) failed to delete`);
    }
  };

  // Print PDF
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Organization Structure",
  });

  const printableColumns = [
    { header: "Department", accessorKey: "department" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Manager", accessorKey: "manager_name" },
    { header: "Manager ID", accessorKey: "manager_code" },
    { header: "Member Count", accessorKey: "member_count" },
  ];

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <SettingsPageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Organization" },
        ]}
      />

      <DepartmentsTableList
        departments={departments}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error || undefined}
        onRetry={() => refetch()}
        onAdd={() => setOpenAddMobile(true)}
        rowCount={total}
        branchOptions={branchOptions}
        onStateChange={handleTableStateChange}
        onExportRequest={handleExportRequest}
        onEdit={(department: DepartmentsType) => {
          setSelectedDepartment(department);
          setOpenEdit(true);
        }}
        onDelete={(department: DepartmentsType) => {
          setSelectedDepartment(department);
          setOpenDelete(true);
        }}
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        renderTopLeftToolbar={() => (
          <>
            {/* Desktop */}
            <div className="hidden md:flex gap-2">
              <AddDepartmentsButton />
              <AppButton
                variantStyle="outline"
                color="gray"
                onClick={handlePrint}
                startIcon={<Printer size={16} />}
              >
                Print PDF
              </AppButton>
            </div>

            {/* Mobile — icon only w-9 h-9 */}
            <div className="flex md:hidden gap-2">
              <button
                onClick={() => setOpenAddMobile(true)}
                className="flex items-center justify-center w-9 h-9
                           rounded-md bg-[#5479EE] text-white
                           hover:bg-[#3F66E0] transition-colors"
                title="Add Department"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center w-9 h-9 
                           rounded-md border border-gray-300 text-gray-600 
                           hover:bg-gray-50 transition-colors"
              >
                <Printer size={16} />
              </button>
            </div>
          </>
        )}
      />

      <DeleteDepartmentsModal
        open={openDelete}
        setOpen={setOpenDelete}
        departmentId={selectedDepartment?.id}
      />

      {openAddMobile && (
        <AddDepartmentsModal open={openAddMobile} setOpen={setOpenAddMobile} />
      )}

      <ConfirmationPopup
        isOpen={!!bulkDeleteTarget}
        onClose={() => setBulkDeleteTarget(null)}
        onConfirm={performBulkDelete}
        title={`Delete ${bulkDeleteTarget?.departments.length ?? 0} department(s)?`}
        description="The selected departments will be permanently deleted. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isBulkDeleting}
      />

      {selectedDepartment && (
        <EditDepartmentsModal
          open={openEdit}
          setOpen={setOpenEdit}
          department={selectedDepartment}
        />
      )}

      {/* Hidden printable table */}
      <div style={{ display: "none" }}>
        <PrintableTable
          ref={componentRef}
          title="Organization Structure"
          data={departments}
          columns={printableColumns}
        />
      </div>
    </div>
  );
}
