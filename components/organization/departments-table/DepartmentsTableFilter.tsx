"use client";

import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import type { DepartmentsType } from "../../../lib/type/Departments";

export type DepartmentTableFilter = {
  department_name?: DepartmentsType["department_name"];
  branch?: DepartmentsType["branch"];
};

type Props = {
  filter: DepartmentTableFilter;
  onChange: (filter: DepartmentTableFilter) => void;
};

const TableFilterDepartment = ({ filter, onChange }: Props) => {
  return (
    <CardContent>
      <Grid container spacing={5}>
        {/* DEPARTMENT */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="department-select">Select Department</InputLabel>
            <Select
              labelId="department-select"
              label="Select Department"
              value={filter.department_name ?? ""}
              onChange={(e) =>
                onChange({
                  ...filter,
                  department_name: e.target.value || undefined,
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Human Resources">Human Resources</MenuItem>
              <MenuItem value="Customer Support">Customer Support</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* BRANCH */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="branch-select">Select Branch</InputLabel>
            <Select
              labelId="branch-select"
              label="Select Branch"
              value={filter.branch ?? ""}
              onChange={(e) =>
                onChange({
                  ...filter,
                  branch: e.target.value || undefined,
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="headquarters">Headquarters</MenuItem>
              <MenuItem value="north">North</MenuItem>
              <MenuItem value="south">South</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilterDepartment;
