"use client";

import {Input} from "@/components/ui/input";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";

type AddDepartmentDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddMemberDialog({
  open,
  setOpen,
}: AddDepartmentDialogProps) {
  const handleClose = () => setOpen(false);
  const handleSubmit = (e: React.FormEvent) => e.preventDefault();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: "rounded-2xl p-4",
      }}
    >
      {/* HEADER */}

      <DialogTitle>
        <span className="text-xl font-bold text-[#5479EE]">Add Member</span>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          component="p"
          variant="body2"
          className="text-md mt-1 font-semibold text-gray-600"
        >
          Enter the details to add a new Marketing Member
        </Typography>
      </div>

      <Divider />

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-2">
          <div className="grid grid-cols-1 gap-3">

            <div className="relative">
              <label className="text-sm font-medium">Manager</label>

              <div className="relative mt-2">
                <Input placeholder="Search for a member name" className="pl-10" />

                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
                  size={18}
                />
              </div>
            </div>
       
            <div>
              <label className="text-sm font-medium">ID</label>
              <Input placeholder="idads" className="mt-2" disabled/>
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <Input placeholder="role" className="mt-2" disabled/>
            </div>

             <div>
              <label className="text-sm font-medium">Status</label>
              <Input placeholder="status" className="mt-2" disabled/>
            </div>

          </div>
        </DialogContent>

        {/* FOOTER BUTTONS */}
        <DialogActions className="flex justify-end gap-3 px-2 pb-4">
          <Button
            variant="outlined"
            onClick={handleClose}
            className="border-[#D0D5DD] capitalize! text-[#344054]"
            sx={{ borderRadius: "10px", paddingX: "18px" }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            type="submit"
            className="bg-[#5479EE]! text-white capitalize! hover:bg-[#5479EE]/80!"
            sx={{
              borderRadius: "10px",
              paddingX: "22px",
            }}
          >
            Save Memeber
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
