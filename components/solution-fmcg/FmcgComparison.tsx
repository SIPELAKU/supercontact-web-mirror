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
        title: 'Proses Manual vs SmartSales',
        subtitle: 'Begini perubahan alur kerja distribusi FMCG Anda setelah order, canvassing, dan retur dikelola dalam satu sistem.',
        colAspect: 'Aspek',
        colManual: 'Cara Manual (WA Pribadi + Excel)',
        colSmartSales: 'Dengan SmartSales',
        rows: [
            {
                aspect: 'Order dari toko/agen',
                manual: 'Masuk ke WhatsApp pribadi masing-masing sales, rawan lupa direkap ke gudang',
                smart: 'Masuk lewat satu nomor WhatsApp Business API resmi, tercatat otomatis di sistem',
            },
            {
                aspect: 'Kunjungan sales lapangan',
                manual: 'Laporan visit hanya berdasarkan klaim sales, sulit dipastikan kebenarannya',
                smart: 'Divalidasi dengan Check-in GPS (geo-tagging) sesuai jadwal Journey Plan',
            },
            {
                aspect: 'Status pesanan',
                manual: 'Ditanyakan bolak-balik lewat chat karena admin, gudang, dan sales tidak lihat data yang sama',
                smart: 'Satu status order yang sama terlihat oleh admin, gudang, dan sales secara real-time',
            },
            {
                aspect: 'Retur & komplain barang',
                manual: 'Laporan barang rusak hilang di tumpukan chat, respons ke toko lambat',
                smart: 'Otomatis jadi tiket dan dieskalasi ke tim gudang lewat modul Ticket Creation',
            },
            {
                aspect: 'Katalog & daftar harga',
                manual: 'Sales kirim manual satu per satu tiap ada yang tanya',
                smart: 'Dikirim otomatis lewat Auto-Reply saat toko menghubungi WhatsApp',
            },
            {
                aspect: 'Riwayat pelanggan saat sales resign',
                manual: 'Ikut hilang karena tersimpan di HP pribadi sales',
                smart: 'Tetap tersimpan di CRM karena order masuk lewat nomor resmi perusahaan',
            },
        ],
    },
    en: {
        badge: 'COMPARISON',
        title: 'Manual Process vs SmartSales',
        subtitle: 'How your FMCG distribution workflow changes once ordering, canvassing, and returns run in one system.',
        colAspect: 'Aspect',
        colManual: 'Manual Way (Personal WA + Excel)',
        colSmartSales: 'With SmartSales',
        rows: [
            {
                aspect: 'Orders from stores/agents',
                manual: 'Land on each rep\'s personal WhatsApp, often forgotten before reaching the warehouse',
                smart: 'Come in through one official WhatsApp Business API number, logged automatically in the system',
            },
            {
                aspect: 'Field sales visits',
                manual: 'Visit reports rely on the rep\'s own claim, hard to verify',
                smart: 'Validated with GPS check-in (geo-tagging) against the Journey Plan schedule',
            },
            {
                aspect: 'Order status',
                manual: 'Chased back and forth over chat because admin, warehouse, and sales see different data',
                smart: 'One shared order status visible to admin, warehouse, and sales in real time',
            },
            {
                aspect: 'Returns & complaints',
                manual: 'Damage reports get buried in chat threads, slow response to stores',
                smart: 'Automatically becomes a ticket escalated to the warehouse via Ticket Creation',
            },
            {
                aspect: 'Catalog & price list',
                manual: 'Sales reps send them manually one by one whenever asked',
                smart: 'Sent automatically via Auto-Reply when a store messages WhatsApp',
            },
            {
                aspect: 'Customer history when a rep leaves',
                manual: 'Lost along with it, since it lived on the rep\'s personal phone',
                smart: 'Stays in the CRM because orders flow through the company\'s official number',
            },
        ],
    },
};

const FmcgComparison = () => {
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

export default FmcgComparison;
