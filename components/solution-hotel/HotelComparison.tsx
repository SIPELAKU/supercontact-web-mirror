"use client";

import { Box, Container, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs SmartSales untuk Hotel",
        subtitle: "Begini perbedaan mengelola reservasi kamar, chat tamu, dan komplain layanan sebelum dan sesudah memakai SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmart: "Dengan SmartSales",
        rows: [
            {
                aspect: "Pencatatan reservasi kamar",
                manual: "Dicatat di buku atau spreadsheet terpisah, rawan hilang atau bentrok jadwal",
                smart: "Tercatat otomatis dalam sales pipeline, dari tanya harga, DP, hingga check-in"
            },
            {
                aspect: "Respons pertanyaan tamu di WhatsApp",
                manual: "Bergantung pada HP pribadi resepsionis, berhenti saat staf offline atau ganti shift",
                smart: "WhatsApp Business API resmi, dibalas beberapa admin sekaligus dan tetap aktif di luar jam kerja"
            },
            {
                aspect: "Komplain tamu (AC rusak, handuk, dll)",
                manual: "Pesan komplain mudah terlewat atau tidak diteruskan ke tim terkait",
                smart: "Otomatis menjadi tiket kerja yang ditugaskan ke Housekeeping atau Engineering"
            },
            {
                aspect: "Follow-up pelunasan grup korporat",
                manual: "Mengandalkan ingatan staf sales, rawan lupa menagih sebelum check-in",
                smart: "Pengingat follow-up dijadwalkan otomatis di CRM Sales"
            },
            {
                aspect: "Data reservasi antar properti/cabang",
                manual: "Terpisah per properti, sulit dipantau dari satu tempat",
                smart: "Terorganisir dalam satu sistem multi-tenant untuk seluruh properti"
            },
            {
                aspect: "Histori komunikasi dengan tamu",
                manual: "Hilang jika staf resign atau berganti HP",
                smart: "Tersimpan di server terpusat, tidak bergantung pada perangkat staf tertentu"
            },
        ],
        footnote: "*Perbandingan berdasarkan alur kerja umum tanpa sistem reservasi terpusat, bukan produk kompetitor tertentu."
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs SmartSales for Hotels",
        subtitle: "Here's how managing room reservations, guest chats, and service complaints changes before and after SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmart: "With SmartSales",
        rows: [
            {
                aspect: "Recording room reservations",
                manual: "Written in a notebook or separate spreadsheet, prone to loss or double booking",
                smart: "Recorded automatically in a sales pipeline, from price inquiry, DP, through check-in"
            },
            {
                aspect: "Responding to guests on WhatsApp",
                manual: "Depends on the receptionist's personal phone, stops when staff is offline or off-shift",
                smart: "Official WhatsApp Business API, answered by several admins at once and still active after hours"
            },
            {
                aspect: "Guest complaints (broken AC, towels, etc.)",
                manual: "Complaint messages are easy to miss or fail to reach the right team",
                smart: "Automatically becomes a work ticket assigned to Housekeeping or Engineering"
            },
            {
                aspect: "Corporate group payment follow-up",
                manual: "Relies on the sales staff's memory, easy to forget billing before check-in",
                smart: "Follow-up reminders are scheduled automatically in CRM Sales"
            },
            {
                aspect: "Reservation data across properties",
                manual: "Kept separate per property, hard to monitor from one place",
                smart: "Organized in one multi-tenant system for all properties"
            },
            {
                aspect: "Guest communication history",
                manual: "Lost when staff resign or change phones",
                smart: "Stored on a central server, not tied to any particular staff device"
            },
        ],
        footnote: "*Comparison based on a typical workflow without a centralized reservation system, not any specific competitor product."
    }
};

export default function HotelComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{ color: '#597CFF', fontWeight: 800, letterSpacing: 2, display: 'block' }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            lineHeight: 1.2
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '640px', mx: 'auto' }}>
                        {t.subtitle}
                    </Typography>
                </Stack>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                        overflowX: 'auto'
                    }}
                >
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#0F172A' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', py: 2.5 }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 800, fontSize: '0.9rem', py: 2.5 }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: 'white',
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        py: 2.5,
                                        background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)'
                                    }}
                                >
                                    {t.colSmart}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                        '&:hover': { bgcolor: '#F8FAFC' }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', verticalAlign: 'top' }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748B', fontSize: '0.875rem', verticalAlign: 'top' }}>
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <CancelIcon sx={{ color: '#F87171', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                                            <span>{row.manual}</span>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155', fontSize: '0.875rem', fontWeight: 500, verticalAlign: 'top', bgcolor: '#F5F7FF' }}>
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 18, mt: 0.2, flexShrink: 0 }} />
                                            <span>{row.smart}</span>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#94A3B8', textAlign: 'center' }}>
                    {t.footnote}
                </Typography>
            </Container>
        </Box>
    );
}
