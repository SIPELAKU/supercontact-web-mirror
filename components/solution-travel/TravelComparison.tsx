"use client";

import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs Dengan SmartSales",
        desc: "Begini bedanya mengelola pemesanan paket dan reschedule tiket sebelum dan sesudah memakai SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmart: "Dengan SmartSales",
        rows: [
            {
                aspect: "Pertanyaan paket dari WhatsApp, Instagram, Facebook",
                manual: "Dibalas satu per satu dari HP masing-masing admin, mudah tertumpuk dan terlewat",
                smart: "Masuk ke satu Unified Inbox, bisa dibalas bersama tanpa berebut ponsel"
            },
            {
                aspect: "Status pemesanan (tanya paket, DP, pelunasan)",
                manual: "Dicatat manual di buku atau Excel, rawan salah update",
                smart: "Terlihat di pipeline visual: Tanya Paket, Proses DP/Visa, Lunas/Berangkat"
            },
            {
                aspect: "Kelengkapan dokumen visa dan paspor",
                manual: "Ditanyakan ulang ke pelanggan karena tidak ada catatan terpusat",
                smart: "Tercatat di profil pemesanan bersama riwayat aktivitas terakhir"
            },
            {
                aspect: "Balasan itinerary, harga promo, syarat pembatalan",
                manual: "Diketik ulang setiap kali ada yang bertanya",
                smart: "Dikirim sekali klik lewat Quick Replies"
            },
            {
                aspect: "Permintaan reschedule atau refund tiket",
                manual: "Bercampur dengan chat promosi harian, mudah terabaikan",
                smart: "Menjadi tiket tersendiri dengan batas waktu (SLA) dan eskalasi ke divisi terkait"
            },
            {
                aspect: "Data pelanggan saat agen resign atau ganti HP",
                manual: "Berisiko hilang karena tersimpan di ponsel pribadi",
                smart: "Tetap tersimpan di sistem CRM, tidak bergantung pada satu orang"
            }
        ],
        note: "*Perbandingan ini menggambarkan alur kerja yang umum terjadi sebelum menggunakan sistem CRM, bukan produk kompetitor tertentu."
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs With SmartSales",
        desc: "Here's the difference in managing package bookings and ticket reschedules before and after using SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmart: "With SmartSales",
        rows: [
            {
                aspect: "Package questions from WhatsApp, Instagram, Facebook",
                manual: "Answered one by one from each admin's personal phone, easy to pile up and miss",
                smart: "Land in one Unified Inbox, answerable by the whole team without fighting over a phone"
            },
            {
                aspect: "Booking status (inquiry, DP, final payment)",
                manual: "Recorded manually in a notebook or spreadsheet, prone to update errors",
                smart: "Visible in a visual pipeline: Package Inquiry, DP/Visa Process, Paid/Departed"
            },
            {
                aspect: "Visa and passport document completeness",
                manual: "Customers get asked again because there's no central record",
                smart: "Logged in the booking profile alongside the latest activity history"
            },
            {
                aspect: "Itinerary, promo pricing, and cancellation term replies",
                manual: "Retyped every time a customer asks",
                smart: "Sent in one click with Quick Replies"
            },
            {
                aspect: "Reschedule or refund requests",
                manual: "Mixed in with daily promotional chats, easy to overlook",
                smart: "Becomes its own ticket with a handling deadline (SLA) and escalation to the right division"
            },
            {
                aspect: "Customer data when an agent leaves or changes phones",
                manual: "At risk of being lost since it lives on a personal phone",
                smart: "Stays stored in the CRM system, not dependent on one person"
            }
        ],
        note: "*This comparison describes a common workflow before adopting a CRM system, not any specific competitor product."
    }
};

export default function TravelComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: '760px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase'
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
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            mb: 2
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.7 }}>
                        {t.desc}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#3854D6' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none' }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                        {t.colManual}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckIcon sx={{ fontSize: 18 }} />
                                        {t.colSmart}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        bgcolor: index % 2 === 0 ? 'white' : '#F8FAFC',
                                        '&:last-child td': { border: 0 }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#111827', verticalAlign: 'top', fontSize: '0.9rem', borderColor: '#E2E8F0' }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#6B7280', verticalAlign: 'top', fontSize: '0.9rem', lineHeight: 1.6, borderColor: '#E2E8F0' }}>
                                        {row.manual}
                                    </TableCell>
                                    <TableCell sx={{ color: '#1E3A8A', verticalAlign: 'top', fontSize: '0.9rem', lineHeight: 1.6, borderColor: '#E2E8F0', fontWeight: 500 }}>
                                        {row.smart}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: '#94A3B8' }}>
                    {t.note}
                </Typography>
            </Container>
        </Box>
        <ClientLogos />
        </>
    );
}
