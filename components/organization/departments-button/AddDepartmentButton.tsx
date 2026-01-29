"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AddDepartmentsModal } from "@/components/organization";
import { AppButton } from "@/components/ui/app-button";

export default function AddDepartmentButton() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);

  return (
    <div>
      <AppButton
        variantStyle="primary"
        color="primary"
        onClick={handleOpen}
        startIcon={<Plus size={14} />}
      >
        Add New Department
      </AppButton>

      <AddDepartmentsModal open={open} setOpen={setOpen} />
    </div>
  );
}
