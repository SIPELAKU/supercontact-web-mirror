"use client";

import { useState, useEffect, JSX } from "react";
import { Input }from "@/components/ui/input";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { Search, Upload } from "lucide-react";
import {
  Avatar,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";

import type { UsersType } from "../../../lib/type/Users";

type StatusType = UsersType["status"];
type UserType = UsersType["role"];
type EditUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UsersType;
};

export default function EditUserDialog({
  open,
  setOpen,
  user,
}: EditUserDialogProps) {
  const handleClose = () => setOpen(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      fullName,
      email,
      department,
      role,
      employeeId,
      status,
    });
    setOpen(false);
  };

  // State untuk form
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [department, setDepartment] = useState<string>("");
  const [role, setRole] = useState<UserType>(user.role);
  const [employeeId, setEmployeeId] = useState(user.id_employee);
  const [status, setStatus] = useState<StatusType>(user.status);

  useEffect(() => {
    setFullName(user.fullName);
    setEmail(user.email);
    setRole(user.role);
    setEmployeeId(user.id_employee);
    setStatus(user.status);
    // department bisa ambil dari user jika ada field
  }, [user]);

  const getStatusColor = (status: Exclude<StatusType, "">) => {
    switch (status) {
      case "active":
        return "text-green-700";
      case "pending":
        return "text-yellow-600";
      case "inactive":
        return "text-gray-600";
    }
  };

  const badge: Record<Exclude<StatusType, "">, JSX.Element> = {
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

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 3,
        }, }}
    >
      <DialogTitle>
        <span className="text-xl font-bold text-[#5479EE]">Edit User</span>
      </DialogTitle>

      <div className="px-6 pb-3">
        <Typography
          component="p"
          variant="body2"
          className="text-md mt-1 font-semibold text-gray-600"
        >
          Update the user’s profile informasion and settings
        </Typography>
      </div>

      <Divider />

      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-6 pt-6">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              placeholder="name@example.com"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* TWO COLUMN GRID */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Department */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Department</label>
              </div>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  renderValue={(selected) =>
                    selected || (
                      <span className="text-sm text-gray-400">
                        Select department
                      </span>
                    )
                  }
                >
                  <MenuItem value="Engineering">Engineering</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Finance">Finance</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                </Select>
              </FormControl>
            </div>
            {/* Branch */}
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
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserType)}
                  renderValue={(selected: UserType) =>
                    selected || (
                      <span className="text-sm text-gray-400">Select Role</span>
                    )
                  }
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

            {/* Status */}
            <div>
              <div className="py-1">
                <label className="text-sm font-medium">Status</label>
              </div>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={status}
                  onChange={(e: SelectChangeEvent) =>
                    setStatus(e.target.value as StatusType)
                  }
                  renderValue={(selected: StatusType) =>
                    selected ? (
                      badge[selected]
                    ) : (
                      <span className="text-sm text-gray-400">
                        Select Status
                      </span>
                    )
                  }
                >
                  <MenuItem value="active">{badge.active}</MenuItem>
                  <MenuItem value="pending">{badge.pending}</MenuItem>
                  <MenuItem value="inactive">{badge.inactive}</MenuItem>
                </Select>
              </FormControl>
            </div>

            {/* Employee ID */}
            <div>
              <label className="text-sm font-medium">Employee ID</label>
              <Input
                placeholder="MKT-000"
                className="mt-2"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              />
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
            className="bg-[#5479EE]!  text-white capitalize! hover:bg-[#5479EE]/80!"
            sx={{ borderRadius: "10px", paddingX: "22px" }}
          >
            Save User
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
