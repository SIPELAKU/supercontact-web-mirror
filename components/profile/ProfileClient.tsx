"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import {
  CalendarToday,
  CheckCircle,
  Email,
  LocationOn,
  Lock,
  Person,
  Phone,
  Star
} from "@mui/icons-material";
import Image from "next/image";
import { fetchProfile } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { AppButton } from "../ui/app-button";
import PageHeader from "../ui/page-header";

export default function ProfileClient() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No authentication token');
        const res = await fetchProfile(token);
        if (res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <Box p={4}>Loading...</Box>;

  const defaultAvatar = "/assets/Avatar-profile.png";

  const formatJoinedDate = (dateString: string) => {
    if (!dateString) return "Joined -";
    try {
      const date = new Date(dateString);
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `Joined ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return "Joined -";
    }
  };

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <Stack spacing={4}>

        {/* ================= HEADER ================= */}
        <PageHeader
          title="Profile"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]}
        />

        {/* ================= PROFILE COVER & USER CARD ================= */}
        <Paper
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0px 4px 20px rgba(0,0,0,0.05)"
          }}
        >
          {/* Cover Image Area */}
          <Box
            sx={{
              height: { xs: 150, md: 200 },
              backgroundImage: "url('/assets/bg-cover-profile.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <Box sx={{ px: 4, pb: 4, mt: -6 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'center', md: 'flex-end' }}
              spacing={3}
            >
              {/* Avatar */}
              <Box
                sx={{
                  p: 0.5,
                  bgcolor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Avatar
                  src={profile?.avatar_url || defaultAvatar}
                  variant="rounded"
                  sx={{ width: 120, height: 120, borderRadius: 2 }}
                />
              </Box>

              {/* User Info */}
              <Box flex={1} textAlign={{ xs: 'center', md: 'left' }}>
                <Typography variant="h5" fontWeight={700}>
                  {profile?.fullname || "User Name"}
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 3 }}
                  mt={1}
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  color="text.secondary"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person fontSize="small" />
                    <Typography variant="body2">{profile?.role || "User"}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">{profile?.country || "Location"}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">{formatJoinedDate(profile?.joined_date)}</Typography>
                  </Stack>
                </Stack>
              </Box>

              {/* Settings Button */}
              <AppButton
                startIcon={<Lock />}
                onClick={() => router.push('/profile-user-setting')}
                variantStyle={"primary"}
              >
                Settings
              </AppButton>
            </Stack>
          </Box>
        </Paper>

        {/* ================= PERSONAL INFORMATION ================= */}
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
          <Typography variant="h6" fontWeight={700} mb={3}>
            Personal Information
          </Typography>

          <Grid container spacing={4}>
            {/* ABOUT */}
            <Grid item xs={12} md={6} lg={4}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                ABOUT
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Full Name:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.fullname || "-"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Status:</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">Active</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Star sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Role:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.role || "User"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏳️</Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Country:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.country || "-"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🌐</Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Language:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.language || "English"}</Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* CONTACTS */}
            <Grid item xs={12} md={6} lg={4}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                CONTACTS
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Contact:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.phone || "-"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Email:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.email || "-"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 32 }}>
                  <Box sx={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💬</Box>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 100 }}>Skype:</Typography>
                  <Typography variant="body2" color="text.secondary">{profile?.skype || "-"}</Typography>
                </Stack>
              </Stack>
            </Grid>

            {/* TEAMS (Mock Data) */}
            {/* <Grid item xs={12} md={6} lg={4}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                TEAMS
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.primary">Backend Developer</Typography>
                  <Typography variant="body2" color="text.secondary">(126 Members)</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="body2" color="text.primary">React Developer</Typography>
                  <Typography variant="body2" color="text.secondary">(98 Members)</Typography>
                </Stack>
              </Stack>
            </Grid> */}
          </Grid>

          {/* <Divider sx={{ my: 4 }} />

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                OVERVIEW
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CheckCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Projects Compiled:</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{profile?.projects_compiled || 0}</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>Connections:</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{profile?.connections_count || 0}</Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid> */}

        </Paper>
      </Stack>
    </div>
  );
}
