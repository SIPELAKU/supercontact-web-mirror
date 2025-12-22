'use client';
import BannerDashboard from "@/components/ui/banner-dashboard";
import { Box, Card, Stack, Typography, Button, IconButton, TextField } from "@mui/material";
import { Plus, ChevronRight, Tally1, EllipsisVertical } from "lucide-react";

export default function MailingList() {
  const rows = Array(2).fill({
    subject: "Subject Kampanye",
    status: "Sent",
    date: "11 Nov 2025",
    stat: "1/1",
    author: "Muhammad",
  });

  return (
    <BannerDashboard title="Mailing List" description="this is Mailing List">

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
            minHeight: 150,
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Mailing List
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Dashboard • Mailing List
          </Typography>

          {/* LOGO */}
          <Box
            component="img"
            src="/images/logos/logo3d.png"
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
          <Typography variant="h5" fontWeight={600}>Subjek Kampanye</Typography>

          <Box flexGrow={1} />

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
              <Typography fontSize={15} variant="h5">{row.subject}</Typography>
              <Box flexGrow={1} />
              <Box flexGrow={1} />
              <Box flexGrow={1} />
              <Box flexGrow={1} />


              <Stack justifyContent="end" direction="row" spacing={1}>
                <Typography>Contact 1</Typography>
                <IconButton size="small"><ChevronRight size={18} /></IconButton>
                <IconButton size="small"><Tally1 size={20} /></IconButton>
                <IconButton size="small" color="error"><EllipsisVerticalsize={18} /></IconButton>
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
