"use client";

import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";

export interface ProfileMeta {
  icon: React.ReactNode;
  text: string;
}

interface ProfileHeroCardProps {
  name: string;
  avatarUrl?: string | null;
  /** Shown when there is no photo, e.g. initials. */
  avatarFallback?: React.ReactNode;
  /** Next to the name, e.g. an online dot. */
  nameAdornment?: React.ReactNode;
  meta: ProfileMeta[];
  /** Right side, e.g. the Settings button on My Profile. */
  action?: React.ReactNode;
}

// The cover banner with photo, name and one line of facts. Used by My Profile
// and the Key People profile, so both always look the same.
export function ProfileHeroCard({ name, avatarUrl, avatarFallback, nameAdornment, meta, action }: ProfileHeroCardProps) {
  return (
    <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
      <Box
        sx={{
          height: { xs: 150, md: 200 },
          backgroundImage: "url('/assets/bg-cover-profile.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, mt: -6 }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "center", md: "flex-end" }} spacing={3}>
          <Box sx={{ p: 0.5, bgcolor: "white", borderRadius: 3, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
            <Avatar src={avatarUrl || undefined} variant="rounded" sx={{ width: 120, height: 120, borderRadius: 2, fontSize: 40 }}>
              {avatarFallback}
            </Avatar>
          </Box>

          {/* The padding keeps the name below the banner even when the facts wrap. */}
          <Box flex={1} minWidth={0} textAlign={{ xs: "center", md: "left" }} sx={{ pt: { md: 7 } }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: "center", md: "flex-start" }}>
              <Typography variant="h5" fontWeight={700}>
                {name}
              </Typography>
              {nameAdornment}
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              columnGap={3}
              rowGap={1}
              flexWrap="wrap"
              mt={1}
              justifyContent={{ xs: "center", md: "flex-start" }}
              alignItems={{ xs: "center", sm: "flex-start" }}
              color="text.secondary"
            >
              {meta.map((item) => (
                <Stack key={item.text} direction="row" spacing={1} alignItems="center" sx={{ whiteSpace: "nowrap" }}>
                  {item.icon}
                  <Typography variant="body2">{item.text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>

          {action}
        </Stack>
      </Box>
    </Paper>
  );
}
