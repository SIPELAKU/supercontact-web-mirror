"use client";

import { useState } from "react";
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

import type { UsersType } from "../../../lib/type/Users";

type StatusType = UsersType["status"];

type AddUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function AddUserDialog({ open, setOpen }: AddUserDialogProps) {
  const handleClose = () => setOpen(false);
  const handleSubmit = (e: React.FormEvent) => e.preventDefault();

  const [status, setStatus] = useState<StatusType>("");

  const getStatusColor = (status: string) => {
    if (status === "active") return "text-green-700";
    if (status === "pending") return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 3,
        },
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
          Fill in the details below to create a new user account
        </Typography>
      </div>

      <Divider />

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6 pt-6">
          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input placeholder="name@example.com" className="mt-2" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Department */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Department</label>
              </div>
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
            </div>

            <div className="relative">
              <label className="text-sm font-medium">Branch</label>

              <div className="relative mt-2">
                <Input placeholder="Search for a Branch" className="pl-10" />

                <Search
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
                  size={18}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Level</label>
              </div>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  defaultValue=""
                  renderValue={(selected) => {
                    if (selected === "") {
                      return (
                        <span className="text-sm text-gray-400">
                          Select Level
                        </span>
                      );
                    }
                    return selected;
                  }}
                >
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Role */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Role</label>
              </div>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  defaultValue=""
                  renderValue={(selected) => {
                    if (selected === "") {
                      return (
                        <span className="text-sm text-gray-400">
                          Select Role
                        </span>
                      );
                    }
                    return selected;
                  }}
                >
                  <MenuItem value="Support Agent">Support Agent</MenuItem>
                  <MenuItem value="Frontend Engineer">
                    Frontend Engineer
                  </MenuItem>
                  <MenuItem value="HR Generalist">HR Generalist</MenuItem>
                  <MenuItem value="Content Specialist">
                    Content Specialist
                  </MenuItem>
                  <MenuItem value="Sales Development">
                    Sales Development
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="py-1">
              <label className="text-sm font-medium">Status</label>
            </div>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                renderValue={(selected: StatusType) => {
                  if (selected === "") {
                    return (
                      <span className="text-sm text-gray-400">
                        Select Status
                      </span>
                    );
                  }

                  // mapping warna + label
                  const badge = {
                    active: (
                      <span
                        className={`rounded-md bg-green-100 px-2 ${getStatusColor("active")}`}
                      >
                        Active
                      </span>
                    ),
                    pending: (
                      <span
                        className={`rounded-md bg-yellow-100 px-2 ${getStatusColor("pending")}`}
                      >
                        Pending
                      </span>
                    ),
                    inactive: (
                      <span
                        className={`rounded-md bg-gray-200 px-2 ${getStatusColor("inactive")}`}
                      >
                        Inactive
                      </span>
                    ),
                  };

                  return badge[selected]; // <-- inilah yang bikin warna tetap muncul
                }}
              >
                <MenuItem disabled value="">
                  <span className="text-sm text-gray-400">Select Status</span>
                </MenuItem>

                <MenuItem value="active">
                  <span
                    className={`rounded-md bg-green-100 px-2 ${getStatusColor("active")}`}
                  >
                    Active
                  </span>
                </MenuItem>

                <MenuItem value="pending">
                  <span
                    className={`rounded-md bg-yellow-100 px-2 ${getStatusColor("pending")}`}
                  >
                    Pending
                  </span>
                </MenuItem>

                <MenuItem value="inactive">
                  <span
                    className={`rounded-md bg-gray-200 px-2 ${getStatusColor("inactive")}`}
                  >
                    Inactive
                  </span>
                </MenuItem>
              </Select>
            </FormControl>
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
            className="bg-[#5479EE]! capitalize! text-white hover:bg-[#5479EE]/80!"
            sx={{
              borderRadius: "10px",
              paddingX: "22px",
            }}
          >
            Save User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
