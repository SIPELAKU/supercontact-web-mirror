"use client";

import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const AddPermissionsModal = dynamic(
  () => import("../roles-modal/AddPermissionsModal"),
  {
    ssr: false,
  },
);

export default function AddPermissionsButton() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <AppButton onClick={handleOpen} startIcon={<Plus />}>
        Add Permission
      </AppButton>

      <AddPermissionsModal open={open} setOpen={setOpen} />
    </>
  );
}
