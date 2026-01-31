"use client";

import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
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
        <DialogContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Manager
              </label>
              <AppInput
                placeholder="Search for a member name"
                startIcon={<Search size={18} />}
                className="mt-2"
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">ID</label>
              <AppInput
                placeholder="idads"
                className="mt-2"
                disabled
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <AppInput
                placeholder="role"
                className="mt-2"
                disabled
                fullWidth
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <AppInput
                placeholder="status"
                className="mt-2"
                disabled
                fullWidth
              />
            </div>
          </div>
        </DialogContent>

        {/* FOOTER BUTTONS */}
        <DialogActions className="flex justify-end gap-3 px-6 pb-4 pt-2">
          <AppButton variantStyle="outline" color="gray" onClick={handleClose}>
            Cancel
          </AppButton>

          <AppButton variantStyle="primary" type="submit">
            Save Member
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
