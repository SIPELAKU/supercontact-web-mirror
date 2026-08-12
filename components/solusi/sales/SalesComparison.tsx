"use client";

import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from '@/components/ui/ClientLogos';

const COPY = {
    id: {
        badge: 'Perbandingan',
        title: 'Cara Manual vs SmartSales',
        subtitle: 'Perbandingan cara kerja tim sales yang masih mengandalkan spreadsheet dan catatan manual dengan tim yang sudah pakai SmartSales.',
        colAspect: 'Aspek',
        colManual: 'Cara Manual',
        colSmartSales: 'Dengan SmartSales',
        rows: [
            { aspect: 'Status prospek', manual: 'Tersebar di spreadsheet, chat, dan catatan pribadi masing-masing sales', smart: 'Terlihat dalam satu pipeline yang sama untuk seluruh tim' },
            { aspect: 'Follow-up pelanggan', manual: 'Mengandalkan ingatan atau pengingat manual di HP pribadi', smart: 'Pengingat follow-up otomatis muncul di sistem' },
            { aspect: 'Riwayat percakapan WhatsApp', manual: 'Tersimpan di HP masing-masing sales, hilang saat pergantian tim', smart: 'Tercatat di kartu prospek, terhubung ke WhatsApp Business API' },
            { aspect: 'Laporan ke atasan', manual: 'Disusun manual, sering telat atau tidak lengkap', smart: 'Sales manager melihat langsung dari dashboard pipeline' },
            { aspect: 'Serah terima prospek', manual: 'Rawan hilang saat sales resign atau pindah tim', smart: 'Data tetap tersimpan di sistem perusahaan, tinggal dialihkan' },
            { aspect: 'Akses data', manual: 'Tidak ada batasan jelas siapa boleh lihat data siapa', smart: 'Hak akses diatur per peran, sesuai kebijakan perusahaan' },
        ],
    },
    en: {
        badge: 'Comparison',
        title: 'Manual Process vs SmartSales',
        subtitle: 'How sales teams still relying on spreadsheets and manual notes compare to teams already using SmartSales.',
        colAspect: 'Aspect',
        colManual: 'Manual Process',
        colSmartSales: 'With SmartSales',
        rows: [
            { aspect: 'Prospect status', manual: 'Scattered across spreadsheets, chats, and each rep\'s personal notes', smart: 'Visible in one shared pipeline for the whole team' },
            { aspect: 'Customer follow-up', manual: 'Relies on memory or personal phone reminders', smart: 'Automated follow-up reminders appear in the system' },
            { aspect: 'WhatsApp chat history', manual: 'Stored on each rep\'s phone, lost when the team changes', smart: 'Logged on the prospect card, connected to the WhatsApp Business API' },
            { aspect: 'Reporting to management', manual: 'Compiled manually, often late or incomplete', smart: 'Sales managers see it live from the pipeline dashboard' },
            { aspect: 'Prospect handover', manual: 'Prone to getting lost when a rep resigns or switches teams', smart: 'Data stays in the company system, just needs reassignment' },
            { aspect: 'Data access', manual: 'No clear boundary on who can see whose data', smart: 'Access rights are role-based, per company policy' },
        ],
    },
};

export default function SalesComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                        variant="h2"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            mb: 2,
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '640px', mx: 'auto' }}>
                        {t.subtitle}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
                        overflow: 'hidden',
                    }}
                >
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', py: 2.5 }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.95rem', py: 2.5 }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: '#3854D6',
                                        fontSize: '0.95rem',
                                        py: 2.5,
                                        bgcolor: 'rgba(89, 124, 255, 0.06)',
                                    }}
                                >
                                    {t.colSmartSales}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', verticalAlign: 'top', py: 3 }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748B', verticalAlign: 'top', py: 3 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CancelIcon sx={{ fontSize: 18, color: '#F43F5E', mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                                                {row.manual}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            verticalAlign: 'top',
                                            py: 3,
                                            bgcolor: 'rgba(89, 124, 255, 0.04)',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CheckCircleIcon sx={{ fontSize: 18, color: '#22C55E', mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                                                {row.smart}
                                            </Typography>
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
