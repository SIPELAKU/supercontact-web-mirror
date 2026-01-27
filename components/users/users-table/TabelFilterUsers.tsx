"use client";

import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { AppSelect } from "@/components/ui/app-select";
import type { UsersType } from "@/lib/types/Users";

export type UserTableFilter = {
  role?: UsersType["role"];
  status?: UsersType["status"];
};

type Props = {
  filter: UserTableFilter;
  onChange: (filter: UserTableFilter) => void;
};

const TableFilterUsers = ({ filter, onChange }: Props) => {
  const roleOptions = [
    { value: "", label: "All Position" },
    { value: "Support Agent", label: "Support Agent" },
    { value: "Frontend Engineer", label: "Frontend Engineer" },
    { value: "HR Generalist", label: "HR Generalist" },
    { value: "Content Specialist", label: "Content Specialist" },
    { value: "Sales Development", label: "Sales Development" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <CardContent sx={{ pt: 0, px: 4, pb: 3 }}>
      <Grid container spacing={3} sx={{ mt: -3 }}>
        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Position"
            value={filter.role ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                role: (e.target.value as string) || undefined,
              })
            }
            options={roleOptions}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Status"
            value={filter.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                status: (e.target.value as UsersType["status"]) || undefined,
              })
            }
            options={statusOptions}
          />
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilterUsers;
