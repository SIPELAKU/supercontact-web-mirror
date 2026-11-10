"use client";

import { Box, Grid, Paper, Stack, Typography } from "@mui/material";

export interface ProfileInfoRow {
  icon: React.ReactNode;
  label: string;
  /** Empty values are left out when the card hides them. */
  value: React.ReactNode;
}

export interface ProfileInfoSection {
  heading: string;
  rows: ProfileInfoRow[];
}

interface ProfileInfoCardProps {
  sections: ProfileInfoSection[];
  /** Leave out rows with no value instead of showing them. */
  hideEmpty?: boolean;
  /** "narrow" for a page beside a side menu: sections stack until the screen is very wide. */
  layout?: "wide" | "narrow";
  /** Under the sections, e.g. a bio. */
  children?: React.ReactNode;
}

const isEmpty = (value: React.ReactNode) => value === null || value === undefined || value === "";

// "Personal Information" with its ABOUT / CONTACTS columns. Used by My Profile
// and the Key People profile.
export function ProfileInfoCard({ sections, hideEmpty = false, layout = "wide", children }: ProfileInfoCardProps) {
  const columns = layout === "narrow" ? { xs: 12, xl: 6 } : { xs: 12, md: 6, lg: 4 };
  return (
    <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, boxShadow: "0px 4px 20px rgba(0,0,0,0.05)" }}>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Personal Information
      </Typography>

      <Grid container spacing={4}>
        {sections.map((section) => {
          const rows = hideEmpty ? section.rows.filter((row) => !isEmpty(row.value)) : section.rows;
          if (!rows.length) return null;
          return (
            <Grid item {...columns} key={section.heading}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                fontWeight={600}
                mb={2}
                sx={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}
              >
                {section.heading}
              </Typography>
              <Stack spacing={1.5}>
                {rows.map((row) => (
                  <Stack key={row.label} direction="row" spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ minHeight: 32 }}>
                    <Box sx={{ width: 24, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, mt: { xs: 0.25, sm: 0 } }}>
                      {row.icon}
                    </Box>
                    {/* On a phone the label sits above its value, so the value gets the full width. */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.25, sm: 1.5 }} alignItems={{ xs: "flex-start", sm: "center" }} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: { sm: 100 }, flexShrink: 0 }}>
                        {row.label}:
                      </Typography>
                      <Box sx={{ minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" }}>
                        {typeof row.value === "string" ? (
                          <Typography variant="body2" color="text.secondary">
                            {row.value}
                          </Typography>
                        ) : (
                          row.value
                        )}
                      </Box>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </Grid>
          );
        })}
      </Grid>

      {children}
    </Paper>
  );
}
