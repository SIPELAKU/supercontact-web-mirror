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
}: {
  roleId: string;
}) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <DeleteButton onClick={handleOpen} />

      <DeleteRolesPermissionsModal
        open={open}
        setOpen={setOpen}
        roleId={roleId}
      />
    </>
  );
}
