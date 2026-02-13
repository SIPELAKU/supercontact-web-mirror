"use client";
import { Card, CardHeader, Divider, Typography } from "@mui/material";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ChangeEvent,
  MouseEvent,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import useDepartments, {
  useDepartmentDetail,
  useDepartmentMembers,
} from "../../../lib/hooks/useDepartments";

import {
  AddMemberButton,
  DeleteMembersModal,
  DepartementTableMember,
  DepartmentsCardInfo,
  DepartmentsCardInfoSkeleton,
} from "@/components/organization";
import InputSearch from "@/components/ui/input-search";
import PageHeader from "@/components/ui/page-header";
import Pagination from "@/components/ui/pagination";
import { ExportButton, TableFilterUsers } from "@/components/users";
import { UsersType } from "@/lib/types/Users";
import { AppInput } from "@/components/ui/app-input";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function DetailDepartments() {
  const { id } = useParams() as { id: string };

  const [tableFilter, setTableFilter] = useState<{
    position?: UsersType["position"];
    status?: UsersType["status"];
  }>({});

  // Reset pagination + update search
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

  const searchQuery = searchParams.get("search") ?? "";

  // ===== PAGINATION ===== //
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const { data: departmentResponse, isLoading: isLoadingDept } =
    useDepartmentDetail(id);
  const {
    data: membersResponse,
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    error: errorMembers,
  } = useDepartmentMembers(id, page, rowsPerPage, searchQuery, tableFilter);

  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

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

  const departmentData = departmentResponse?.data;
  const members = useMemo(() => {
    const apiMembers = membersResponse?.data?.members || [];
    return apiMembers.map((member) => ({
      id: member.id,
      fullName: member.fullname,
      email: member.email,
      position: member.position,
      status: member.status.toLowerCase() as any,
      avatar_initial: member.fullname.charAt(0).toUpperCase(),
      id_employee: member.employee_code,
      department_id: id,
    }));
  }, [membersResponse]);

  const handleSelectAll = (checked: boolean, data: any[]) => {
    setSelected(checked ? data.map((u) => u.id) : []);
  };

  const handleSelectOne = (id: any) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (isLoadingDept) {
    return <DepartmentsCardInfoSkeleton />;
  }

  if (!departmentData) {
    return <div>Department not found</div>;
  }

  return (
    <div className="p-8">
      <PageHeader
        title="Organization Structure"
        breadcrumbs={[
          { label: "User Management" },
          { label: "Organization Structure" },
          { label: `Department ${departmentData.department}` },
        ]}
      />

      <div className="my-5 px-4 py-4">
        <Typography component="h1" variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {departmentData.department}
        </Typography>
        <Typography className="text-gray-700">
          Details and members of the {departmentData.department.toLowerCase()}{" "}
          department
        </Typography>
      </div>

      <div className="mb-4 pb-4">
        <DepartmentsCardInfo department={departmentData} />
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
                  <AppInput
                    isBgWhite
                    placeholder="Search User"
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                </Suspense>
              </div>
              {/* <AddMemberButton /> */}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <DepartementTableMember
            data={members}
            selected={selected}
            isLoading={isLoadingMembers}
            error={errorMembers?.message || null}
            actions={{
              onSelectOne: handleSelectOne,
              onSelectAll: handleSelectAll,
              onOpenDelete: () => setOpenDelete(true),
              onDepartmentId: (id: string) => setDepartmentId(id),
              onMemberId: (id: string) => setMemberId(id),
            }}
          />

          <DeleteMembersModal
            open={openDelete}
            setOpen={setOpenDelete}
            departmentId={departmentId!}
            memberId={memberId!}
          />

          <div className="flex justify-end pt-2">
            <Pagination
              page={page}
              rowsPerPage={rowsPerPage}
              count={membersResponse?.data?.total || 0}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
