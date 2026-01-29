"use client";

import { JSX, useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import {
  Avatar,
  Typography,
  Divider,
  Dialog,
  IconButton,
  DialogContent,
} from "@mui/material";
import type { ManageUser } from "@/lib/types/manage-users";
import { X } from "lucide-react";

type StatusType = ManageUser["status"];

type DetailUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: ManageUser;
};

export default function DetailUserDialog({
  user,
  open,
  setOpen,
}: DetailUserDialogProps) {
  const [userData, setUserData] = useState<ManageUser | null>(null);

  const handleCLose = () => setOpen(false);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!userData) return <Typography>Loading...</Typography>;

  const badge: Record<Exclude<StatusType, "">, JSX.Element> = {
    active: (
      <span className="rounded-md bg-[#f0fdf4] px-2.5 py-0.5 text-sm font-medium text-[#22c55e]">
        Active
      </span>
    ),
    pending: (
      <span className="rounded-md bg-yellow-50 px-2.5 py-0.5 text-sm font-medium text-yellow-600">
        Pending
      </span>
    ),
    inactive: (
      <span className="rounded-md bg-gray-50 px-2.5 py-0.5 text-sm font-medium text-gray-500">
        Inactive
      </span>
    ),
  };

  return (
    <Dialog
      open={open}
      onClose={handleCLose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      }}
    >
      <div className="relative p-4 pb-0">
        {/* <IconButton
          onClick={handleCLose}
          size="small"
          className="absolute right-0 top-0 transition-colors hover:bg-gray-100"
          sx={{ color: "#94a3b8" }}
        >
          <X size={20} />
        </IconButton> */}

        <div className="mb-4">
          <Typography
            variant="h5"
            className="font-bold text-[#1e293b]"
            sx={{ fontWeight: 700, fontSize: "1.5rem" }}
          >
            User Information
          </Typography>
          <Typography
            variant="body2"
            className="text-[#64748b]"
            sx={{ fontSize: "0.875rem", mt: 0.5 }}
          >
            Details and members of the marketing department
          </Typography>
        </div>
      </div>

      <Divider sx={{ mx: 4, mb: 1, borderColor: "#f1f5f9" }} />

      <DialogContent className="p-4 pt-4">
        {/* Profile Photo Section */}
        <div className="mb-8">
          <Typography
            className="mb-4 text-sm font-semibold text-[#64748b]"
            sx={{ mb: 2 }}
          >
            Profile Photo
          </Typography>
          <div className="flex items-center gap-4">
            <Avatar
              src={userData.fullname || "/broken-image.jpg"}
              sx={{ width: 80, height: 80, backgroundColor: "#5479EE" }}
            />
            <div className="flex flex-col gap-1">
              <Typography
                variant="h6"
                className="font-bold text-[#1e293b]"
                sx={{ fontWeight: 600, fontSize: "1.125rem", lineHeight: 1 }}
              >
                {userData.fullname || "Name1"}
              </Typography>
              <Typography
                variant="body2"
                className="text-[#64748b]"
                sx={{ fontSize: "0.875rem" }}
              >
                {userData.email || "name1@example.com"}
              </Typography>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Department
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              Customer Support
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Branch
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              Headquarters
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Level
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              Staff
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Position
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              Support Agent
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Status
            </Typography>
            <div className="mt-1">
              {userData.status ? badge[userData.status] : badge["active"]}
            </div>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Role Access
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              {userData.position || "Support"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Employee ID
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              {userData.employee_code || "CS -001"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography className="mb-1 text-sm font-medium text-[#94a3b8]">
              Member Since
            </Typography>
            <Typography className="font-semibold text-[#334155]">
              2020-12-01
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
