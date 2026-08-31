"use client";

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from '@/lib/context/LanguageContext';

const COPY = {
    id: {
        subtitle: 'PERTANYAAN UMUM',
        title: 'Tanya Jawab Seputar SmartSales untuk Ritel',
        faqs: [
            {
                q: 'Bagaimana cara SmartSales membantu mengelola database member toko saya?',
                a: 'SmartSales menjadikan CRM Sales sebagai pusat data pelanggan toko Anda. Setiap member bisa dikategorikan berdasarkan tingkat loyalitas (Silver, Gold, VIP), lengkap dengan riwayat interaksi dan pembelian yang tercatat otomatis, bukan lagi di buku catatan atau spreadsheet terpisah.',
            },
            {
                q: 'Apakah broadcast promo lewat WhatsApp bisa ditargetkan ke member tertentu saja, misalnya hanya member VIP?',
                a: 'Bisa. Karena data pelanggan sudah dikategorikan di CRM Sales, Anda dapat memilih segmen tertentu (misalnya VIP atau Gold) sebelum mengirim broadcast promo, sehingga pesan tidak dikirim secara acak ke seluruh kontak.',
            },
            {
                q: 'Broadcast promo ke pelanggan itu pakai WhatsApp pribadi admin atau nomor resmi toko?',
                a: 'Menggunakan WhatsApp Business API resmi (centang hijau) atas nama toko Anda, bukan nomor pribadi staf. Nomor ini bisa dipegang dan dibalas oleh beberapa admin sekaligus dari satu sistem yang sama.',
            },
            {
                q: 'Bagaimana proses klaim garansi dicatat supaya tidak hilang atau terlewat?',
                a: 'Keluhan kerusakan barang yang masuk lewat admin CS diubah menjadi tiket lewat modul Ticket Creation, lalu diteruskan ke teknisi atau service center tanpa data yang hilang di tengah jalan.',
            },
            {
                q: 'Apakah pelanggan bisa memantau status klaim garansi mereka tanpa harus bertanya berulang kali?',
                a: 'Bisa. Setiap tiket klaim garansi memiliki status yang diperbarui secara berkala, sehingga pelanggan mendapat informasi progres perbaikan tanpa harus menghubungi toko berulang kali untuk sekadar bertanya status.',
            },
            {
                q: 'Apakah admin toko bisa menjawab pertanyaan jam buka atau lokasi toko secara otomatis?',
                a: 'Bisa, menggunakan fitur Auto-Reply. Pertanyaan umum seperti jam operasional atau lokasi toko dapat dijawab otomatis, sementara admin fokus menangani pertanyaan yang butuh respons personal.',
            },
            {
                q: 'Apakah data pelanggan dan riwayat pembelian toko saya aman?',
                a: 'SmartSales dibangun dengan arsitektur multi-tenant, artinya data setiap perusahaan terpisah secara logis dari perusahaan lain yang menggunakan sistem yang sama.',
            },
            {
                q: 'Bisakah alur kerja SmartSales disesuaikan dengan proses toko kami yang sudah berjalan?',
                a: 'Bisa. SmartSales bersifat custom build dan multi-tenant, mulai dari kategori loyalitas member, template promo, hingga alur eskalasi tiket klaim garansi dapat disesuaikan dengan proses yang sudah berjalan di toko Anda.',
            },
            {
                q: 'Berapa biaya berlangganan SmartSales untuk toko ritel?',
                a: 'Struktur paket SmartSales berlaku sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
            },
            {
                q: 'Apakah ada uji coba gratis sebelum berlangganan?',
                a: 'Ada. Anda bisa memulai uji coba gratis atau berkonsultasi lebih dulu dengan tim kami untuk melihat apakah alur pengelolaan member, broadcast promo, dan klaim garansi di SmartSales sesuai dengan kebutuhan toko Anda.',
            },
        ],
    },
    en: {
        subtitle: 'FREQUENTLY ASKED QUESTIONS',
        title: 'FAQ About SmartSales for Retail',
        faqs: [
            {
                q: 'How does SmartSales help manage my store’s member database?',
                a: 'SmartSales uses CRM Sales as your store’s central customer data hub. Every member can be categorized by loyalty level (Silver, Gold, VIP), with interaction and purchase history recorded automatically instead of scattered across notebooks or spreadsheets.',
            },
            {
                q: 'Can WhatsApp promo broadcasts be targeted to specific members, like VIP only?',
                a: 'Yes. Since customer data is already categorized in CRM Sales, you can select a specific segment (such as VIP or Gold) before sending a promo broadcast, so messages aren’t sent randomly to every contact.',
            },
            {
                q: 'Are promo broadcasts sent from the admin’s personal WhatsApp or an official store number?',
                a: 'They’re sent from an official WhatsApp Business API number (green tick) under your store’s name, not a staff member’s personal number. Multiple admins can share and reply from the same number within one system.',
            },
            {
                q: 'How are warranty claims recorded so nothing gets lost or missed?',
                a: 'Damage complaints reported to CS admins are converted into tickets via the Ticket Creation module, then forwarded to technicians or the service center without losing any data along the way.',
            },
            {
                q: 'Can customers track their warranty claim status without asking repeatedly?',
                a: 'Yes. Every warranty claim ticket has a status that gets updated periodically, so customers get repair progress information without having to contact the store repeatedly just to ask.',
            },
            {
                q: 'Can store admins answer questions like opening hours or store location automatically?',
                a: 'Yes, using the Auto-Reply feature. Common questions such as operating hours or store location can be answered automatically, while admins focus on questions that need a personal response.',
            },
            {
                q: 'Is my customer data and purchase history safe?',
                a: 'SmartSales is built on a multi-tenant architecture, meaning each company’s data is logically separated from other companies using the same system.',
            },
            {
                q: 'Can SmartSales’ workflow be adjusted to match our store’s existing process?',
                a: 'Yes. SmartSales is custom built and multi-tenant, so member loyalty categories, promo templates, and warranty claim escalation flows can be adapted to match your store’s existing process.',
            },
            {
                q: 'How much does a SmartSales subscription cost for a retail store?',
                a: 'SmartSales’ package structure is the same across industries, covering the CRM Sales, CRM Services (ticketing), and Omnichannel WhatsApp modules. Full package details and current pricing are available on our pricing page.',
            },
            {
                q: 'Is there a free trial before subscribing?',
                a: 'Yes. You can start a free trial or consult with our team first to see whether SmartSales’ member management, promo broadcast, and warranty claim workflow fits your store’s needs.',
            },
        ],
    },
};

export default function RetailFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];
    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'var(--brand-deep)',
                            fontWeight: 800,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                        }}
                    >
                        {t.subtitle}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: '#0F172A',
                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                        }}
                    >
                        {t.title}
                    </Typography>
                </Box>

                <Box>
                    {t.faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `panel${index}`}
                            onChange={handleChange(`panel${index}`)}
                            elevation={0}
                            sx={{
                                mb: 2,
                                borderRadius: '16px !important',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                    borderColor: '#597CFF',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--brand-deep)' }} />}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                id={`faq-panel-${index}`}
                                aria-labelledby={`faq-summary-${index}`}
                                sx={{ px: 3, pb: 3 }}
                            >
                                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {faq.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
