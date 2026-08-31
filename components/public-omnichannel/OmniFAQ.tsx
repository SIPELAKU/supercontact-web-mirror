"use client";

import React from "react";
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        title: "Pertanyaan Seputar Omnichannel",
        faqs: [
            {
                q: "Apa itu Omnichannel dalam SmartSales?",
                a: "Omnichannel SmartSales adalah kotak masuk terpadu yang menggabungkan pesan dari WhatsApp Business API, Instagram DM, dan Email ke dalam satu dashboard, sehingga tim tidak perlu berpindah aplikasi untuk membalas pelanggan.",
            },
            {
                q: "Apakah WhatsApp yang terhubung adalah WhatsApp Business API resmi?",
                a: "Ya. Integrasi WhatsApp menggunakan WhatsApp Business API resmi, bukan versi modifikasi atau tidak resmi, sehingga nomor bisnis Anda lebih aman dari risiko pemblokiran.",
            },
            {
                q: "Bagaimana cara mengubah chat menjadi tiket atau pipeline sales?",
                a: "Dari panel chat, agen bisa langsung membuat tiket dukungan atau pipeline sales dengan satu klik, tanpa perlu menyalin data secara manual ke sistem lain.",
            },
            {
                q: "Apakah pesan bisa didistribusikan otomatis ke agen tertentu?",
                a: "Bisa. Pesan masuk dapat dialokasikan secara otomatis (routing) berdasarkan aturan yang ditentukan, atau dibagikan secara manual oleh supervisor ke agen CS maupun Sales yang tepat.",
            },
            {
                q: "Apakah riwayat percakapan pelanggan tersimpan meskipun agen berganti?",
                a: "Ya. Seluruh riwayat percakapan tersimpan di sistem SmartSales, bukan di perangkat pribadi agen, sehingga tetap bisa diakses tim lain saat terjadi pergantian staf.",
            },
            {
                q: "Apakah ada balasan otomatis di luar jam kerja?",
                a: "Ya, tersedia fitur auto-reply dengan template untuk menyapa pelanggan atau menjawab pertanyaan umum secara instan, termasuk di luar jam operasional.",
            },
            {
                q: "Berapa biaya untuk fitur Omnichannel ini?",
                a: "Fitur Omnichannel termasuk dalam paket SmartSales. Detail paket dan harga lengkap bisa dilihat di halaman harga kami.",
            },
            {
                q: "Apakah SmartSales bisa disesuaikan dengan alur kerja tim kami?",
                a: "Ya, SmartSales dibangun dengan arsitektur multi-tenant dan mendukung custom build untuk kebutuhan alur kerja spesifik bisnis Anda.",
            },
            {
                q: "Apakah data percakapan pelanggan kami aman?",
                a: "Data percakapan disimpan di infrastruktur SmartSales dengan akses berbasis peran (role-based), sehingga hanya anggota tim yang berwenang yang bisa melihat percakapan tertentu.",
            },
            {
                q: "Apakah tersedia trial gratis untuk mencoba Omnichannel?",
                a: "Ya — Anda bisa mencoba SmartSales secara gratis dengan mendaftar sendiri di smartsales.id/register, tanpa kartu kredit. Masa trial berlaku 30 hari; bila butuh pendampingan, tim kami siap membantu melalui WhatsApp.",
            },
            {
                q: "Selain WhatsApp dan Instagram, saluran apa lagi yang bisa masuk ke satu inbox ini?",
                a: "Selain WhatsApp Business API dan Instagram DM, Email dan live chat website juga bisa masuk ke inbox yang sama.",
            },
            {
                q: "Apakah bisa melihat siapa yang sedang membalas pelanggan tertentu?",
                a: "Ya, tim bisa melihat percakapan mana yang sedang ditangani agen tertentu, sehingga menghindari dua orang membalas pelanggan yang sama secara bersamaan.",
            },
        ],
    },
    en: {
        title: "Frequently Asked Questions About Omnichannel",
        faqs: [
            {
                q: "What is Omnichannel in SmartSales?",
                a: "SmartSales Omnichannel is a unified inbox that combines messages from the WhatsApp Business API, Instagram DM, and Email into one dashboard, so your team doesn't need to switch apps to reply to customers.",
            },
            {
                q: "Is the connected WhatsApp the official WhatsApp Business API?",
                a: "Yes. The WhatsApp integration uses the official WhatsApp Business API, not a modified or unofficial version, keeping your business number safer from blocking risks.",
            },
            {
                q: "How do I turn a chat into a ticket or sales pipeline?",
                a: "From the chat panel, agents can create a support ticket or sales pipeline with one click, without manually copying data into another system.",
            },
            {
                q: "Can messages be routed automatically to a specific agent?",
                a: "Yes. Incoming messages can be routed automatically based on rules you set, or assigned manually by a supervisor to the right CS or Sales agent.",
            },
            {
                q: "Is conversation history kept if an agent leaves?",
                a: "Yes. All conversation history is stored in SmartSales, not on an agent's personal device, so it stays accessible to the team even when staff changes.",
            },
            {
                q: "Is there an auto-reply outside business hours?",
                a: "Yes, an auto-reply feature with templates is available to greet customers or answer common questions instantly, including outside operating hours.",
            },
            {
                q: "How much does the Omnichannel feature cost?",
                a: "Omnichannel is included in SmartSales plans. Full plan and pricing details are on our pricing page.",
            },
            {
                q: "Can SmartSales be customized to our team's workflow?",
                a: "Yes, SmartSales is built on a multi-tenant architecture and supports custom builds for your specific business workflow.",
            },
            {
                q: "Is our customer conversation data safe?",
                a: "Conversation data is stored on SmartSales infrastructure with role-based access, so only authorized team members can view specific conversations.",
            },
            {
                q: "Is a free trial available to try Omnichannel?",
                a: "Yes — you can try SmartSales for free by signing up yourself at smartsales.id/register, no credit card required. The trial runs for 30 days, and our team is happy to help over WhatsApp if you'd like guidance.",
            },
            {
                q: "Besides WhatsApp and Instagram, what other channels can come into this one inbox?",
                a: "Besides the WhatsApp Business API and Instagram DM, Email and website live chat can also flow into the same inbox.",
            },
            {
                q: "Can I see who is currently replying to a specific customer?",
                a: "Yes, the team can see which conversation is being handled by which agent, avoiding two people replying to the same customer at once.",
            },
        ],
    },
};

