"use client";

import { Box, Container, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs SmartSales untuk Tim HR",
        subtitle: "Begini perbedaan mengelola keluhan karyawan, rekrutmen, dan pengumuman internal sebelum dan sesudah memakai SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmart: "Dengan SmartSales",
        rows: [
            {
                aspect: "Keluhan & pertanyaan karyawan",
                manual: "Menumpuk di WhatsApp pribadi staf HR, mudah terlewat atau hilang",
                smart: "Otomatis menjadi tiket terlacak di HR Helpdesk"
            },
            {
                aspect: "Eskalasi ke tim terkait",
                manual: "Diteruskan manual lewat chat atau email, sulit dipantau",
                smart: "Tiket bisa dieskalasi ke Payroll, GA, atau Manajemen dalam sistem"
            },
            {
                aspect: "Batas waktu penyelesaian",
                manual: "Tidak ada standar waktu, keluhan bisa menggantung lama",
                smart: "Bisa ditetapkan SLA per kategori tiket"
            },
            {
                aspect: "Data kandidat rekrutmen",
                manual: "Tersebar di email, WhatsApp, dan spreadsheet terpisah",
                smart: "Terpusat dalam satu pipeline rekrutmen drag-and-drop"
            },
            {
                aspect: "Tahapan seleksi kandidat",
                manual: "Dilacak manual, rawan lupa jadwal interview atau follow-up",
                smart: "Terlihat jelas per tahap: Screening, Interview, Offering"
            },
            {
                aspect: "Pengumuman ke seluruh karyawan",
                manual: "Broadcast manual satu per satu, rawan dianggap spam",
                smart: "Broadcast massal via WhatsApp Business API & Email"
            },
        ],
        footnote: "*Perbandingan berdasarkan alur kerja umum tanpa sistem HR terpusat, bukan produk kompetitor tertentu."
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs SmartSales for HR Teams",
        subtitle: "Here's how handling employee complaints, recruitment, and internal announcements changes before and after SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmart: "With SmartSales",
        rows: [
            {
                aspect: "Employee complaints & questions",
                manual: "Pile up in HR staff's personal WhatsApp, easy to miss or lose",
                smart: "Automatically becomes a trackable ticket in HR Helpdesk"
            },
            {
                aspect: "Escalation to relevant teams",
                manual: "Forwarded manually via chat or email, hard to monitor",
                smart: "Tickets can be escalated to Payroll, GA, or Management within the system"
            },
            {
                aspect: "Resolution deadlines",
                manual: "No standard turnaround, complaints can hang indefinitely",
                smart: "SLA can be set per ticket category"
            },
            {
                aspect: "Recruitment candidate data",
                manual: "Scattered across email, WhatsApp, and separate spreadsheets",
                smart: "Centralized in a single drag-and-drop recruitment pipeline"
            },
            {
                aspect: "Candidate selection stages",
                manual: "Tracked manually, easy to forget interview schedules or follow-ups",
                smart: "Clearly visible per stage: Screening, Interview, Offering"
            },
            {
                aspect: "Company-wide announcements",
                manual: "Manual one-by-one broadcasts, risk of being flagged as spam",
                smart: "Mass broadcast via WhatsApp Business API & Email"
            },
        ],
        footnote: "*Comparison based on a typical workflow without a centralized HR system, not any specific competitor product."
    }
};

export default function HRComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{ color: '#6366F1', fontWeight: 800, letterSpacing: 2, display: 'block' }}
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
