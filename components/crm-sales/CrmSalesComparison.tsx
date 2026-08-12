"use client";

import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs CRM Sales",
        subtitle: "Lihat perbedaan mengelola penjualan dengan spreadsheet atau chat biasa, dibandingkan dengan CRM Sales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colCrm: "CRM Sales",
        rows: [
            {
                aspect: "Pencatatan prospek",
                manual: "Tersebar di spreadsheet, catatan chat, dan memori masing-masing sales",
                crm: "Terpusat dalam satu pipeline yang bisa diakses seluruh tim",
            },
            {
                aspect: "Follow-up ke prospek",
                manual: "Mengandalkan pengingat manual, rawan lupa atau terlewat",
                crm: "Pengingat otomatis untuk setiap tugas follow-up yang dijadwalkan",
            },
            {
                aspect: "Update status deal",
                manual: "Perlu tanya satu per satu ke sales atau menunggu laporan mingguan",
                crm: "Terlihat real-time lewat tampilan Kanban tanpa perlu bertanya",
            },
            {
                aspect: "Laporan performa tim",
                manual: "Direkap manual dari banyak sumber, memakan waktu dan rawan salah",
                crm: "Dashboard analitik otomatis menampilkan konversi dan win/loss",
            },
            {
                aspect: "Riwayat komunikasi",
                manual: "Terpisah antara WhatsApp, email, dan catatan pribadi sales",
                crm: "Riwayat kontak dan pesan WhatsApp tersimpan di satu tempat",
            },
            {
                aspect: "Kolaborasi antar sales",
                manual: "Data milik masing-masing orang, sulit dilanjutkan bila sales berganti",
                crm: "Semua anggota tim melihat data yang sama sehingga transisi lebih mudah",
            },
        ],
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs CRM Sales",
        subtitle: "See the difference between running sales through spreadsheets or plain chat, and running it through CRM Sales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colCrm: "CRM Sales",
        rows: [
            {
                aspect: "Recording prospects",
                manual: "Scattered across spreadsheets, chat threads, and individual memory",
                crm: "Centralized in one pipeline accessible to the whole team",
            },
            {
                aspect: "Following up with prospects",
                manual: "Relies on manual reminders, easy to forget or miss",
                crm: "Automatic reminders for every scheduled follow-up task",
            },
            {
                aspect: "Deal status updates",
                manual: "Requires asking each rep individually or waiting for a weekly report",
                crm: "Visible in real time through the Kanban board, no need to ask around",
            },
            {
                aspect: "Team performance reports",
                manual: "Compiled by hand from multiple sources, slow and error-prone",
                crm: "Automatic analytics dashboard showing conversions and win/loss",
            },
            {
                aspect: "Communication history",
                manual: "Split across WhatsApp, email, and each rep's personal notes",
                crm: "Contact history and WhatsApp messages stored in one place",
            },
            {
                aspect: "Collaboration between reps",
                manual: "Data belongs to each individual, hard to hand over when a rep leaves",
                crm: "Every team member sees the same data, making handovers easier",
            },
        ],
    },
};

export default function CrmSalesComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: '700px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                        }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            mb: 3,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' },
                        }}
                    >
                        {t.subtitle}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden',
                    }}
                >
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3854D6' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', width: '22%' }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CloseIcon fontSize="small" />
                                        {t.colManual}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckIcon fontSize="small" />
                                        {t.colCrm}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:nth-of-type(odd)': { bgcolor: '#FAFAFA' },
                                        '&:last-child td': { border: 0 },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: 'text.primary', verticalAlign: 'top' }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.secondary', verticalAlign: 'top', lineHeight: 1.6 }}>
                                        {row.manual}
                                    </TableCell>
                                    <TableCell sx={{ color: 'text.primary', verticalAlign: 'top', lineHeight: 1.6, fontWeight: 500 }}>
                                        {row.crm}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
        <ClientLogos />
        </>
    );
}
