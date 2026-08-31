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
        badge: 'FAQ',
        title: 'Pertanyaan Seputar Ticket Creation',
        subtitle: 'Hal-hal yang biasa ditanyakan tim CS dan support sebelum mulai memakai fitur pembuatan tiket dari chat.',
        faqs: [
            {
                q: 'Bagaimana cara membuat tiket dari sebuah chat?',
                a: 'Agen CS cukup membuat tiket langsung dari jendela chat yang sedang berlangsung, tanpa membuka tab atau aplikasi baru. Transkrip percakapan otomatis ikut terlampir ke tiket, jadi tim yang menangani tidak perlu meminta ulang riwayat chat ke pelanggan.',
            },
            {
                q: 'Apa saja status yang bisa dipantau pada sebuah tiket?',
                a: 'Setiap tiket memiliki status Open, In Progress, atau Resolved. Status ini bisa dipantau oleh agen maupun atasan tim untuk memastikan tidak ada keluhan pelanggan yang terlalu lama menunggu penyelesaian.',
            },
            {
                q: 'Bisakah tiket diteruskan ke tim atau departemen lain?',
                a: 'Bisa. Tiket dari tim CS depan (frontline) dapat dieskalasi ke tim teknis, gudang, atau finance sesuai jenis masalahnya, tanpa kehilangan konteks percakapan asli karena transkrip chat tetap melekat pada tiket.',
            },
            {
                q: 'Apakah chat penjualan juga bisa diubah jadi tiket?',
                a: 'Bisa. Chat dari prospek yang menanyakan harga atau produk dapat diubah menjadi tiket Peluang Penjualan (Lead) dan langsung masuk ke Pipeline CRM Sales, sehingga tidak perlu dicatat ulang secara manual.',
            },
            {
                q: 'Apa itu SLA pada fitur ini dan bagaimana cara kerjanya?',
                a: 'SLA adalah batas waktu penyelesaian yang bisa diatur untuk setiap tiket keluhan. Jika sebuah tiket melewati batas waktu yang ditentukan, sistem akan memberi peringatan agar tim terkait segera menindaklanjutinya.',
            },
            {
                q: 'Ke mana riwayat tiket pelanggan tersimpan?',
                a: 'Semua tiket yang pernah dibuat untuk seorang pelanggan tersimpan di profil pelanggan tersebut. Agen CS bisa melihat riwayat keluhan sebelumnya sebelum merespons chat yang baru masuk.',
            },
            {
                q: 'Apakah fitur ini terhubung dengan WhatsApp Business API?',
                a: 'Ya. Ticket Creation berjalan di atas Inbox Omnichannel yang menerima chat pelanggan termasuk dari WhatsApp Business API, sehingga tiket bisa dibuat langsung dari percakapan yang sedang berlangsung di sana.',
            },
            {
                q: 'Apakah kategori atau alur tiket bisa disesuaikan dengan tim kami?',
                a: 'Tim kami dapat membantu menyesuaikan kategori tiket, tujuan eskalasi antar departemen, dan pengaturan SLA agar mengikuti struktur tim CS, support, sales, dan operasional yang sudah berjalan di perusahaan Anda.',
            },
            {
                q: 'Apakah data tiket dan chat pelanggan kami aman?',
                a: 'Setiap perusahaan memiliki ruang data tersendiri (multi-tenant) yang terpisah dari perusahaan lain. Akses ke tiket dan riwayat chat diatur berdasarkan peran pengguna, sehingga agen bisa dibatasi hanya melihat tiket timnya sendiri jika diperlukan.',
            },
            {
                q: 'Berapa biaya untuk menggunakan fitur Ticket Creation ini?',
                a: 'Detail paket dan harga dapat dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan volume tiket dan jumlah agen di tim Anda.',
            },
            {
                q: 'Apakah ada uji coba sebelum berlangganan?',
                a: 'Silakan hubungi tim kami melalui WhatsApp untuk menanyakan opsi uji coba yang tersedia saat ini, karena ketentuannya bisa berbeda tergantung kebutuhan dan jumlah pengguna.',
            },
            {
                q: 'Bagaimana cara memulai jika kami tertarik?',
                a: 'Cara tercepat: daftar trial gratis secara mandiri di smartsales.id/register (tanpa kartu kredit, masa trial 14 hari). Ingin didampingi? Klik tombol WhatsApp di halaman ini — tim kami bantu memahami alur eskalasi dan SLA tim CS Anda saat ini, lalu menjelaskan langkah selanjutnya.',
            },
        ],
    },
    en: {
        badge: 'FAQ',
        title: 'Frequently Asked Questions About Ticket Creation',
        subtitle: 'Common questions from CS and support teams before adopting the chat-to-ticket feature.',
        faqs: [
            {
                q: 'How do I create a ticket from a chat?',
                a: 'A CS agent can create a ticket directly from the active chat window, without opening a new tab or app. The conversation transcript is automatically attached to the ticket, so the team handling it doesn\'t need to ask the customer for the chat history again.',
            },
            {
                q: 'What statuses can a ticket be tracked with?',
                a: 'Every ticket has a status of Open, In Progress, or Resolved. Agents and team leads can monitor this status to make sure no customer complaint waits too long for resolution.',
            },
            {
                q: 'Can a ticket be forwarded to another team or department?',
                a: 'Yes. Tickets from the frontline CS team can be escalated to technical, warehouse, or finance teams depending on the issue, without losing context since the original chat transcript stays attached to the ticket.',
            },
            {
                q: 'Can a sales chat also be turned into a ticket?',
                a: 'Yes. A chat from a prospect asking about pricing or products can be converted into a Sales Opportunity (Lead) ticket and placed directly into the CRM Sales Pipeline, so it doesn\'t need to be re-entered manually.',
            },
            {
                q: 'What is the SLA feature and how does it work?',
                a: 'SLA is a resolution deadline that can be set for each complaint ticket. If a ticket passes its deadline, the system sends an alert so the responsible team can follow up right away.',
            },
            {
                q: 'Where is a customer\'s ticket history stored?',
                a: 'Every ticket ever created for a customer is saved on that customer\'s profile. CS agents can review past complaint history before responding to a new incoming chat.',
            },
            {
                q: 'Does this feature connect with the WhatsApp Business API?',
                a: 'Yes. Ticket Creation runs on top of the Omnichannel Inbox, which receives customer chats including from the WhatsApp Business API, so tickets can be created directly from an ongoing conversation there.',
            },
            {
                q: 'Can ticket categories or workflows be customized for our team?',
                a: 'Our team can help customize ticket categories, escalation targets between departments, and SLA settings to match the CS, support, sales, and operations structure your company already uses.',
            },
            {
                q: 'Is our ticket and chat data safe?',
                a: 'Each company gets its own isolated data space (multi-tenant), separate from other companies. Access to tickets and chat history is controlled by user roles, so agents can be restricted to only their own team\'s tickets if needed.',
            },
            {
                q: 'How much does the Ticket Creation feature cost?',
                a: 'Plan and pricing details are available on the /price page. Our team can also help recommend a plan based on your ticket volume and number of agents.',
            },
            {
                q: 'Is there a trial before subscribing?',
                a: 'Please reach out to our team via WhatsApp to ask about the trial options currently available, as terms may vary based on your needs and user count.',
            },
            {
                q: 'How do we get started if we\'re interested?',
                a: 'The fastest way: sign up for the free trial yourself at smartsales.id/register (no credit card, 14-day trial). Prefer guidance? Click the WhatsApp button on this page — our team will help map your CS team\'s current escalation flow and SLA needs, then walk you through the next steps.',
            },
        ],
    },
};

export default function TicketFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    const [expanded, setExpanded] = React.useState<string | false>('panel0');

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
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
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '600px', mx: 'auto' }}>
                        {t.subtitle}
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#3854D6' }} />}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                id={`faq-panel-${index}`}
                                aria-labelledby={`faq-summary-${index}`}
                                sx={{ px: 3, pb: 3 }}
                            >
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
