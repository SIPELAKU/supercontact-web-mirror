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
        badge: 'SEBELUM & SESUDAH',
        title: 'Spreadsheet & WhatsApp Pribadi vs SmartSales',
        subtitle: 'Perbandingan cara kerja perusahaan outsourcing yang masih manual dengan cara kerja yang sudah menggunakan SmartSales.',
        colAspect: 'Aspek Pekerjaan',
        colManual: 'Cara Manual',
        colSmart: 'Dengan SmartSales',
        rows: [
            {
                aspect: 'Data kandidat & pekerja',
                manual: 'Tersebar di spreadsheet, folder dokumen, dan chat WhatsApp pribadi HR',
                smart: 'Terpusat dalam satu database, bisa difilter berdasarkan skill, lokasi, dan status ketersediaan',
            },
            {
                aspect: 'Pipeline rekrutmen',
                manual: 'Status pelamar dicek manual satu per satu lewat chat atau kertas',
                smart: 'Tahapan kandidat baru, interview, hingga penempatan terlihat dalam satu tampilan pipeline',
            },
            {
                aspect: 'Pipeline klien B2B',
                manual: 'Follow up calon klien mengandalkan ingatan atau catatan pribadi sales',
                smart: 'Sales Pipeline mencatat setiap tahap follow up sehingga leads klien tidak terlewat',
            },
            {
                aspect: 'Info massal ke pekerja lapangan',
                manual: 'Dikirim lewat WhatsApp Group, rawan nomor diblokir dan pesan tenggelam',
                smart: 'Broadcast lewat WhatsApp Business API resmi ke ratusan pekerja sekaligus',
            },
            {
                aspect: 'Pertanyaan umum dari pelamar',
                manual: 'Dibalas manual satu per satu oleh staf HR yang sedang bertugas',
                smart: 'Dijawab otomatis lewat Auto-Reply untuk pertanyaan yang sering muncul',
            },
            {
                aspect: 'Komplain klien soal kinerja pekerja',
                manual: 'Masuk lewat chat pribadi, mudah terlewat atau lupa ditindaklanjuti',
                smart: 'Otomatis menjadi tiket dan dieskalasi ke Koordinator Lapangan atau Area Manager',
            },
            {
                aspect: 'Pengingat kontrak & masa percobaan',
                manual: 'Diingat manual atau dicatat di kalender pribadi masing-masing staf',
                smart: 'Pengingat otomatis dikirim ke WhatsApp tim operasional sebelum tanggal jatuh tempo',
            },
            {
                aspect: 'Jejak riwayat komunikasi',
                manual: 'Hilang jika staf resign atau mengganti nomor HP',
                smart: 'Tersimpan di sistem perusahaan, tidak bergantung pada nomor pribadi staf',
            },
        ],
    },
    en: {
        badge: 'BEFORE & AFTER',
        title: 'Spreadsheets & Personal WhatsApp vs SmartSales',
        subtitle: 'A comparison of how outsourcing companies work manually versus how they work once they use SmartSales.',
        colAspect: 'Work Aspect',
        colManual: 'Manual Process',
        colSmart: 'With SmartSales',
        rows: [
            {
                aspect: 'Candidate & worker data',
                manual: 'Scattered across spreadsheets, document folders, and HR\'s personal WhatsApp chats',
                smart: 'Centralized in one database, filterable by skill, location, and availability status',
            },
            {
                aspect: 'Recruitment pipeline',
                manual: 'Applicant status checked manually one by one through chats or paper',
                smart: 'New candidate, interview, and placement stages visible in a single pipeline view',
            },
            {
                aspect: 'B2B client pipeline',
                manual: 'Following up prospective clients relies on a sales rep\'s memory or personal notes',
                smart: 'The Sales Pipeline tracks every follow-up stage so client leads don\'t get missed',
            },
            {
                aspect: 'Mass info to field workers',
                manual: 'Sent through WhatsApp Groups, prone to blocked numbers and buried messages',
                smart: 'Broadcast through the official WhatsApp Business API to hundreds of workers at once',
            },
            {
                aspect: 'Common questions from applicants',
                manual: 'Answered manually, one by one, by whichever HR staff member is on duty',
                smart: 'Answered automatically via Auto-Reply for frequently asked questions',
            },
            {
                aspect: 'Client complaints about worker performance',
                manual: 'Arrive through personal chats, easily missed or forgotten',
                smart: 'Automatically become a ticket, escalated to the relevant Field Coordinator or Area Manager',
            },
            {
                aspect: 'Contract & probation reminders',
                manual: 'Remembered manually or noted on each staff member\'s personal calendar',
                smart: 'Automatic reminders sent to the operations team\'s WhatsApp before the due date',
            },
            {
                aspect: 'Communication history trail',
                manual: 'Lost if a staff member resigns or changes their phone number',
                smart: 'Stored in the company\'s system, not dependent on any staff member\'s personal number',
            },
        ],
    },
} as const;

export default function OutsourcingComparison() {
    const { language } = useLanguage();
    const copy = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#597CFF',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                        }}
                    >
                        {copy.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            mb: 2,
                        }}
                    >
                        {copy.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '640px', mx: 'auto' }}>
                        {copy.subtitle}
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
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', py: 2.5 }}>
                                    {copy.colAspect}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.9rem', py: 2.5 }}>
                                    {copy.colManual}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#597CFF', fontSize: '0.9rem', py: 2.5 }}>
                                    {copy.colSmart}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {copy.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                        '&:hover': { bgcolor: '#F8FAFC' },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', verticalAlign: 'top', py: 2.5 }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#94A3B8', verticalAlign: 'top', py: 2.5 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CloseIcon sx={{ fontSize: 18, color: '#F43F5E', mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: 'inherit' }}>{row.manual}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155', verticalAlign: 'top', py: 2.5 }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CheckCircleIcon sx={{ fontSize: 18, color: '#22C55E', mt: 0.2, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 500 }}>{row.smart}</Typography>
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
}
