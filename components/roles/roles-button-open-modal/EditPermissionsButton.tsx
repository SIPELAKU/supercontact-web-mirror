"use client";

import { EditButton } from "@/components/ui/app-action-buttons-table";
import IconButton from "@mui/material/IconButton";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

interface EditPermissionsProps {
  roleId: string;
  roleName: string;
  assignedPermissions: string[];
}

const EditPermissionsDialog = dynamic(
  () => import("../roles-modal/EditPermissionsModal"),
  {
    ssr: false,
  },
);

export default function EditPermissionsButton({
  roleId,
  roleName,
  assignedPermissions,
}: EditPermissionsProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      {/* Button */}
      <EditButton onClick={handleOpen} />

      {/* Dialog */}
      <EditPermissionsDialog
        open={open}
        setOpen={setOpen}
        roleId={roleId}
        initialRoleName={roleName}
        initialPermissions={assignedPermissions}
      />
    </>
  );
}
