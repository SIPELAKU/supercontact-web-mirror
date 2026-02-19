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
import { LogOut, Mail, SquareUserRound, Building2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const ProfileDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, userProfile, userRole, userCompany, userSubscription } = useAuth();

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
              width: 320,
              borderRadius: 3,
              p: 2.5,
              boxShadow: "0 4px 25px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        {/* USER HEADER */}
        <Box display="flex" alignItems="flex-start" gap={2} mb={2.5}>
          <Avatar
            src={userProfile?.avatar || userProfile?.avatar_url || undefined}
            sx={{ width: 56, height: 56, bgcolor: "#5479EE", color: "#fff", flexShrink: 0 }}
          >
            {userProfile ? getInitials(userProfile.fullname) : "U"}
          </Avatar>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography fontWeight={700} variant="h6" sx={{ lineHeight: 1.2, mb: 0.5 }}>
              {userProfile ? truncateName(userProfile.fullname, 20) : "Loading..."}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mb={1}>
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 500 }}>
                {userProfile?.role || userRole || "User"}
              </Typography>
              {userSubscription && (
                <Box
                  sx={{
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                    bgcolor: userSubscription.toLowerCase() === 'trial' ? 'warning.light' : 'success.light',
                    color: userSubscription.toLowerCase() === 'trial' ? 'warning.dark' : 'success.dark',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    lineHeight: 1
                  }}
                >
                  {userSubscription}
                </Box>
              )}
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} mt={0.75}>
              <Mail size={16} className="text-gray-500" />
              <Typography variant="body2" sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userProfile?.email || "loading..."}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.5} mt={0.75}>
              <Building2 size={16} className="text-gray-500" />
              <Typography variant="body2" sx={{ color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {userProfile?.company || userCompany || "No Company"}
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