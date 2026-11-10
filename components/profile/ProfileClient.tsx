"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import { CalendarToday, CheckCircle, Email, LocationOn, Lock, Person, Phone, Star } from "@mui/icons-material";
import { fetchProfile } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { formatJoinedDate } from "@/lib/utils/profileFormat";
import { AppButton } from "../ui/app-button";
import PageHeader from "../ui/page-header";
import { ProfileHeroCard } from "./ProfileHeroCard";
import { ProfileInfoCard } from "./ProfileInfoCard";

const iconSx = { color: "text.secondary", fontSize: 20 };

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

  return (
    <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
      <Stack spacing={4}>
        <PageHeader
          title="Profile"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Profile" }]}
        />

        <ProfileHeroCard
          name={profile?.fullname || "User Name"}
          avatarUrl={profile?.avatar_url || "/assets/Avatar-profile.png"}
          meta={[
            { icon: <Person fontSize="small" />, text: profile?.role || "User" },
            { icon: <LocationOn fontSize="small" />, text: profile?.country || "Location" },
            { icon: <CalendarToday fontSize="small" />, text: formatJoinedDate(profile?.joined_date) },
          ]}
          action={
            <AppButton startIcon={<Lock />} onClick={() => router.push('/profile-user-setting')} variantStyle={"primary"}>
              Settings
            </AppButton>
          }
        />

        <ProfileInfoCard
          sections={[
            {
              heading: "ABOUT",
              rows: [
                { icon: <Person sx={iconSx} />, label: "Full Name", value: profile?.fullname || "-" },
                {
                  icon: <CheckCircle sx={iconSx} />,
                  label: "Status",
                  value: (
                    <Typography variant="body2" fontWeight={600} color="success.main">
                      Active
                    </Typography>
                  ),
                },
                { icon: <Star sx={iconSx} />, label: "Role", value: profile?.role || "User" },
                { icon: "🏳️", label: "Country", value: profile?.country || "-" },
                { icon: "🌐", label: "Language", value: profile?.language || "English" },
              ],
            },
            {
              heading: "CONTACTS",
              rows: [
                { icon: <Phone sx={iconSx} />, label: "Contact", value: profile?.phone || "-" },
                { icon: <Email sx={iconSx} />, label: "Email", value: profile?.email || "-" },
                { icon: "💬", label: "Skype", value: profile?.skype || "-" },
              ],
            },
          ]}
        />
      </Stack>
    </div>
  );
}
