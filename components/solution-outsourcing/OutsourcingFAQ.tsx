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
        title: 'Pertanyaan Seputar SmartSales untuk Outsourcing',
        subtitle: 'Hal-hal yang biasanya ditanyakan tim HR dan operasional sebelum beralih dari spreadsheet dan WhatsApp pribadi.',
        faqs: [
            {
                q: 'Bagaimana SmartSales membantu mengelola ribuan data kandidat sekaligus?',
                a: 'Semua data pelamar tersimpan dalam satu database CRM, bukan lagi tersebar di chat WhatsApp pribadi HR. Anda bisa mengategorikan kandidat berdasarkan skill, lokasi, dan status ketersediaan (Standby, Sedang Ditempatkan), sehingga pencarian saat ada permintaan mendadak dari klien jadi jauh lebih cepat.',
            },
            {
                q: 'Apakah SmartSales bisa mengelola pipeline akuisisi klien B2B, bukan hanya kandidat?',
                a: 'Bisa. CRM Sales digunakan untuk dua hal sekaligus: melacak Sales Pipeline calon klien perusahaan (B2B) agar tidak ada leads yang terlewat follow up, dan mengelola status ribuan pelamar atau pekerja aktif dalam database yang sama.',
            },
            {
                q: 'Bagaimana cara mengirim pengumuman ke ratusan pekerja lapangan sekaligus?',
                a: 'Gunakan fitur Broadcast melalui WhatsApp Business API resmi untuk mengirim info lowongan baru, perubahan jadwal shift, atau pengumuman payroll ke ratusan nomor sekaligus, tanpa risiko nomor WhatsApp diblokir seperti pada WhatsApp Group biasa.',
            },
            {
                q: 'Apakah pertanyaan umum dari pelamar bisa dijawab otomatis?',
                a: 'Bisa. Anda dapat mengatur Auto-Reply untuk menjawab pertanyaan yang sering diajukan pelamar, misalnya syarat dokumen lamaran atau alamat kantor untuk walk-in interview, sehingga tim HR tidak perlu membalas satu per satu secara manual.',
            },
            {
                q: 'Bagaimana proses penanganan komplain klien soal kinerja pekerja outsourcing?',
                a: 'Komplain yang masuk lewat WhatsApp, misalnya laporan pekerja absen atau kinerja buruk, langsung diubah menjadi tiket lewat fitur Ticket Creation dan dieskalasi ke Koordinator Lapangan atau Area Manager terkait, lengkap dengan target waktu penyelesaian yang bisa dipantau.',
            },
            {
                q: 'Apakah keluhan internal dari pekerja, misalnya soal BPJS atau payroll, juga bisa ditangani di sistem yang sama?',
                a: 'Bisa. Modul ticketing yang sama juga dipakai untuk menangani keluhan internal pekerja seperti masalah BPJS atau kesalahan perhitungan payroll, sehingga penanganannya terstruktur dan tidak hilang di chat pribadi.',
            },
            {
                q: 'Apakah kami akan mendapat pengingat otomatis untuk kontrak klien atau masa percobaan pekerja yang akan habis?',
                a: 'Ya. SmartSales bisa mengirim pengingat otomatis ke WhatsApp tim operasional saat kontrak kerja sama dengan klien mendekati tanggal habis, atau saat masa percobaan (probation) seorang pekerja akan berakhir.',
            },
            {
                q: 'Apakah alur kerja SmartSales bisa disesuaikan dengan proses rekrutmen kami saat ini?',
                a: 'Bisa. SmartSales bersifat multi-tenant dengan pengaturan yang dapat disesuaikan, mulai dari tahapan pipeline rekrutmen (misalnya kandidat baru, interview, penempatan), kolom data pekerja, hingga alur eskalasi tiket komplain, mengikuti proses yang sudah berjalan di perusahaan Anda.',
            },
            {
                q: 'Apakah data kandidat dan klien kami aman jika disimpan di SmartSales?',
                a: 'Data disimpan dalam database milik akun perusahaan Anda sendiri (multi-tenant), terpisah dari perusahaan lain yang juga menggunakan SmartSales, dan hanya bisa diakses oleh anggota tim yang Anda beri izin sesuai peran masing-masing.',
            },
            {
                q: 'Berapa biaya berlangganan SmartSales untuk perusahaan outsourcing?',
                a: 'Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat langsung di halaman harga kami.',
            },
            {
                q: 'Apakah ada uji coba gratis sebelum berlangganan?',
                a: 'Ada. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami untuk melihat apakah alur pengelolaan kandidat, klien, dan komplain di SmartSales sesuai dengan kebutuhan perusahaan outsourcing Anda.',
            },
            {
                q: 'Berapa lama waktu yang dibutuhkan untuk mulai menggunakan SmartSales?',
                a: 'Setelah akun aktif, tim Anda bisa mulai memasukkan data kandidat dan klien, serta menghubungkan nomor WhatsApp Business API, dalam waktu singkat. Untuk kebutuhan penyesuaian alur kerja yang lebih spesifik, tim kami akan membantu proses konfigurasinya.',
            },
        ],
    },
    en: {
        badge: 'FREQUENTLY ASKED QUESTIONS',
        title: 'Questions About SmartSales for Outsourcing Companies',
        subtitle: 'Common questions from HR and operations teams before moving away from spreadsheets and personal WhatsApp chats.',
        faqs: [
            {
                q: 'How does SmartSales help manage thousands of candidate records at once?',
                a: 'All applicant data is stored in one CRM database instead of scattered across HR\'s personal WhatsApp chats. You can categorize candidates by skill, location, and availability status (Standby, Deployed), making candidate search much faster when a client requests staff on short notice.',
            },
            {
                q: 'Can SmartSales manage a B2B client acquisition pipeline, not just candidates?',
                a: 'Yes. CRM Sales serves two purposes at once: tracking the Sales Pipeline for prospective B2B clients so no leads fall through the cracks, and managing the status of thousands of applicants or active workers in the same database.',
            },
            {
                q: 'How do we send announcements to hundreds of field workers at once?',
                a: 'Use the Broadcast feature through the official WhatsApp Business API to send new job openings, shift schedule changes, or payroll announcements to hundreds of numbers at once, without the risk of a number getting blocked like with regular WhatsApp Groups.',
            },
            {
                q: 'Can common questions from applicants be answered automatically?',
                a: 'Yes. You can set up Auto-Reply to answer frequently asked applicant questions, such as required documents or the office address for walk-in interviews, so the HR team doesn\'t need to reply to each one manually.',
            },
            {
                q: 'How are client complaints about outsourced worker performance handled?',
                a: 'Complaints received via WhatsApp, such as reports of an absent worker or poor performance, are converted directly into a ticket using the Ticket Creation feature and escalated to the relevant Field Coordinator or Area Manager, complete with a resolution target you can track.',
            },
            {
                q: 'Can internal worker complaints, like BPJS or payroll issues, be handled in the same system?',
                a: 'Yes. The same ticketing module is also used to handle internal worker complaints such as BPJS issues or payroll calculation errors, so handling stays structured instead of getting lost in personal chats.',
            },
            {
                q: 'Will we get automatic reminders for expiring client contracts or worker probation periods?',
                a: 'Yes. SmartSales can send automatic reminders to the operational team\'s WhatsApp when a client cooperation contract is approaching its end date, or when a worker\'s probation period is about to end.',
            },
            {
                q: 'Can SmartSales\'s workflow be adjusted to match our current recruitment process?',
                a: 'Yes. SmartSales is multi-tenant with adjustable settings, from recruitment pipeline stages (e.g. new candidates, interview, placement), worker data fields, to complaint ticket escalation flows, matching the process already running in your company.',
            },
            {
                q: 'Is our candidate and client data safe if stored in SmartSales?',
                a: 'Data is stored in a database belonging to your own company account (multi-tenant), separate from other companies also using SmartSales, and can only be accessed by team members you grant permission to based on their role.',
            },
            {
                q: 'How much does SmartSales cost for an outsourcing company?',
                a: 'SmartSales\'s package structure is the same across industries, covering the CRM Sales, CRM Services (ticketing), and Omnichannel WhatsApp modules. See our pricing page for the latest package details and rates.',
            },
            {
                q: 'Is there a free trial before subscribing?',
                a: 'Yes. You can start a free trial or consult directly with our team first to see whether SmartSales\'s candidate, client, and complaint management flow fits your outsourcing company\'s needs.',
            },
            {
                q: 'How long does it take to get started with SmartSales?',
                a: 'Once your account is active, your team can start entering candidate and client data and connect your WhatsApp Business API number right away. For more specific workflow customization needs, our team will help with the configuration process.',
            },
        ],
    },
} as const;

export default function OutsourcingFAQ() {
    const { language } = useLanguage();
    const copy = COPY[language];

    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="md">
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

                <Box>
                    {copy.faqs.map((faq, index) => (
                        <Accordion
                            key={index}
                            expanded={expanded === `panel${index}`}
                            onChange={handleChange(`panel${index}`)}
                            elevation={0}
                            sx={{
                                mb: 2,
                                borderRadius: '16px !important',
                                bgcolor: 'white',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                                '&:before': { display: 'none' },
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--brand-deep)' }} />}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails id={`faq-panel-${index}`} aria-labelledby={`faq-summary-${index}`} sx={{ px: 3, pb: 3 }}>
                                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7 }}>
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
