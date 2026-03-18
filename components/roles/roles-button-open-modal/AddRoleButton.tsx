"use client";

import { AppButton } from "@/components/ui/app-button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";

const AddRoleModal = dynamic(() => import("../roles-modal/AddRoleModal"), {
  ssr: false,
});

interface AddRoleButtonProps {
  hideLabelOnMobile?: boolean;
}

export default function AddRoleButton({ hideLabelOnMobile }: AddRoleButtonProps = {}) {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <div className={hideLabelOnMobile ? "hidden md:block" : "block"}>
        <AppButton onClick={handleOpen} startIcon={<Plus size={18} />}>
          Add Role
        </AppButton>
      </div>

      {hideLabelOnMobile && (
        <div className="block md:hidden">
          <button
            onClick={handleOpen}
            className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      {open && (
        <AddRoleModal open={open} setOpen={setOpen} />
      )}
    </>
  );
}
