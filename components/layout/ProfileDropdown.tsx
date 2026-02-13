'use client'
import { useAuth } from "@/lib/context/AuthContext";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { LogOut, Mail, SquareUserRound } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const ProfileDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, userProfile, userRole } = useAuth();

  const open = Boolean(anchorEl);

  // Get initials from full name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Truncate long names
  const truncateName = (name: string, maxLength: number = 15) => {
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="profile"
        color="inherit"
        onClick={handleClick}
        sx={{
          ...(open && { color: "primary.main" }),
        }}
      >
        <Avatar
          src={userProfile?.avatar || userProfile?.avatar_url || userProfile?.avatar_initial || "/assets/profile-icon.png"}
          alt="profile"
          sx={{ width: 35, height: 35, bgcolor: "#5479EE", color: "#fff" }}
        >
          {userProfile ? getInitials(userProfile.fullname) : "U"}
        </Avatar>
      </IconButton>

      {/* ================================
          CUSTOM PROFILE DROPDOWN MENU
      ================================== */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              borderRadius: 3,
              p: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        {/* USER HEADER */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            src={userProfile?.avatar || userProfile?.avatar_url || undefined}
            sx={{ width: 48, height: 48, bgcolor: "#5479EE", color: "#fff" }}
          >
            {userProfile ? getInitials(userProfile.fullname) : "U"}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>
              {userProfile ? truncateName(userProfile.fullname) : "Loading..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userProfile?.role || userRole || "User"}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <Mail size={16} />
              <Typography variant="body2">
                {userProfile?.email || "loading..."}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* MENU LIST */}
        <Stack spacing={2}>
          {/* Item 1 */}
          <Box
            component={Link}
            href="/profile"
            onClick={handleClose}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              textDecoration: "none",
              color: "inherit",
              "&:hover": { background: "#f5f7fc" },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e7e9fc",
                borderRadius: 2,
              }}
            >
              <SquareUserRound size={22} color="#4c5cff" />
            </Paper>

            <Box>
              <Typography fontWeight={600}>My Profile</Typography>
              <Typography variant="body2" color="text.secondary">
                Account Settings
              </Typography>
            </Box>
          </Box>

          {/* Item 2 */}
          <Box
            component={Link}
            href="/inbox"
            onClick={handleClose}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 1.5,
              borderRadius: 2,
              textDecoration: "none",
              color: "inherit",
              "&:hover": { background: "#f5f7fc" },
            }}
          >
            <Paper
              elevation={0}
              sx={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e7e9fc",
                borderRadius: 2,
              }}
            >
              <Mail size={22} color="#4c5cff" />
            </Paper>

            <Box>
              <Typography fontWeight={600}>My Inbox</Typography>
              <Typography variant="body2" color="text.secondary">
                Messages & Emails
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* LOGOUT BUTTON */}
        <Button
          onClick={handleLogout}
          variant="outlined"
          fullWidth
          sx={{
            mt: 3,
            textTransform: "none",
            borderRadius: 2,
            color: "primary.main",
            borderColor: "primary.main",
            gap: 1,
          }}
        >
          <LogOut size={18} /> Logout
        </Button>
      </Menu>
    </Box>
  );
};

export default ProfileDropdown;