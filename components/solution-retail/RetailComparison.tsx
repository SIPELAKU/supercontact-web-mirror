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
        subtitle: 'Begini perubahan pengelolaan member, promo, dan klaim garansi toko Anda setelah pindah ke satu sistem terpadu.',
        colAspect: 'Aspek',
        colManual: 'Cara Manual (Buku/Excel + WA Pribadi)',
        colSmartSales: 'Dengan SmartSales',
        rows: [
            {
                aspect: 'Data member & pelanggan',
                manual: 'Dicatat di buku atau spreadsheet terpisah, sering tidak update dan sulit dicari',
                smart: 'Tersimpan di CRM Sales, dikategorikan Silver/Gold/VIP, riwayat pembelian tercatat otomatis',
            },
            {
                aspect: 'Broadcast promo',
                manual: 'Dikirim dari WhatsApp pribadi admin ke semua kontak tanpa target yang jelas',
                smart: 'Dikirim via WhatsApp Business API resmi, bisa ditargetkan ke segmen member tertentu',
            },
            {
                aspect: 'Pertanyaan stok & harga',
                manual: 'Satu admin pegang HP toko, respons lambat saat pelanggan ramai bertanya',
                smart: 'Beberapa staf balas dari satu nomor resmi, dibantu Quick Reply berisi katalog produk',
            },
            {
                aspect: 'Klaim garansi',
                manual: 'Keluhan tercecer di chat, pelanggan merasa dipingpong tanpa kejelasan status',
                smart: 'Otomatis jadi tiket lewat Ticket Creation, status dipantau sampai selesai',
            },
            {
                aspect: 'Jam buka & lokasi toko',
                manual: 'Dijawab manual berulang-ulang tiap ada pelanggan baru bertanya',
                smart: 'Dijawab otomatis lewat Auto-Reply begitu pelanggan menghubungi WhatsApp',
            },
            {
                aspect: 'Riwayat pelanggan saat admin berganti',
                manual: 'Ikut hilang karena tersimpan di HP pribadi admin yang resign',
                smart: 'Tetap tersimpan di sistem karena chat masuk lewat nomor resmi toko',
            },
        ],
    },
    en: {
        badge: 'COMPARISON',
        title: 'Manual Way vs SmartSales',
        subtitle: 'How your store\'s member, promo, and warranty claim handling changes once it runs in one integrated system.',
        colAspect: 'Aspect',
        colManual: 'Manual Way (Notebook/Excel + Personal WA)',
        colSmartSales: 'With SmartSales',
        rows: [
            {
                aspect: 'Member & customer data',
                manual: 'Recorded in a notebook or separate spreadsheet, often outdated and hard to search',
                smart: 'Stored in CRM Sales, categorized Silver/Gold/VIP, purchase history logged automatically',
            },
            {
                aspect: 'Promo broadcasts',
                manual: 'Sent from the admin\'s personal WhatsApp to every contact with no clear targeting',
                smart: 'Sent via official WhatsApp Business API, can be targeted to a specific member segment',
            },
            {
                aspect: 'Stock & price questions',
                manual: 'One admin holds the store phone, slow responses when customers ask all at once',
                smart: 'Multiple staff reply from one official number, helped by Quick Reply product catalogs',
            },
            {
                aspect: 'Warranty claims',
                manual: 'Complaints get buried in chat, customers feel bounced around with no clear status',
                smart: 'Automatically becomes a ticket via Ticket Creation, status is tracked until resolved',
            },
            {
                aspect: 'Opening hours & location',
                manual: 'Answered manually over and over for every new customer who asks',
                smart: 'Answered automatically via Auto-Reply as soon as a customer messages WhatsApp',
            },
            {
                aspect: 'Customer history when an admin leaves',
                manual: 'Lost along with it, since it lived on the admin\'s personal phone',
                smart: 'Stays in the system because chats come through the store\'s official number',
            },
        ],
    },
};

const RetailComparison = () => {
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

export default RetailComparison;
