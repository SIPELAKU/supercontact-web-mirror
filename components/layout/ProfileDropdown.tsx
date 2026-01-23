'use client'
import { fetchProfile } from "@/lib/api";
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
import { FileCheck, LogOut, Mail, SquareUserRound } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const ProfileDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileData, setProfileData] = useState<{
    fullname: string;
    email: string;
    role?: string;
  } | null>(null);
  const { logout, getToken } = useAuth();

  const open = Boolean(anchorEl);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const response = await fetchProfile(token);
        
        if (response.success && response.data) {
          setProfileData({
            fullname: response.data.fullname || "User",
            email: response.data.email || "user@example.com",
            role: "Administrator" // You can add role to the API response later
          });
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        // Fallback to default values
        setProfileData({
          fullname: "User",
          email: "user@example.com",
          role: "Administrator"
        });
      }
    };

    loadProfile();
  }, []);

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
          src="/assets/profile-icon.png"
          alt="profile"
          sx={{ width: 35, height: 35, bgcolor: "#5479EE", color: "#fff" }}
        >
          {profileData ? getInitials(profileData.fullname) : "U"}
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
            sx={{ width: 48, height: 48, bgcolor: "#5479EE", color: "#fff" }}
          >
            {profileData ? getInitials(profileData.fullname) : "U"}
          </Avatar>

          <Box>
            <Typography fontWeight={700}>
              {profileData ? truncateName(profileData.fullname) : "Loading..."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {profileData?.role || "User"}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <Mail size={16} />
              <Typography variant="body2">
                {profileData?.email || "loading..."}
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

          {/* Item 3 */}
          <Box
            component={Link}
            href="/tasks"
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
              <FileCheck size={22} color="#4c5cff" />
            </Paper>

            <Box>
              <Typography fontWeight={600}>My Tasks</Typography>
              <Typography variant="body2" color="text.secondary">
                To-do & Daily Tasks
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