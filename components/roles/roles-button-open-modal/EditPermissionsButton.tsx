"use client";

import IconButton from "@mui/material/IconButton";
import { Pencil } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

interface EditPermissionsProps {
  permission: string;
  assignedTo: string[];
}

const EditPermissionsDialog = dynamic(() => import("../roles-modal/EditPermissionsModal"), {
  ssr: false,
});

export default function EditPermissionsButton({
  permission,
  assignedTo,
}: EditPermissionsProps) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      {/* Button */}
      <IconButton
        onClick={handleOpen}
        className="text-[#5479EE] hover:text-[#5479EE]/80"
        size="small"
      >
        <Pencil className="h-5 w-4" />
      </IconButton>

      {/* Dialog */}
      <EditPermissionsDialog
        open={open}
        setOpen={setOpen}
        permission={permission}
        assignedTo={assignedTo}
      />
    </>
  );
}
