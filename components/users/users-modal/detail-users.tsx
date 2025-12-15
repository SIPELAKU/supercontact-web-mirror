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
  DialogActions,
} from "@mui/material";
import type { UsersType } from "../../../lib/type/Users";
import { CircleX } from "lucide-react";

type StatusType = UsersType["status"];

type DetailUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: UsersType;
};

export default function DetailUserDialog({
  user,
  open,
  setOpen,
}: DetailUserDialogProps) {
  const [userData, setUserData] = useState<UsersType | null>(null);

  const handleCLose = () => setOpen(false);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  if (!userData) return <Typography>Loading...</Typography>;

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
      onClose={handleCLose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 3,
        }, }}
    >
      <div className="flex">
        <DialogActions>
          <IconButton
            onClick={handleCLose}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CircleX size={30} className="hover:text-red-500" />
          </IconButton>
        </DialogActions>

        <div>
          <Typography variant="h6" component="h2">
            <span className="font-semibold">User Information</span>
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Details and information about the user
          </Typography>
        </div>
      </div>

      <Divider />

      <DialogContent>
        {/* Profile */}
        <Grid container spacing={1} alignItems="center">
          <div className="py-2">
            <Grid>
              <Typography className="pb-2">Profile Photo</Typography>
              <Avatar
                src="/broken-image.jpg"
                sx={{ width: 78, height: 78, backgroundColor: "#5479EE" }}
              />
            </Grid>
          </div>

          <Grid>
            <Typography variant="subtitle1" className="pt-5">
              {userData.fullName}
            </Typography>
            <Typography variant="subtitle2">{userData.email}</Typography>
          </Grid>
        </Grid>

        {/* Details Grid */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Department
            </Typography>
            <Typography variant="subtitle2">Custommer Support</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Branch
            </Typography>
            <Typography variant="subtitle2">The Branch</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Level
            </Typography>
            <Typography variant="subtitle2">Staff</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Role
            </Typography>
            <Typography variant="subtitle2">{userData.role}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Status
            </Typography>
            <Typography variant="subtitle2">
              {userData.status && badge[userData.status]}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Employee ID
            </Typography>
            <Typography variant="subtitle2">{userData.id_employee}</Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="subtitle2" className="py-2 text-gray-400">
              Member Since
            </Typography>
            <Typography variant="subtitle2"> 2020-12-01</Typography>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
