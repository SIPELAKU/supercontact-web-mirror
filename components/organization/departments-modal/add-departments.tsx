"use client";

import { Input } from "@/components/ui/input";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";
import { FormControl, MenuItem, Select } from "@mui/material";

type AddDepartmentDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddDepartmentDialog({
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
        <span className="text-xl font-bold text-[#5479EE]">Add User</span>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          component="p"
          variant="body2"
          className="text-md mt-1 font-semibold text-gray-600"
        >
          Enter the details to add a new department
        </Typography>
      </div>

      <Divider />

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-2">
          <div className="grid grid-cols-1 gap-3">
            {/* Department */}
            <label className="text-sm font-medium">Department</label>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                defaultValue=""
                renderValue={(selected) => {
                  if (selected === "") {
                    return (
                      <span className="text-sm text-gray-400">
                        Select department
                      </span>
                    ); // placeholder
                  }
                  return selected;
                }}
              >
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Sales">Sales</MenuItem>
              </Select>
            </FormControl>

            {/* Employee ID */}
            <div>
              <label className="text-sm font-medium">Branch</label>
              <Input placeholder="e.q Headquarters" className="mt-2" />
            </div>

            <div className="relative">
              <label className="text-sm font-medium">Manager</label>

              <div className="relative mt-2">
                <Input placeholder="Search for a Manager" className="pl-10" />

                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
                  size={18}
                />
              </div>
            </div>
            <div className="pb-3">
              <Typography
                component="p"
                variant="body2"
                className="text-xs font-semibold text-gray-400"
              >
                Assign an existing manager. Their manager ID will be linked
                automatically
              </Typography>
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
            Save Department
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
