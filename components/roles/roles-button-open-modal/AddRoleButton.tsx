"use client";

import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const AddRoleModal = dynamic(() => import("../roles-modal/AddRoleModal"), {
  ssr: false,
});

export default function AddRoleButton() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <AppButton onClick={handleOpen} startIcon={<Plus />}>
        Add Role
      </AppButton>

      <AddRoleModal open={open} setOpen={setOpen} />
    </>
  );
}
