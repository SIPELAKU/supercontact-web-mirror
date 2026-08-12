"use client";

import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs SmartSales Omnichannel",
        col1: "Cara Manual",
        col2: "Dengan SmartSales",
        rows: [
            {
                label: "Membalas pesan pelanggan",
                manual: "Buka WhatsApp Web, Instagram, dan Email di tab terpisah secara bergantian",
                smart: "Satu dashboard untuk membalas semua saluran",
            },
            {
                label: "Riwayat percakapan",
                manual: "Tersimpan terpisah di tiap aplikasi atau HP pribadi staf",
                smart: "Tersimpan terpusat, bisa diakses seluruh tim kapan saja",
            },
            {
                label: "Pembagian pesan ke tim",
                manual: "Diteruskan manual lewat grup chat internal",
                smart: "Routing otomatis ke agen CS atau Sales yang tepat",
            },
            {
                label: "Tindak lanjut jadi tiket atau pipeline",
                manual: "Disalin manual ke spreadsheet atau tools lain",
                smart: "Satu klik langsung dari panel chat",
            },
            {
                label: "Balasan di luar jam kerja",
                manual: "Pelanggan menunggu sampai staf online kembali",
                smart: "Auto-reply otomatis menyapa pelanggan",
            },
        ],
        fitTitle: "Apakah Omnichannel Cocok untuk Bisnis Anda?",
        fitYesTitle: "Cocok jika Anda",
        fitYesDesc: "Melayani pelanggan dari lebih dari satu saluran (WhatsApp, Instagram, Email) dan tim Anda sering kewalahan berpindah aplikasi untuk membalas pesan.",
        fitNoTitle: "Belum perlu jika Anda",
        fitNoDesc: "Hanya melayani pelanggan lewat satu saluran dengan volume pesan yang masih sangat sedikit setiap harinya.",
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs SmartSales Omnichannel",
        col1: "Manual Process",
        col2: "With SmartSales",
        rows: [
            {
                label: "Replying to customer messages",
                manual: "Open WhatsApp Web, Instagram, and Email in separate tabs, one by one",
                smart: "One dashboard to reply across all channels",
            },
            {
                label: "Conversation history",
                manual: "Stored separately in each app or on a staff member's personal phone",
                smart: "Stored centrally, accessible to the whole team anytime",
            },
            {
                label: "Distributing messages to the team",
                manual: "Manually forwarded through an internal chat group",
                smart: "Automatic routing to the right CS or Sales agent",
            },
            {
                label: "Following up as a ticket or pipeline",
                manual: "Manually copied into a spreadsheet or another tool",
                smart: "One click directly from the chat panel",
            },
            {
                label: "Replies outside business hours",
                manual: "Customers wait until staff are back online",
                smart: "Auto-reply greets customers instantly",
            },
        ],
        fitTitle: "Is Omnichannel a Fit for Your Business?",
        fitYesTitle: "Good fit if you",
        fitYesDesc: "Serve customers across more than one channel (WhatsApp, Instagram, Email) and your team is often overwhelmed switching apps to reply.",
        fitNoTitle: "Not needed yet if you",
        fitNoDesc: "Only serve customers through a single channel with a very low daily message volume.",
    },
};

export default function OmniComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "white" }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: "center", mb: 6 }}>
                    <Typography variant="overline" sx={{ color: "#597CFF", fontWeight: 700, letterSpacing: 1.5, mb: 2, display: "block" }}>
                        {t.badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: "2rem", md: "2.5rem" }, color: "#0F172A" }}>
                        {t.title}
                    </Typography>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: "20px", overflowX: "auto", mb: 6 }}>
                    <Table sx={{ minWidth: 560 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                <TableCell sx={{ fontWeight: 800, color: "#0F172A" }}></TableCell>
                                <TableCell sx={{ fontWeight: 800, color: "#64748B" }}>{t.col1}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: "#597CFF" }}>{t.col2}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>{row.label}</TableCell>
                                    <TableCell sx={{ color: "#64748B" }}>{row.manual}</TableCell>
                                    <TableCell sx={{ color: "#0F172A", fontWeight: 600 }}>{row.smart}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 3, textAlign: "center", color: "#0F172A" }}>
                    {t.fitTitle}
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3.5, borderRadius: "18px", bgcolor: "#F0FDF4", border: "1px solid #DCFCE7", height: "100%" }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                <CheckCircleIcon sx={{ color: "#22C55E" }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#166534" }}>
                                    {t.fitYesTitle}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.7 }}>
                                {t.fitYesDesc}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3.5, borderRadius: "18px", bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", height: "100%" }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                <InfoIcon sx={{ color: "#64748B" }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#334155" }}>
                                    {t.fitNoTitle}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
                                {t.fitNoDesc}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
