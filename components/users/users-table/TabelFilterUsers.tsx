"use client";

import CardContent from "@mui/material/CardContent";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import type { UsersType } from "../../../lib/type/Users";

export type UserTableFilter = {
  role?: UsersType["role"];
  status?: UsersType["status"];
};

type Props = {
  filter: UserTableFilter;
  onChange: (filter: UserTableFilter) => void;
};

const TableFilterUsers = ({ filter, onChange }: Props) => {
  return (
    <CardContent>
      <Grid container spacing={5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="role-select">Select Role</InputLabel>
            <Select
              labelId="role-select"
              label="Select Role"
              value={filter.role ?? ""}
              onChange={(e) =>
                onChange({
                  ...filter,
                  role: e.target.value || undefined,
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Support Agent">Support Agent</MenuItem>
              <MenuItem value="Frontend Engineer">Frontend Engineer</MenuItem>
              <MenuItem value="HR Generalist">HR Generalist</MenuItem>
              <MenuItem value="Content Specialist">Content Specialist</MenuItem>
              <MenuItem value="Sales Development">Sales Development</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth>
            <InputLabel id="status-select">Select Status</InputLabel>
            <Select
              labelId="status-select"
              label="Select Status"
              value={filter.status ?? ""}
              onChange={(e) =>
                onChange({
                  ...filter,
                  status: e.target.value || undefined,
                })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilterUsers;
