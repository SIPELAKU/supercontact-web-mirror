"use client";

import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from '@/lib/context/LanguageContext';

const COPY = {
    id: {
        badge: 'PERBANDINGAN',
        title: 'Cara Manual vs SmartSales',
        subtitle: 'Begini perubahan alur kerja sales B2B dan support teknis Anda setelah pipeline proyek dan helpdesk dikelola dalam satu sistem.',
        colAspect: 'Aspek',
        colManual: 'Cara Manual (WA Pribadi + Spreadsheet)',
        colSmartSales: 'Dengan SmartSales',
        rows: [
            {
                aspect: 'Follow-up proposal & demo proyek B2B',
                manual: 'Dicatat di spreadsheet terpisah, sering terlewat di tengah kesibukan tim sales',
                smart: 'Pipeline Kanban CRM Sales menampilkan tahap Lead/Discovery, Demo & Proposal, hingga Closed Won secara visual',
            },
            {
                aspect: 'Laporan bug/error dari klien',
                manual: 'Masuk ke WhatsApp pribadi developer atau Project Manager, gampang tenggelam di antara chat lain',
                smart: 'Masuk lewat satu nomor WhatsApp Business API resmi sebagai Helpdesk Center yang dipantau tim support bersama',
            },
            {
                aspect: 'Eskalasi ke tim Engineering',
                manual: 'Dipindah manual satu per satu ke tools tracking internal, memakan waktu dan rawan informasi terlewat',
                smart: 'Ticket Creation mengubah keluhan jadi tiket investigasi teknis secara instan dan langsung dieskalasi ke tim Level 2/3',
            },
            {
                aspect: 'Dokumen legal proyek (MOU, NDA, SPK)',
                manual: 'Tersebar di email atau folder pribadi masing-masing sales',
                smart: 'Tersimpan langsung di database klien dalam CRM Sales, mudah ditemukan saat dibutuhkan',
            },
            {
                aspect: 'Info maintenance rutin & dokumentasi API',
                manual: 'Dikirim manual satu per satu ke tiap klien yang bertanya',
                smart: 'Auto-Reply mengirimkan info maintenance atau dokumentasi API secara otomatis',
            },
            {
                aspect: 'Pemantauan status tiket support',
                manual: 'Status hanya diketahui developer yang menangani, klien harus tanya berkali-kali',
                smart: 'Status Open, In Progress, Resolved terlihat sama oleh tim CS dan Engineering secara real-time',
            },
        ],
    },
    en: {
        badge: 'COMPARISON',
        title: 'Manual Process vs SmartSales',
        subtitle: 'How your B2B sales and technical support workflow changes once project pipelines and helpdesk run in one system.',
        colAspect: 'Aspect',
        colManual: 'Manual Way (Personal WA + Spreadsheet)',
        colSmartSales: 'With SmartSales',
        rows: [
            {
                aspect: 'B2B project proposal & demo follow-up',
                manual: 'Tracked in a separate spreadsheet, often missed amid a busy sales schedule',
                smart: 'Kanban Pipeline in CRM Sales visually shows Lead/Discovery, Demo & Proposal, through to Closed Won',
            },
            {
                aspect: 'Bug/error reports from clients',
                manual: 'Land on the developer\'s or PM\'s personal WhatsApp, easily buried among other chats',
                smart: 'Come in through one official WhatsApp Business API number as a Helpdesk Center the whole support team can monitor',
            },
            {
                aspect: 'Escalation to the Engineering team',
                manual: 'Moved manually one by one into internal tracking tools, slow and prone to lost information',
                smart: 'Ticket Creation instantly turns complaints into technical investigation tickets and escalates them to Level 2/3',
            },
            {
                aspect: 'Project legal documents (MOU, NDA, work orders)',
                manual: 'Scattered across email or individual sales reps\' personal folders',
                smart: 'Stored directly in the client database inside CRM Sales, easy to find when needed',
            },
            {
                aspect: 'Routine maintenance & API doc info',
                manual: 'Sent manually one by one to every client who asks',
                smart: 'Sent automatically via Auto-Reply',
            },
            {
                aspect: 'Support ticket status tracking',
                manual: 'Only known to the developer handling it, clients have to keep asking',
                smart: 'Open, In Progress, Resolved status is visible to both CS and Engineering in real time',
            },
        ],
    },
};

const ITSaaSComparison = () => {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#597CFF',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase',
                        }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: '#111827',
                            mb: 2,
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4B5563', fontSize: '1rem' }}>
                        {t.subtitle}
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
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ background: 'linear-gradient(90deg, #597CFF 0%, #7692FF 100%)' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem', width: { md: '22%' } }}>
                                    {t.colAspect}
                                </TableCell>
                                <TableCell sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 700, fontSize: '0.95rem' }}>
                                    {t.colSmartSales}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:nth-of-type(odd)': { bgcolor: '#F8FAFC' },
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#111827', verticalAlign: 'top' }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#4B5563', verticalAlign: 'top' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <CloseIcon sx={{ color: '#EF4444', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                                            <span>{row.manual}</span>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#111827', verticalAlign: 'top' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
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
    );
};

export default ITSaaSComparison;