export default function OmniFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];
    const [expanded, setExpanded] = React.useState<string | false>("panel0");

    const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#F8FAFC" }}>
            <Container maxWidth="md">
                <Typography
                    variant="h2"
                    component="h2"
                    sx={{
                        fontWeight: 800,
                        fontSize: { xs: "2rem", md: "2.5rem" },
                        color: "#0F172A",
                        textAlign: "center",
                        mb: 6,
                    }}
                >
                    {t.title}
                </Typography>

                {t.faqs.map((faq, index) => (
                    <Accordion
                        key={index}
                        expanded={expanded === `panel${index}`}
                        onChange={handleChange(`panel${index}`)}
                        elevation={0}
                        sx={{
                            mb: 1.5,
                            borderRadius: "16px !important",
                            border: "1px solid #E2E8F0",
                            "&:before": { display: "none" },
                            bgcolor: "white",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            id={`faq-summary-${index}`}
                            aria-controls={`faq-panel-${index}`}
                        >
                            <Typography sx={{ fontWeight: 700, color: "#0F172A" }}>{faq.q}</Typography>
                        </AccordionSummary>
                        <AccordionDetails id={`faq-panel-${index}`} aria-labelledby={`faq-summary-${index}`}>
                            <Typography variant="body2" sx={{ color: "#475569", lineHeight: 1.7 }}>
                                {faq.a}
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Container>
        </Box>
    );
}
