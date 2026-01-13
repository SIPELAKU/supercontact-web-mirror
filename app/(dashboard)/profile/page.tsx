"use client";

import { fetchProfile } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = await getToken();
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
  }, [getToken]);

  if (loading) return <Box p={4}>Loading...</Box>;

  const defaultAvatar = "/assets/Avatar-profile.png";
  
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={4}>
        
        {/* ================= HEADER ================= */}
        {/* Matching the design with a light blue background and a geometric shape */}
        <Card
          sx={{
            p: 4,
            background: "linear-gradient(to right, #E0E7FF, #EEF2FF)",
            position: "relative",
            overflow: "hidden",
            borderRadius: 3,
            boxShadow: 'none',
            border: '1px solid #E0E7FF'
          }}
        >
          <Box zIndex={1} position="relative">
            <Typography variant="h5" fontWeight={700} color="#1E293B">
              Profile
            </Typography>
            <Typography variant="body2" color="#64748B" mt={0.5}>
              Users Profile
            </Typography>
          </Box>

          {/* Geometric Decoration (CSS approximation of the blue triangle) */}
          <Box
            sx={{
              position: "absolute",
              right: 50,
              bottom: -30,
              width: 140,
              height: 140,
              zIndex: 0
            }}
          >
            <Image src="/assets/logo-company.png" alt="" width={140} height={140}/>
          </Box>
        </Card>

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
                    src={profile?.avatar || defaultAvatar} 
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
                      <Typography variant="body2">Administrator</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocationOn fontSize="small" />
                      <Typography variant="body2">{profile?.country || "Location"}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarToday fontSize="small" />
                      <Typography variant="body2">Joined April 2021</Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* Settings Button */}
                <Button  
                   startIcon={<Lock />}
                   onClick={() => router.push('/profile/settings')}
                   sx={{ 
                     textTransform: 'none', 
                     fontWeight: 600,
                     px: 3,
                     borderRadius: 2,
                     bgcolor: "#4F6DF5",
                     color: "white",
                     hover: {
                        bgcolor: "#3f58ce",
                        color: "white",
                     }
                   }}
                >
                  Settings
                </Button>
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
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Full Name:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.fullname || "-"}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Status:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600} color="success.main">Active</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Star sx={{ color: 'text.secondary', fontSize: 20 }} />
                     <Box>
                      <Typography variant="body2" fontWeight={600}>Role:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>Administrator</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box component="span" sx={{ fontSize: 20 }}>🏳️</Box>
                     <Box>
                      <Typography variant="body2" fontWeight={600}>Country:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.country || "-"}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                     <Box component="span" sx={{ fontSize: 20 }}>🌐</Box>
                     <Box>
                      <Typography variant="body2" fontWeight={600}>Language:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.language || "English"}</Typography>
                  </Stack>
                </Stack>
             </Grid>

             {/* CONTACTS */}
             <Grid item xs={12} md={6} lg={4}>
               <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  CONTACTS
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Contact:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.phone || "-"}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Email:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.email || "-"}</Typography>
                  </Stack>
                   <Stack direction="row" spacing={2} alignItems="center">
                    <Box component="span" sx={{ fontSize: 20 }}>💬</Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Skype:</Typography>
                    </Box>
                    <Typography variant="body2">{profile?.skype || "-"}</Typography>
                  </Stack>
                </Stack>
             </Grid>

             {/* TEAMS (Mock Data) */}
             <Grid item xs={12} md={6} lg={4}>
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
             </Grid>
           </Grid>

           <Divider sx={{ my: 4 }} />

           <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={2} sx={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    OVERVIEW
                </Typography>
                <Stack spacing={2}>
                   <Stack direction="row" spacing={2} alignItems="center">
                    <CheckCircle sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Task Compiled:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>John Doe</Typography>
                  </Stack>
                   <Stack direction="row" spacing={2} alignItems="center">
                    <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Connections:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>897</Typography>
                  </Stack>
                   <Stack direction="row" spacing={2} alignItems="center">
                    <Star sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>Projects Compiled:</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={700}>146</Typography>
                  </Stack>
                </Stack>
              </Grid>
           </Grid>

        </Paper>
      </Stack>
    </Box>
  );
}
