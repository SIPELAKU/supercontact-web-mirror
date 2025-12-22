"use client";

import { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Stack,
  Button,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Chip,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

export default function ProfilePage() {
  const [tab, setTab] = useState(0);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Stack spacing={3}>
      {/* ================= HEADER ================= */}
      <Card
        sx={{
          p: 3,
          backgroundColor: "#e8ecff",
          position: "relative",
          overflow: "hidden",
          minHeight: 150,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Profile
        </Typography>

        <Typography variant="body2" color="text.secondary">
          User Profile
        </Typography>

        {/* LOGO */}
        <Box
          component="img"
          src="/assets/logo3d.png"
          alt="logo"
          sx={{
            position: "absolute",
            right: 100,
            top: "60%",
            transform: "translateY(-50%)",
            width: 250,
            opacity: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </Card>

      {/* ================= TABS ================= */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Account" />
        <Tab label="Security" />
      </Tabs>

      {/* ================= ACCOUNT ================= */}
      {tab === 0 && (
        <Card sx={{ p: 4 }}>
          {/* Avatar */}
          <Stack direction="row" spacing={3} alignItems="center" mb={4}>
            <Avatar
              src={avatar ?? "/assets/avatar-example.png"}
              sx={{ width: 80, height: 80 }}
            />

            <Stack spacing={1}>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" component="label">
                  Upload New Photo
                  <input hidden type="file" accept="image/*" onChange={handleUpload} />
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setAvatar(null)}
                >
                  Reset
                </Button>
              </Stack>

              <Typography variant="caption" color="text.secondary">
                Allowed JPG, GIF or PNG. Max size of 800K
              </Typography>
            </Stack>
          </Stack>

          {/* Form */}
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField label="First Name" fullWidth defaultValue="Muhammad" />
              <TextField label="Last Name" fullWidth defaultValue="Saeful" />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField label="Email" fullWidth defaultValue="john.doe@gmail.com" />
              <TextField label="Organisation" fullWidth defaultValue="Pixinvent" />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField label="Phone Number" fullWidth defaultValue="+1 (917) 543-9876" />
              <TextField label="Address" fullWidth defaultValue="123 Main St, New York, NY 10001" />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField label="State" fullWidth defaultValue="New York" />
              <TextField label="Zip Code" fullWidth defaultValue="648391" />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField select label="Country" fullWidth defaultValue="USA">
                <MenuItem value="USA">USA</MenuItem>
                <MenuItem value="Indonesia">Indonesia</MenuItem>
              </TextField>

              <TextField select label="Language" fullWidth>
                <Stack direction="row" spacing={1}>
                  <Chip label="English" />
                  <Chip label="Indonesia" />
                </Stack>
              </TextField>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <TextField
                select
                label="Time Zone"
                fullWidth
                defaultValue="GMT-11"
              >
                <MenuItem value="GMT-11">
                  (GMT-11:00) International Date Line West
                </MenuItem>
              </TextField>

              <TextField select label="Currency" fullWidth defaultValue="USD">
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="IDR">IDR</MenuItem>
              </TextField>
            </Stack>
          </Stack>

          {/* Actions */}
          <Stack direction="row" spacing={2} mt={4}>
            <Button variant="contained">Save Changes</Button>
            <Button variant="outlined" color="inherit">
              Reset
            </Button>
          </Stack>
        </Card>
      )}

      {/* ================= DELETE ACCOUNT ================= */}
      <Card sx={{ p: 4 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Delete Account
        </Typography>

        <FormControlLabel
          control={<Checkbox />}
          label="I confirm my account deactivation"
        />

        <Box mt={2}>
          <Button variant="contained" color="error">
            Deactivate Account
          </Button>
        </Box>
      </Card>
    </Stack>
  );
}
