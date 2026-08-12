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
        badge: 'PERTANYAAN UMUM',
        title: 'Pertanyaan Seputar Solusi FMCG',
        subtitle: 'Hal-hal yang biasa ditanyakan distributor dan principal sebelum menggunakan SmartSales.',
        faqs: [
            {
                q: 'Apakah SmartSales bisa dipakai untuk terima order dari toko/agen lewat WhatsApp?',
                a: 'Bisa. SmartSales menggunakan WhatsApp Business API resmi sehingga satu nomor WhatsApp bisa dipegang bersama oleh seluruh tim admin (Order Taking), lengkap dengan riwayat chat, katalog, dan status order yang tercatat di sistem, bukan hanya di HP pribadi sales.',
            },
            {
                q: 'Bagaimana cara memastikan sales canvasser benar-benar mengunjungi toko sesuai jadwal?',
                a: 'Tim lapangan melakukan Check-in GPS (geo-tagging) melalui aplikasi mobile saat tiba di lokasi toko. Anda juga bisa mengatur jadwal rute kunjungan harian (Journey Plan) per sales, sehingga kunjungan yang benar-benar terjadi bisa dipantau dari dashboard.',
            },
            {
                q: 'Bagaimana proses retur barang rusak atau kadaluarsa ditangani di SmartSales?',
                a: 'Laporan barang rusak atau bad stock dari toko diubah menjadi tiket lewat modul Ticket Creation, lalu dieskalasi dari admin CS ke tim gudang untuk pengecekan dan persetujuan. Toko bisa memantau status retur tersebut sampai barang pengganti siap dikirim.',
            },
            {
                q: 'Apakah data order dan pesanan bisa hilang jika sales mengganti HP atau resign?',
                a: 'Tidak. Karena order masuk lewat nomor WhatsApp Business API resmi perusahaan (bukan nomor pribadi sales) dan tercatat di CRM, data pelanggan, riwayat chat, dan riwayat pesanan tetap tersimpan di sistem meski ada pergantian personel.',
            },
            {
                q: 'Apakah order dari WhatsApp otomatis masuk ke status di gudang?',
                a: 'Status order bisa diubah secara manual oleh tim admin atau gudang mengikuti tahapan dari Purchase Order (PO), proses gudang, hingga siap dikirim oleh armada logistik, sehingga seluruh tim melihat status yang sama secara real-time.',
            },
            {
                q: 'Apakah SmartSales cocok untuk distributor dengan ratusan toko/retailer?',
                a: 'Cocok. Fitur CRM Sales & Canvassing dirancang untuk mengelola data ratusan toko retail sekaligus, memantau pesanan yang masuk secara visual, dan melacak produktivitas tim lapangan per sales.',
            },
            {
                q: 'Apakah harga SmartSales berbeda untuk kebutuhan distribusi FMCG?',
                a: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
            },
            {
                q: 'Bisakah alur kerja SmartSales disesuaikan dengan proses distribusi kami saat ini?',
                a: 'Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang bisa disesuaikan, mulai dari kolom data toko, tahapan status order, template balasan otomatis, hingga alur eskalasi tiket retur, mengikuti proses distribusi yang sudah berjalan di bisnis Anda.',
            },
            {
                q: 'Apakah ada uji coba gratis sebelum berlangganan?',
                a: 'Ada. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami terlebih dahulu untuk melihat apakah alur order WhatsApp, canvassing, dan retur di SmartSales sesuai dengan kebutuhan distribusi Anda.',
            },
            {
                q: 'Apakah balasan otomatis (auto-reply) bisa dipakai untuk kirim katalog dan daftar harga?',
                a: 'Bisa. Auto-Reply dapat dikonfigurasi untuk mengirim katalog produk, daftar harga (price list), atau info ketersediaan stok secara instan saat toko atau agen menghubungi nomor WhatsApp resmi distributor.',
            },
        ],
    },
    en: {
        badge: 'FREQUENTLY ASKED QUESTIONS',
        title: 'Questions About the FMCG Solution',
        subtitle: 'Common questions distributors and principals ask before using SmartSales.',
        faqs: [
            {
                q: 'Can SmartSales be used to take orders from stores or agents via WhatsApp?',
                a: 'Yes. SmartSales uses the official WhatsApp Business API, so a single WhatsApp number can be shared by your entire Order Taking team, complete with chat history, catalog, and order status recorded in the system instead of a sales rep\'s personal phone.',
            },
            {
                q: 'How do you confirm a field sales canvasser actually visited a store as scheduled?',
                a: 'The field team performs a GPS check-in (geo-tagging) through the mobile app upon arriving at the store. You can also set a daily visit route (Journey Plan) per salesperson, so actual visits can be monitored from the dashboard.',
            },
            {
                q: 'How are returns for damaged or expired goods handled in SmartSales?',
                a: 'Reports of damaged or bad stock from stores are converted into tickets through the Ticket Creation module, then escalated from CS admin to the warehouse team for inspection and approval. Stores can track their return status until the replacement goods are ready to ship.',
            },
            {
                q: 'Can order data disappear if a salesperson changes phones or resigns?',
                a: 'No. Because orders come in through the company\'s official WhatsApp Business API number (not a personal sales number) and are logged in the CRM, customer data, chat history, and order history stay in the system regardless of staff changes.',
            },
            {
                q: 'Do WhatsApp orders automatically move through warehouse status stages?',
                a: 'Order status is updated by the admin or warehouse team through the stages from Purchase Order (PO), warehouse processing, to ready for shipment by the logistics fleet, so every team sees the same status in real time.',
            },
            {
                q: 'Is SmartSales suitable for distributors with hundreds of stores or retailers?',
                a: 'Yes. The CRM Sales & Canvassing feature is built to manage data for hundreds of retail stores at once, track incoming orders visually, and monitor each field team member\'s productivity.',
            },
            {
                q: 'Is pricing different for FMCG distribution needs?',
                a: 'The SmartSales package structure is the same across industries, covering CRM Sales, CRM Services (ticketing), and Omnichannel WhatsApp modules. Full package and pricing details are available on our pricing page.',
            },
            {
                q: 'Can the SmartSales workflow be adapted to our current distribution process?',
                a: 'Yes. SmartSales is multi-tenant with configurable settings, from store data fields and order status stages to auto-reply templates and return ticket escalation flows, matching the distribution process already running in your business.',
            },
            {
                q: 'Is there a free trial before subscribing?',
                a: 'Yes. You can start a free trial or consult directly with our team first to see whether the WhatsApp ordering, canvassing, and returns flow in SmartSales fits your distribution needs.',
            },
            {
                q: 'Can auto-reply be used to send catalogs and price lists?',
                a: 'Yes. Auto-Reply can be configured to instantly send a product catalog, price list, or stock availability info when a store or agent messages the distributor\'s official WhatsApp number.',
            },
        ],
    },
};

const FmcgFAQ = () => {
    const { language } = useLanguage();
    const t = COPY[language];

    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
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
                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#4B5563', fontSize: '1rem' }}>
                        {t.subtitle}
                    </Typography>
                </Box>

                <Box>
                    {t.faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `panel${index}`}
                            onChange={handleChange(`panel${index}`)}
                            sx={{
                                mb: 2,
                                borderRadius: '16px !important',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                '&:before': { display: 'none' },
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#597CFF' }} />}
                                aria-controls={`fmcg-faq-panel${index}-content`}
                                id={`fmcg-faq-panel${index}-header`}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" sx={{ color: '#4B5563', lineHeight: 1.7 }}>
                                    {faq.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default FmcgFAQ;
