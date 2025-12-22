'use client';
import BannerDashboard from "@/components/ui/banner-dashboard";
import { Box, Card, Stack, Typography, Button, IconButton, TextField } from "@mui/material";
import {
  Plus,
  RefreshCw,
  Search,
  Eye,
  Pencil,
  Trash2,
  ListFilter,
} from "lucide-react";

export default function EmailMarketingDashboard() {
  const rows = Array(8).fill({
    subject: "Info Penting",
    status: "Sent",
    date: "11 Nov 2025",
    stat: "1/1",
    author: "Muhammad",
  });

  return (
    <BannerDashboard title="Email Marketing" description="this is Email Marketing">

      {/* WRAPPER DENGAN WIDTH YANG PAS */}
      <Box
        p={3}
        sx={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >

        {/* HEADER SECTION */}
        <Card
          sx={{
            p: 3,
            backgroundColor: "#e8ecff",
            position: "relative",
            overflow: "hidden",
            minHeight: 150,          // Header height
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Email Marketing
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Dashboard • Email Marketing
          </Typography>

          {/* LOGO */}
          <Box
            component="img"
            src="/assets/logo-company.png"
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

        {/* ACTION BAR */}
        <Stack direction="row" alignItems="center" spacing={2} mt={3}>
          <Button variant="outlined"><ListFilter></ListFilter> Button</Button>

          <TextField
            placeholder="Search..."
            size="small"
            InputProps={{
              startAdornment: <Search size={18} style={{ marginRight: 8 }} />,
            }}
            sx={{ width: 250 }}
          />

          <Box flexGrow={1} />

          <Button variant="outlined" startIcon={<RefreshCw size={18} />}>Refresh</Button>

          <Button variant="contained" startIcon={<Plus size={18} />}>Buat Kampanye</Button>
        </Stack>

        {/* TABLE */}
        <Card sx={{ mt: 3, p: 2 }}>
          {/* HEADER */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 150px 100px 140px 120px",
              fontWeight: 600,
              p: 1,
            }}
          >
            <Typography>Subjek Kampanye</Typography>
            <Typography>Status</Typography>
            <Typography>Tanggal Terkirim</Typography>
            <Typography>Statistik</Typography>
            <Typography>Dibuat Oleh</Typography>
            <Typography>Aksi</Typography>
          </Box>

          {/* ROWS */}
          {rows.map((row, index) => (
            <Box
              key={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 150px 100px 140px 120px",
                p: 1.5,
                borderBottom: "1px solid #eee",
                alignItems: "center",
              }}
            >
              <Typography>{row.subject}</Typography>

              <Box
                sx={{
                  background: "#3ad29f",
                  color: "white",
                  px: 2,
                  py: 0.5,
                  borderRadius: 10,
                  width: "fit-content",
                  fontSize: 13,
                }}
              >
                Sent
              </Box>

              <Typography>{row.date}</Typography>
              <Typography>{row.stat}</Typography>
              <Typography>{row.author}</Typography>

              <Stack direction="row" spacing={1}>
                <IconButton size="small"><Eye size={18} /></IconButton>
                <IconButton size="small"><Pencil size={18} /></IconButton>
                <IconButton size="small" color="error"><Trash2 size={18} /></IconButton>
              </Stack>
            </Box>
          ))}

          {/* Halaman Dashboard */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Typography variant="body2">Rows per page 10 • 1–10 of 266</Typography>
          </Box>
        </Card>
      </Box>
      </BannerDashboard>
  );
}
