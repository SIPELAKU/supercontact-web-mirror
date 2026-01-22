"use client";

import {
    AddDepartmentsButton,
    DeleteDepartmentsModal,
    DepartementTableFilter,
    DepartmentsTableList,
    EditDepartmentsModal,
} from "@/components/organization";
import { CardHeader, Divider } from "@mui/material";
import Card from "@mui/material/Card";
import { ChangeEvent, MouseEvent, Suspense, useMemo, useState } from "react";
import useDepartments from "../../lib/hooks/useDepartments";
import { DepartmentsType } from "../../lib/type/Departments";

import { ExportButton } from "@/components/users";

import InputSearch from "@/components/ui/input-search";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function OrganizationStructurePage() {
  const { departments, isLoading, error } = useDepartments();

  const [selected, setSelected] = useState<number[]>([]);
  const [selectedDepartment, setSelectedDepartmnet] =
    useState<DepartmentsType | null>(null);

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [tableFilter, setTableFilter] = useState<{
    departments_name?: DepartmentsType["department_name"];
    branch?: DepartmentsType["branch"];
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

  const filteredDepartemets = useMemo(() => {
    return departments.filter((department) => {
      // search name
      const matchSearch = searchQuery
        ? department.manager_name?.toLowerCase().includes(searchQuery)
        : true;

      // department filter
      const matchRole = tableFilter.departments_name
        ? department.department_name === tableFilter.departments_name
        : true;

      // branch filter
      const matchStatus = tableFilter.branch
        ? department.branch === tableFilter.branch
        : true;

      return matchSearch && matchRole && matchStatus;
    });
  }, [departments, searchQuery, tableFilter]);

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

  const paginatedDepartments = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredDepartemets.slice(start, end);
  }, [filteredDepartemets, page, rowsPerPage]);

  const handleSelectAll = (checked: boolean, data: DepartmentsType[]) => {
    setSelected(checked ? data.map((u) => u.id) : []);
  };

  const handleSelectOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 p-8">
      <PageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Organization Structure" },
        ]}
      />
      <Card>
        <CardHeader title="Filters" />

        <DepartementTableFilter
          filter={tableFilter}
          onChange={setTableFilter}
        />

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
              <AddDepartmentsButton />
            </div>
          </div>
        </div>

        <div>
          <DepartmentsTableList
            data={paginatedDepartments}
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
              onOpenDelete: () => setOpenDelete(true),
            }}
          />
        </div>

        <DeleteDepartmentsModal open={openDelete} setOpen={setOpenDelete} />

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
            count={filteredDepartemets.length}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </div>
      </Card>
    </div>
  );
}
