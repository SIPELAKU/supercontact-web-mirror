"use client";

import { ChangeEvent, MouseEvent, Suspense, useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CardHeader, Divider, Card } from "@mui/material";
import useDepartments from "@/lib/hooks/useDepartments";
import {
  AddDepartmentsButton,
  DeleteDepartmentsModal,
  DepartementTableFilter,
  DepartmentsTableList,
  EditDepartmentsModal,
} from "@/components/organization";
import { ExportButton } from "@/components/users";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import { DepartmentsType } from "@/lib/types/Departments";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Upload } from "lucide-react";
import ExportPopover from "./ExportPopover";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";

export default function OrganizationClient() {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartmnet] =
    useState<DepartmentsType | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [tableFilter, setTableFilter] = useState<{
    department?: DepartmentsType["department"];
    branch?: DepartmentsType["branch"];
  }>({});

  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  // ===== SEARCH & DEBOUNCE ===== //
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

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // ===== FETCH DATA ===== //
  const { departments, total, isLoading, error } = useDepartments(
    page,
    rowsPerPage,
    searchQuery,
    tableFilter,
  );

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

  const handleSelectAll = (checked: boolean, data: DepartmentsType[]) => {
    setSelected(checked ? data.map((u) => u.id) : []);
  };

  const handleSelectOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const columns = [
    { id: "department", label: "Department" },
    { id: "branch", label: "Branch" },
    { id: "manager", label: "Manager" },
    { id: "manager_code", label: "Manager ID" },
    { id: "member_count", label: "Member Count" },
  ];

  const printableColumns = [
    { header: "Department", accessorKey: "department" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Manager", accessorKey: "manager_name" },
    { header: "Manager ID", accessorKey: "manager_code" },
    { header: "Member Count", accessorKey: "member_count" },
  ];

  const handleExportCSV = () => {
    const headers = columns.map((col) => col.label);
    const keys = columns.map((col) => col.id);

    console.log("departments", departments);

    const csvContent = [
      headers.join(","),
      ...departments.map((item) =>
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
      link.setAttribute("download", "departments_export.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Organization Structure",
  });

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <PageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Organization Structure" },
        ]}
      />
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

        <DepartementTableFilter
          filter={tableFilter}
          onChange={(newFilter) => {
            setTableFilter(newFilter);
            setPage(0);
          }}
        />

        <Divider />

        <div className="px-4 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <ExportPopover onExportCSV={handleExportCSV} onPrint={handlePrint} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div>
                <Suspense>
                  <AppInput
                    placeholder="Search Department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    isBgWhite
                  />
                </Suspense>
              </div>
              <AddDepartmentsButton />
            </div>
          </div>
        </div>

        <div>
          <DepartmentsTableList
            data={departments}
            selected={selected}
            isLoading={isLoading}
            error={error}
            actions={{
              onSelectOne: handleSelectOne,
              onSelectAll: handleSelectAll,
              onOpenEdit: (department) => {
                setSelectedDepartmnet(department);
                setOpenEdit(true);
              },
              onOpenDelete: (department) => {
                setSelectedDepartmnet(department);
                setOpenDelete(true);
              },
            }}
          />
        </div>

        <DeleteDepartmentsModal
          open={openDelete}
          setOpen={setOpenDelete}
          departmentId={selectedDepartment?.id}
        />

        {selectedDepartment && (
          <EditDepartmentsModal
            open={openEdit}
            setOpen={setOpenEdit}
            department={selectedDepartment}
          />
        )}

        <div className="flex justify-end pt-2">
          <Pagination
            page={page}
            rowsPerPage={rowsPerPage}
            count={total}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </Card>

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
