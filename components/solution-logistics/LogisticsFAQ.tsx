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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "FAQ",
        title: "Pertanyaan Seputar Solusi Logistik",
        subtitle: "Hal-hal yang biasanya ditanyakan tim ekspedisi dan logistik sebelum mulai pakai SmartSales.",
        faqs: [
            {
                q: "Apakah SmartSales bisa terhubung dengan nomor WhatsApp Business yang sudah punya centang hijau?",
                a: "Bisa. SmartSales menggunakan WhatsApp Business API resmi, jadi nomor ekspedisi Anda yang sudah terverifikasi (centang hijau) dapat dihubungkan langsung ke dasbor untuk melayani cek resi, tanya tarif, dan komplain dalam satu layar.",
            },
            {
                q: "Bagaimana cara mengatur jadwal pickup untuk klien korporat?",
                a: "Jadwal pickup diatur lewat modul CRM Sales. Setiap permintaan penjemputan dari klien B2B dicatat sebagai kartu dengan status visual (Terjadwal, Dalam Proses, Selesai), sehingga admin dan kurir tahu jadwal harian tanpa perlu buku catatan atau spreadsheet terpisah.",
            },
            {
                q: "Apakah Auto-Reply bisa menjawab pertanyaan tarif ongkir secara otomatis?",
                a: "Bisa. Auto-Reply dapat dikonfigurasi untuk menjawab pertanyaan umum seperti cek resi atau tarif ongkir 24/7, sehingga tim CS hanya perlu turun tangan untuk kasus yang butuh penanganan manusia, misalnya komplain barang rusak.",
            },
            {
                q: "Bagaimana komplain barang rusak atau salah alamat ditangani agar tidak hilang begitu saja?",
                a: "Komplain dari chat WhatsApp bisa langsung diubah menjadi tiket lewat modul Ticket Creation, lalu dieskalasi ke tim Operasional Gudang atau Koordinator Kurir dengan status Open, In Progress, atau Resolved yang bisa dipantau sampai selesai.",
            },
            {
                q: "Apakah pelanggan bisa menerima notifikasi status paket secara otomatis?",
                a: "Ya, notifikasi (blast) seperti \"paket sedang dibawa kurir\" atau perubahan status pengiriman bisa dikirim otomatis via WhatsApp, jadi pelanggan tidak perlu bertanya berulang kali ke admin.",
            },
            {
                q: "Apakah data pelanggan dan riwayat pengiriman kami aman?",
                a: "Setiap perusahaan berjalan di lingkungan multi-tenant yang terpisah, jadi data klien korporat, riwayat pengiriman, dan percakapan WhatsApp perusahaan Anda tidak tercampur dengan perusahaan lain di sistem.",
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk perusahaan logistik?",
                a: "Struktur paket dan harga terbaru bisa dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan volume pengiriman dan jumlah tim CS Anda lewat konsultasi langsung.",
            },
            {
                q: "Apakah alur kerja bisa disesuaikan dengan proses operasional kami yang sudah berjalan?",
                a: "Bisa. Tahapan pipeline, kolom status pickup/pengiriman, dan modul ticketing dapat dikustomisasi (custom build) mengikuti alur kerja gudang dan tim lapangan yang sudah Anda jalankan, tanpa memaksa Anda mengganti total proses yang ada.",
            },
            {
                q: "Apakah tim kurir dan operasional gudang juga perlu login ke sistem yang sama dengan CS?",
                a: "Tergantung kebutuhan. Umumnya tim CS dan sales korporat memakai dasbor utama, sementara eskalasi ke Operasional Gudang atau Koordinator Kurir dikirim sebagai tiket kerja, sehingga masing-masing tim cukup memantau tiket yang relevan dengan tugasnya.",
            },
            {
                q: "Apakah ada masa uji coba sebelum berlangganan?",
                a: "Ada, Anda bisa mulai dengan uji coba gratis melalui tombol yang tersedia di halaman ini untuk mencoba alur pickup, Auto-Reply, dan ticketing sebelum memutuskan berlangganan.",
            },
        ],
    },
    en: {
        badge: "FAQ",
        title: "Questions About the Logistics Solution",
        subtitle: "Common questions from shipping and logistics teams before they start using SmartSales.",
        faqs: [
            {
                q: "Can SmartSales connect to a WhatsApp Business number that already has the green checkmark?",
                a: "Yes. SmartSales uses the official WhatsApp Business API, so your already-verified (green checkmark) shipping number can be connected directly to the dashboard to handle receipt tracking, rate inquiries, and complaints in one screen.",
            },
            {
                q: "How do we schedule pickups for corporate clients?",
                a: "Pickup schedules are managed through the CRM Sales module. Every B2B pickup request is recorded as a card with a visual status (Scheduled, In Progress, Completed), so admins and couriers know the daily schedule without a separate logbook or spreadsheet.",
            },
            {
                q: "Can Auto-Reply answer shipping rate questions automatically?",
                a: "Yes. Auto-Reply can be configured to answer common questions such as receipt checks or shipping rates 24/7, so your CS team only needs to step in for cases that need a human touch, like damaged-goods complaints.",
            },
            {
                q: "How are complaints about damaged or misdelivered goods handled so they don't get lost?",
                a: "Complaints from WhatsApp chats can be converted directly into tickets through the Ticket Creation module, then escalated to the Warehouse Operations team or Courier Coordinator with a status of Open, In Progress, or Resolved that can be tracked to completion.",
            },
            {
                q: "Can customers receive automatic package status notifications?",
                a: "Yes, notifications (blasts) like \"your package is with our courier\" or shipping status changes can be sent automatically via WhatsApp, so customers don't have to keep asking admins for updates.",
            },
            {
                q: "Is our customer and shipment data safe?",
                a: "Every company runs in a separate multi-tenant environment, so your corporate client data, shipment history, and WhatsApp conversations are never mixed with other companies on the system.",
            },
            {
                q: "How much does SmartSales cost for a logistics company?",
                a: "Current package pricing is available on the /price page. Our team can also help recommend a suitable plan based on your shipment volume and CS team size through a direct consultation.",
            },
            {
                q: "Can the workflow be customized to fit our existing operational process?",
                a: "Yes. The pipeline stages, pickup/delivery status columns, and ticketing module can be customized (custom build) to match the warehouse and field team workflow you already run, without forcing you to replace your whole process.",
            },
            {
                q: "Do our couriers and warehouse operations team also need to log into the same system as CS?",
                a: "It depends on your needs. Typically the CS and corporate sales teams use the main dashboard, while escalations to Warehouse Operations or the Courier Coordinator are sent as work tickets, so each team only needs to monitor the tickets relevant to their job.",
            },
            {
                q: "Is there a trial before subscribing?",
                a: "Yes, you can start with a free trial using the button on this page to try out the pickup workflow, Auto-Reply, and ticketing before deciding to subscribe.",
            },
        ],
    },
};

export default function LogisticsFAQ() {
    const { language } = useLanguage();
    const copy = COPY[language];

    const [expanded, setExpanded] = React.useState<string | false>("panel0");

    const handleChange =
        (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "var(--surface-alt)" }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "var(--brand-deep)",
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: "block",
                            textTransform: "uppercase",
                        }}
                    >
                        {copy.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: "#111827",
                            fontSize: { xs: "1.75rem", md: "2.25rem" },
                            mb: 2,
                        }}
                    >
                        {copy.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ color: "#4B5563", fontSize: { xs: "1rem", md: "1.05rem" } }}
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
                                borderRadius: "16px !important",
                                border: "1px solid #E2E8F0",
                                overflow: "hidden",
                                "&:before": { display: "none" },
                                "&.Mui-expanded": {
                                    borderColor: "#597CFF",
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: "var(--brand-deep)" }} />}
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: "#1E293B", fontSize: "1rem" }}>
                                    {faq.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                id={`faq-panel-${index}`}
                                aria-labelledby={`faq-summary-${index}`}
                                sx={{ px: 3, pb: 3 }}
                            >
                                <Typography sx={{ color: "#4B5563", lineHeight: 1.7, fontSize: "0.95rem" }}>
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
