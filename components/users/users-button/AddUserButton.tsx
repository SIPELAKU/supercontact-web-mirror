"use client";

import { Plus } from "lucide-react";
import { Button } from "@mui/material";
import { AddUsersModal } from "@/components/users";
import { useState } from "react";

export default function AddUserButton() {
  const [open, setOpen] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleOpen}
        className="bg-[#5479EE]! capitalize! hover:bg-[#5479EE]/80!"
      >
        <Plus size={14} className="mr-2 h-3 w-4" /> Add New User
      </Button>

      <AddUsersModal open={open} setOpen={setOpen} />
    </div>
  );
}
