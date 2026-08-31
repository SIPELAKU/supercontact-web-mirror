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
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        badge: 'Perbandingan',
        title: 'Chat Tanpa Tiket vs Ticket Creation',
        subtitle: 'Perbandingan cara kerja tim CS yang menangani keluhan langsung di kolom chat dengan tim yang sudah mengubah setiap chat penting menjadi tiket terlacak.',
        colAspect: 'Aspek',
        colManual: 'Tanpa Ticket Creation',
        colSmartSales: 'Dengan Ticket Creation',
        rows: [
            { aspect: 'Keluhan pelanggan', manual: 'Tercampur dengan chat lain, mudah terlewat atau lupa ditindaklanjuti', smart: 'Langsung jadi tiket dengan status Open, In Progress, atau Resolved' },
            { aspect: 'Eskalasi ke tim lain', manual: 'Screenshot chat dikirim manual lewat WhatsApp atau email internal', smart: 'Tiket diteruskan ke tim teknis, gudang, atau finance tanpa kehilangan transkrip chat' },
            { aspect: 'Batas waktu penyelesaian', manual: 'Tidak ada pengingat, keluhan bisa menunggu tanpa disadari', smart: 'SLA diatur per tiket, sistem memberi peringatan jika batas waktu terlewat' },
            { aspect: 'Riwayat keluhan pelanggan', manual: 'Tersebar di riwayat chat masing-masing agen', smart: 'Tersimpan terpusat di profil pelanggan, bisa dicek sebelum membalas chat baru' },
            { aspect: 'Chat prospek penjualan', manual: 'Dicatat manual di luar sistem, rawan tidak terinput ke pipeline', smart: 'Bisa langsung diubah jadi tiket Lead dan masuk ke Pipeline CRM Sales' },
            { aspect: 'Laporan ke atasan', manual: 'Disusun manual dari ingatan atau catatan agen', smart: 'Status semua tiket terlihat langsung, tanpa menyusun laporan manual' },
        ],
    },
    en: {
        badge: 'Comparison',
        title: 'Chat Without Tickets vs Ticket Creation',
        subtitle: 'How CS teams handling complaints directly in the chat window compare to teams that turn every important chat into a tracked ticket.',
        colAspect: 'Aspect',
        colManual: 'Without Ticket Creation',
        colSmartSales: 'With Ticket Creation',
        rows: [
            { aspect: 'Customer complaints', manual: 'Mixed in with other chats, easy to miss or forget to follow up on', smart: 'Instantly becomes a ticket with Open, In Progress, or Resolved status' },
            { aspect: 'Escalating to other teams', manual: 'Chat screenshots sent manually via WhatsApp or internal email', smart: 'Tickets are forwarded to technical, warehouse, or finance teams without losing the chat transcript' },
            { aspect: 'Resolution deadlines', manual: 'No reminders, complaints can wait without anyone noticing', smart: 'SLA is set per ticket, system alerts when a deadline is missed' },
            { aspect: 'Customer complaint history', manual: 'Scattered across each agent\'s own chat history', smart: 'Stored centrally on the customer profile, checkable before replying to a new chat' },
            { aspect: 'Sales prospect chats', manual: 'Logged manually outside the system, prone to never reaching the pipeline', smart: 'Can be converted directly into a Lead ticket and placed in the CRM Sales Pipeline' },
            { aspect: 'Reporting to management', manual: 'Compiled manually from agents\' memory or notes', smart: 'All ticket statuses are visible directly, no manual report needed' },
        ],
    },
};

export default function TicketComparison() {
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
                            color: 'var(--brand-deep)',
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
                            <TableRow sx={{ bgcolor: 'var(--surface-alt)' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem', py: 2.5 }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.95rem', py: 2.5 }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: 'var(--brand-deep)',
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
