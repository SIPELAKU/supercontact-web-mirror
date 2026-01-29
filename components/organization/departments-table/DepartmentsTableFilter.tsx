"use client";

import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import { AppSelect } from "@/components/ui/app-select";
import type { DepartmentsType } from "../../../lib/types/Departments";

export type DepartmentTableFilter = {
  department?: DepartmentsType["department"];
  branch?: DepartmentsType["branch"];
};

type Props = {
  filter: DepartmentTableFilter;
  onChange: (filter: DepartmentTableFilter) => void;
};

const TableFilterDepartment = ({ filter, onChange }: Props) => {
  const departmentOptions = [
    { value: "", label: "All Department" },
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Engineering", label: "Engineering" },
    { value: "Human Resources", label: "Human Resources" },
    { value: "Customer Support", label: "Customer Support" },
  ];

  const branchOptions = [
    { value: "", label: "All Branch" },
    { value: "headquarters", label: "Headquarters" },
    { value: "North", label: "North" },
    { value: "South", label: "South" },
  ];

  return (
    <CardContent sx={{ pt: 0, px: 4, pb: 2 }}>
      <Grid container spacing={3} sx={{ mt: -3 }}>
        {/* DEPARTMENT */}
        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Department"
            value={filter.department ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                department: (e.target.value as string) || undefined,
              })
            }
            options={departmentOptions}
            isBgWhite
          />
        </Grid>

        {/* BRANCH */}
        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Branch"
            value={filter.branch ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                branch: (e.target.value as string) || undefined,
              })
            }
            options={branchOptions}
            isBgWhite
          />
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilterDepartment;
