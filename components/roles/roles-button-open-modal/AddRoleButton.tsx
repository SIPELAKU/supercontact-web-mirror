"use client";

import { Button } from "@mui/material";
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
      <Button onClick={handleOpen} variant="contained" className="bg-[#5479EE]! pl-2! capitalize! hover:bg-[#5479EE]/80!">
        <Plus className="mr-2 ml-1 h-3.5 w-3.5" /> Add Role
      </Button>

      <AddRoleModal open={open} setOpen={setOpen} />
    </>
  );
}
