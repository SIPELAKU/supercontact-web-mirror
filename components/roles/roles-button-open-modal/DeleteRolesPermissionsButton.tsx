"use client";

import { IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
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
      <IconButton onClick={handleOpen}>
        <Trash2 className="h-5 w-4 text-red-500" />
      </IconButton>

      <DeleteRolesPermissionsModal
        open={open}
        setOpen={setOpen}
        roleId={roleId}
      />
    </>
  );
}
