"use client";

import React from "react";
import {
    Box,
    Container,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        subtitle: "PERTANYAAN UMUM",
        title: "Tanya Jawab Seputar SmartSales untuk Lembaga Keuangan",
        desc: "Hal-hal yang paling sering ditanyakan oleh bank, koperasi, dan perusahaan multifinance sebelum mulai memakai SmartSales.",
        faqs: [
            {
                q: "Apakah SmartSales cocok untuk bank, koperasi, maupun perusahaan multifinance?",
                a: "Cocok. Modul CRM Sales, Omnichannel WhatsApp, dan CRM Services (ticketing) dirancang generik untuk mengelola prospek kredit dan komunikasi nasabah, sehingga bisa dipakai bank, koperasi simpan pinjam, maupun perusahaan multifinance atau pembiayaan.",
            },
            {
                q: "Bagaimana proses pengajuan kredit dikelola di SmartSales?",
                a: "Setiap calon debitur masuk sebagai kartu di CRM Sales dengan pipeline visual, mulai dari prospek baru, proses verifikasi (BI Checking), hingga disetujui dan siap cair. Tim Anda bisa langsung melihat di tahap mana setiap pengajuan berada.",
            },
            {
                q: "Apakah WhatsApp yang dipakai adalah nomor resmi perusahaan, bukan HP pribadi sales?",
                a: "Benar. SmartSales terintegrasi dengan WhatsApp Business API resmi, sehingga satu nomor WhatsApp perusahaan bisa dipegang bersama oleh seluruh tim, lengkap dengan riwayat chat yang tercatat di sistem, bukan hanya tersimpan di HP pribadi.",
            },
            {
                q: "Bagaimana keamanan data nasabah dan dokumen seperti KTP atau NPWP?",
                a: "Data nasabah dan dokumen pendukung dikelola secara terpusat di sistem, bukan tersebar di spreadsheet atau chat pribadi. Setiap perusahaan memakai ruang data (tenant) yang terpisah dari perusahaan lain di platform SmartSales.",
            },
            {
                q: "Bagaimana keluhan nasabah, misalnya kartu ATM tertelan atau transfer gagal, ditangani?",
                a: "Keluhan yang masuk lewat WhatsApp bisa langsung diubah menjadi tiket lewat modul CRM Services & Ticket Creation, lalu dieskalasi ke divisi terkait (misalnya IT atau Verifikator) dengan status dan batas waktu penyelesaian yang jelas.",
            },
            {
                q: "Bisakah tahapan pipeline disesuaikan dengan proses internal kami, misalnya survei dan BI Checking?",
                a: "Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang dapat disesuaikan, mulai dari nama tahapan pipeline, kolom data calon debitur, hingga template pesan otomatis, mengikuti alur kerja yang sudah berjalan di institusi Anda.",
            },
            {
                q: "Apakah SmartSales bisa diintegrasikan dengan sistem inti (core banking) atau sistem internal kami?",
                a: "Kebutuhan integrasi dengan sistem internal seperti core banking dibahas sebagai custom build sesuai kompleksitas sistem Anda. Silakan konsultasikan kebutuhan spesifik ini dengan tim kami melalui WhatsApp.",
            },
            {
                q: "Bagaimana proses onboarding tim kami ke SmartSales?",
                a: "Setelah mendaftar, tim kami membantu proses setup awal seperti pengaturan pipeline, penyambungan nomor WhatsApp Business API, dan pengenalan fitur ke tim sales maupun customer service Anda.",
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk lembaga keuangan?",
                a: "Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services, dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat di halaman harga kami.",
            },
            {
                q: "Apakah ada uji coba gratis sebelum berlangganan?",
                a: "Ada. Anda bisa memulai uji coba gratis 14 hari atau konsultasi langsung dengan tim kami untuk melihat apakah alur pipeline kredit, Omnichannel WhatsApp, dan ticketing di SmartSales sesuai kebutuhan institusi Anda.",
            },
        ],
    },
    en: {
        subtitle: "FREQUENTLY ASKED QUESTIONS",
        title: "SmartSales FAQ for Financial Institutions",
        desc: "The questions banks, cooperatives, and multifinance companies ask most often before starting with SmartSales.",
        faqs: [
            {
                q: "Is SmartSales suitable for banks, cooperatives, or multifinance companies?",
                a: "Yes. The CRM Sales, Omnichannel WhatsApp, and CRM Services (ticketing) modules are built generically to manage credit prospects and customer communication, so they work for banks, savings and loan cooperatives, and multifinance or financing companies alike.",
            },
            {
                q: "How is the credit application process managed in SmartSales?",
                a: "Each prospective debtor appears as a card in CRM Sales with a visual pipeline, from new prospect, to verification (BI Checking), through approved and ready to disburse. Your team can immediately see which stage every application is in.",
            },
            {
                q: "Is the WhatsApp number an official company number, not a salesperson's personal phone?",
                a: "Correct. SmartSales integrates with the official WhatsApp Business API, so one company WhatsApp number can be shared across the whole team, with chat history recorded in the system rather than only stored on a personal phone.",
            },
            {
                q: "How is customer data and documents such as ID cards or tax numbers kept secure?",
                a: "Customer data and supporting documents are managed centrally in the system instead of being scattered across spreadsheets or personal chats. Each company uses a separate data space (tenant) from other companies on the SmartSales platform.",
            },
            {
                q: "How are customer complaints, such as a swallowed ATM card or a failed transfer, handled?",
                a: "Complaints coming in via WhatsApp can be turned directly into a ticket through the CRM Services & Ticket Creation module, then escalated to the relevant division (for example IT or Verification) with a clear status and resolution deadline.",
            },
            {
                q: "Can the pipeline stages be adjusted to our internal process, such as survey and BI Checking?",
                a: "Yes. SmartSales is multi-tenant with configurable settings, from pipeline stage names, prospective debtor data fields, to automated message templates, matching the workflow already in place at your institution.",
            },
            {
                q: "Can SmartSales be integrated with our core banking or other internal systems?",
                a: "Integration needs with internal systems such as core banking are discussed as a custom build depending on the complexity of your system. Please discuss your specific needs with our team via WhatsApp.",
            },
            {
                q: "What does the onboarding process to SmartSales look like?",
                a: "After signing up, our team helps with initial setup such as configuring the pipeline, connecting your WhatsApp Business API number, and introducing the features to your sales and customer service teams.",
            },
            {
                q: "How much does a SmartSales subscription cost for financial institutions?",
                a: "SmartSales pricing tiers are the same across industries, covering CRM Sales, CRM Services, and Omnichannel WhatsApp. The latest package details and pricing are available on our pricing page.",
            },
            {
                q: "Is there a free trial before subscribing?",
                a: "Yes. You can start a 14-day free trial or consult directly with our team to see whether SmartSales' credit pipeline, Omnichannel WhatsApp, and ticketing flow fit your institution's needs.",
            },
        ],
    },
};

export default function FinanceFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    const [expanded, setExpanded] = React.useState<number | false>(0);

    const handleChange = (panel: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
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

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {t.faqs.map((item, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === index}
                            onChange={handleChange(index)}
                            elevation={0}
                            disableGutters
                            sx={{
                                borderRadius: '16px !important',
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                bgcolor: expanded === index ? '#F5F8FF' : 'white',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#3854D6' }} />}
                                sx={{ px: { xs: 2.5, md: 3 }, py: 1 }}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                sx={{ px: { xs: 2.5, md: 3 }, pb: 3, pt: 0 }}
                                id={`faq-panel-${index}`}
                                aria-labelledby={`faq-summary-${index}`}
                            >
                                <Typography sx={{ color: '#4B5563', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {item.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </Container>
        </Box>
    );
}
