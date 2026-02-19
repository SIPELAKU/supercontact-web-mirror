"use client";

import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";

import { AppSelect } from "@/components/ui/app-select";
import type { ManageUser } from "@/lib/types/manage-users";

export type UserTableFilter = {
  position?: ManageUser["position"];
  status?: ManageUser["status"];
};

type Props = {
  filter: UserTableFilter;
  onChange: (filter: UserTableFilter) => void;
};

const TableFilterUsers = ({ filter, onChange }: Props) => {
  const positionOptions = [
    { value: "", label: "All Position" },
    { value: "Brand Manager", label: "Brand Manager" },
    { value: "Content writer", label: "Content writer" },
    { value: "Performance Marketing", label: "Performance Marketing" },
    { value: "Marketing Coordinator", label: "Marketing Coordinator" },
    { value: "SEO specialist", label: "SEO specialist" },
    { value: "Sales Manager", label: "Sales Manager" },
    { value: "Business Development", label: "Business Development" },
    { value: "Sales Executive", label: "Sales Executive" },
    { value: "Account Manager", label: "Account Manager" },
    { value: "CS Manager", label: "CS Manager" },
    { value: "CS Representative", label: "CS Representative" },
    { value: "HR Manager", label: "HR Manager" },
    { value: "HR Generalist", label: "HR Generalist" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Pending", label: "Pending" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  return (
    <CardContent sx={{ pt: 0, px: 4, pb: 3 }}>
      <Grid container spacing={3} sx={{ mt: -3 }}>
        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Position"
            value={filter.position ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                position: (e.target.value as string) || undefined,
              })
            }
            options={positionOptions}
            isBgWhite
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <AppSelect
            placeholder="Select Status"
            value={filter.status ?? ""}
            onChange={(e) =>
              onChange({
                ...filter,
                status: (e.target.value as ManageUser["status"]) || undefined,
              })
            }
            options={statusOptions}
            isBgWhite
          />
        </Grid>
      </Grid>
    </CardContent>
  );
};

export default TableFilterUsers;
