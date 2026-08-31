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
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        subtitle: "SEBELUM VS SESUDAH",
        title: "Cara Manual vs SmartSales",
        desc: "Perbandingan pengelolaan prospek kredit dan komunikasi nasabah sebelum dan sesudah memakai SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmart: "Dengan SmartSales",
        rows: [
            {
                aspect: "Data calon debitur",
                manual: "Tersebar di spreadsheet, chat WhatsApp pribadi, dan catatan sales lapangan.",
                smart: "Terpusat di CRM Sales dengan pipeline visual per tahap (prospek, survei, disetujui).",
            },
            {
                aspect: "Pengingat jatuh tempo & tagihan",
                manual: "Diingat manual oleh sales, rawan terlewat saat sales sedang sibuk atau cuti.",
                smart: "Reminder otomatis terkirim via WhatsApp API sesuai jadwal yang diatur.",
            },
            {
                aspect: "Channel komunikasi nasabah",
                manual: "Berpindah-pindah antara WhatsApp pribadi, Instagram, dan Website.",
                smart: "Satu layar Omnichannel dengan WhatsApp Business API resmi perusahaan.",
            },
            {
                aspect: "Keluhan nasabah (kartu hilang, transfer gagal)",
                manual: "Menumpuk di pesan WhatsApp, sering tidak jelas siapa yang menindaklanjuti.",
                smart: "Otomatis jadi tiket terstruktur dengan eskalasi ke divisi terkait dan batas waktu (SLA).",
            },
            {
                aspect: "Riwayat komunikasi saat pergantian staf",
                manual: "Sering hilang karena tersimpan di HP pribadi sales atau CS yang resign.",
                smart: "Tersimpan aman di sistem, tetap bisa diakses meski ada pergantian personel.",
            },
            {
                aspect: "Pemantauan kinerja tim lapangan",
                manual: "Sulit dipantau, laporan kunjungan dikumpulkan manual dari tiap sales.",
                smart: "Terlihat dari satu dashboard analitik yang sama untuk seluruh tim.",
            },
        ],
    },
    en: {
        subtitle: "BEFORE VS AFTER",
        title: "Manual Process vs SmartSales",
        desc: "A comparison of how credit prospects and customer communication are managed before and after using SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmart: "With SmartSales",
        rows: [
            {
                aspect: "Prospective debtor data",
                manual: "Scattered across spreadsheets, personal WhatsApp chats, and field sales notes.",
                smart: "Centralized in CRM Sales with a visual pipeline per stage (prospect, survey, approved).",
            },
            {
                aspect: "Due date & billing reminders",
                manual: "Remembered manually by sales, easily missed when sales is busy or on leave.",
                smart: "Automatic reminders sent via WhatsApp API on a set schedule.",
            },
            {
                aspect: "Customer communication channels",
                manual: "Switching between personal WhatsApp, Instagram, and the website.",
                smart: "One Omnichannel screen using the company's official WhatsApp Business API.",
            },
            {
                aspect: "Customer complaints (lost card, failed transfer)",
                manual: "Pile up in WhatsApp messages, often unclear who is following up.",
                smart: "Automatically becomes a structured ticket, escalated with a clear time limit (SLA).",
            },
            {
                aspect: "Communication history on staff turnover",
                manual: "Often lost because it's stored on the personal phone of resigning sales/CS staff.",
                smart: "Kept safely in the system, still accessible even after personnel changes.",
            },
            {
                aspect: "Field team performance monitoring",
                manual: "Hard to monitor, visit reports collected manually from each salesperson.",
                smart: "Visible from one shared analytics dashboard for the whole team.",
            },
        ],
    },
};

export default function FinanceComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'var(--brand-deep)',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase'
                        }}
                    >
                        {t.subtitle}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: '#111827',
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
                        overflow: 'hidden',
                    }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: 'var(--gradient-brand-h)',
                                }}
                            >
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 0 }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 0 }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 0 }}>
                                    {t.colSmart}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        bgcolor: index % 2 === 0 ? 'white' : 'var(--surface-alt)',
                                        '&:last-child td': { border: 0 },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#111827', verticalAlign: 'top', width: '22%' }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748B', verticalAlign: 'top', width: '39%' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CloseIcon sx={{ color: '#EF4444', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                                            <span>{row.manual}</span>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155', verticalAlign: 'top', width: '39%' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                                            <span>{row.smart}</span>
                                        </Box>
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
