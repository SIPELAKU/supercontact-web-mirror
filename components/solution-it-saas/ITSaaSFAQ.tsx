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
        title: 'Pertanyaan Seputar Solusi IT & SaaS',
        subtitle: 'Hal-hal yang biasa ditanyakan tim sales dan support perusahaan IT sebelum menggunakan SmartSales.',
        faqs: [
            {
                q: 'Apakah SmartSales bisa terhubung dengan nomor WhatsApp Business kami yang sudah punya centang hijau?',
                a: 'Bisa. SmartSales menggunakan WhatsApp Business API resmi, sehingga nomor WhatsApp perusahaan Anda yang sudah terverifikasi (centang hijau) bisa dijadikan Helpdesk Center dan dipakai bersama oleh seluruh tim support (L1/L2) dari satu dashboard.',
            },
            {
                q: 'Bagaimana SmartSales membantu tim sales B2B kami memantau proyek yang sedang dinegosiasikan?',
                a: 'Tim sales bisa memakai Pipeline Kanban di modul CRM Sales untuk memantau setiap tahap, mulai dari Lead/Discovery, Demo & Proposal, hingga Closed Won, lengkap dengan pengingat follow-up untuk jadwal Proof of Concept (PoC) atau pengiriman draft kontrak.',
            },
            {
                q: 'Bagaimana laporan bug atau server down dari klien diubah menjadi tiket kerja untuk tim Engineering?',
                a: 'Keluhan yang masuk lewat WhatsApp bisa langsung diubah menjadi tiket lewat fitur Ticket Creation, lalu dieskalasi dari agen Level 1 (CS) ke tim Engineering/Developer (Level 2/3) dengan status Open, In Progress, atau Resolved yang bisa dipantau sampai selesai.',
            },
            {
                q: 'Apakah dokumen legal proyek seperti MOU, NDA, atau SPK bisa disimpan di SmartSales?',
                a: 'Bisa. Dokumen-dokumen tersebut dapat disimpan langsung di database klien pada modul CRM Sales, jadi tidak tersebar di email atau folder pribadi masing-masing sales.',
            },
            {
                q: 'Apakah tim Engineering kami tetap perlu login ke sistem yang sama dengan tim CS/support?',
                a: 'Tidak harus. Biasanya tim CS dan sales B2B memakai dashboard utama SmartSales, sementara eskalasi ke tim Engineering dikirim sebagai tiket kerja dengan konteks lengkap dari percakapan klien, sehingga tim teknis cukup memantau tiket yang relevan dengan tugasnya.',
            },
            {
                q: 'Jika tim kami masih memakai Jira atau Trello untuk tracking internal, apakah tiket dari SmartSales bisa otomatis masuk ke sana?',
                a: 'Fitur Ticket Creation di SmartSales fokus mengubah keluhan WhatsApp menjadi tiket internal yang bisa dipantau tim Anda. Jika Anda masih menggunakan Jira/Trello secara terpisah untuk tracking teknis, silakan diskusikan kebutuhan tersebut dengan tim kami untuk melihat opsi yang paling sesuai.',
            },
            {
                q: 'Apakah Auto-Reply bisa dipakai untuk memberi tahu jadwal maintenance rutin ke klien?',
                a: 'Bisa. Auto-Reply dapat dikonfigurasi untuk mengirimkan info jadwal maintenance rutin atau dokumentasi API secara otomatis saat klien menghubungi nomor WhatsApp Helpdesk Anda, sehingga tim support tidak perlu membalas satu per satu.',
            },
            {
                q: 'Apakah data klien dan riwayat komunikasi kami aman di SmartSales?',
                a: 'Setiap perusahaan berjalan di lingkungan multi-tenant yang terpisah, jadi data klien B2B, dokumen proyek, dan riwayat percakapan WhatsApp perusahaan Anda tidak tercampur dengan perusahaan lain di sistem.',
            },
            {
                q: 'Berapa biaya berlangganan SmartSales untuk perusahaan IT atau SaaS?',
                a: 'Struktur paket dan harga terbaru bisa dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan jumlah tim sales dan support Anda lewat konsultasi langsung.',
            },
            {
                q: 'Apakah alur pipeline sales dan tahapan tiket bisa disesuaikan dengan proses kami yang sudah berjalan?',
                a: 'Bisa. Tahapan pipeline proyek, kolom status tiket, dan alur eskalasi ke tim Engineering dapat dikustomisasi (custom build) mengikuti proses bisnis IT atau SaaS yang sudah Anda jalankan.',
            },
            {
                q: 'Apakah ada uji coba sebelum berlangganan?',
                a: 'Ada. Anda bisa mulai dengan uji coba gratis lewat tombol yang tersedia di halaman ini untuk mencoba alur pipeline sales, Helpdesk WhatsApp, dan Ticket Creation sebelum memutuskan berlangganan.',
            },
        ],
    },
    en: {
        badge: 'FAQ',
        title: 'Questions About the IT & SaaS Solution',
        subtitle: 'Common questions from IT company sales and support teams before they start using SmartSales.',
        faqs: [
            {
                q: 'Can SmartSales connect to our WhatsApp Business number that already has the green checkmark?',
                a: 'Yes. SmartSales uses the official WhatsApp Business API, so your already-verified (green checkmark) company number can be turned into a Helpdesk Center and shared by your entire support team (L1/L2) from one dashboard.',
            },
            {
                q: 'How does SmartSales help our B2B sales team track projects that are still being negotiated?',
                a: 'Your sales team can use the Kanban Pipeline in the CRM Sales module to track every stage, from Lead/Discovery to Demo & Proposal through to Closed Won, complete with follow-up reminders for Proof of Concept (PoC) schedules or sending draft contracts.',
            },
            {
                q: 'How does a client-reported bug or server-down issue turn into a work ticket for our Engineering team?',
                a: 'Complaints coming in through WhatsApp can be converted directly into a ticket via the Ticket Creation feature, then escalated from a Level 1 agent (CS) to the Engineering/Developer team (Level 2/3) with a status of Open, In Progress, or Resolved that can be tracked to completion.',
            },
            {
                q: 'Can project legal documents such as MOUs, NDAs, or work orders be stored in SmartSales?',
                a: 'Yes. These documents can be stored directly in the client database inside the CRM Sales module, so they are not scattered across email or individual sales reps\' personal folders.',
            },
            {
                q: 'Does our Engineering team still need to log into the same system as CS/support?',
                a: 'Not necessarily. CS and B2B sales teams typically use the main SmartSales dashboard, while escalations to Engineering are sent as work tickets with full context from the client conversation, so the technical team only needs to monitor tickets relevant to their work.',
            },
            {
                q: 'If our team still uses Jira or Trello for internal tracking, do SmartSales tickets sync there automatically?',
                a: 'The Ticket Creation feature in SmartSales focuses on turning WhatsApp complaints into internal tickets your team can monitor. If you still use Jira/Trello separately for technical tracking, please discuss that need with our team so we can look at the best option for you.',
            },
            {
                q: 'Can Auto-Reply be used to notify clients about routine maintenance schedules?',
                a: 'Yes. Auto-Reply can be configured to automatically send routine maintenance schedules or API documentation when a client messages your Helpdesk WhatsApp number, so your support team doesn\'t have to reply to each one manually.',
            },
            {
                q: 'Is our client data and communication history safe with SmartSales?',
                a: 'Every company runs in a separate multi-tenant environment, so your B2B client data, project documents, and WhatsApp conversation history are never mixed with other companies on the system.',
            },
            {
                q: 'How much does SmartSales cost for an IT or SaaS company?',
                a: 'Current package pricing is available on the /price page. Our team can also help recommend a suitable plan based on your sales and support team size through a direct consultation.',
            },
            {
                q: 'Can the sales pipeline and ticket stages be customized to fit our existing process?',
                a: 'Yes. Project pipeline stages, ticket status columns, and the escalation flow to Engineering can be customized (custom build) to match the IT or SaaS business process you already run.',
            },
            {
                q: 'Is there a trial before subscribing?',
                a: 'Yes. You can start with a free trial using the button on this page to try out the sales pipeline, WhatsApp Helpdesk, and Ticket Creation flow before deciding to subscribe.',
            },
        ],
    },
};

export default function ITSaaSFAQ() {
    const { language } = useLanguage();
    const copy = COPY[language];

    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange =
        (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
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
                            textTransform: 'uppercase',
                        }}
                    >
                        {copy.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: '#111827',
                            fontSize: { xs: '1.75rem', md: '2.25rem' },
                            mb: 2,
                        }}
                    >
                        {copy.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: '#4B5563', fontSize: { xs: '1rem', md: '1.05rem' } }}
                    >
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
                                border: '1px solid #E2E8F0',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                    borderColor: '#597CFF',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#3854D6' }} />}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails id={`faq-panel-${index}`} aria-labelledby={`faq-summary-${index}`} sx={{ px: 3, pb: 3 }}>
                                <Typography sx={{ color: '#4B5563', lineHeight: 1.7, fontSize: '0.95rem' }}>
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
