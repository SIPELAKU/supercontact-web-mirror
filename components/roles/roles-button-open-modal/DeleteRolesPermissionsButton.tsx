"use client";

import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import dynamic from "next/dynamic";
import { useState } from "react";

const DeleteRolesPermissionsModal = dynamic(
  () => import("../roles-modal/DeleteRolesPermissionsModal"),
  { ssr: false },
);

export default function DeleteRolesPermissionsButton({
  roleId,
  roleName,
}: {
  roleId: string;
  roleName: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <DeleteButton onClick={handleOpen} disabled={roleName === "Staff" || roleName === "Manager" || roleName === "Admin"} customTitle={roleName === "Staff" || roleName === "Manager" || roleName === "Admin" ? "default role" : "Edit Permissions"} />

      <DeleteRolesPermissionsModal
        open={open}
        setOpen={setOpen}
        roleId={roleId}
      />
    </>
  );
}
