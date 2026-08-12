"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Tour & Travel",
        desc: "Hal-hal yang paling sering ditanyakan agen tour & travel sebelum mulai memakai SmartSales.",
        items: [
            {
                q: "Apakah SmartSales bisa mengelola pemesanan paket wisata dari WhatsApp, Instagram, dan Facebook sekaligus?",
                a: "Bisa. SmartSales menyatukan WhatsApp Business API, Instagram DM, dan Facebook ke dalam satu Unified Inbox, sehingga tim admin bisa membalas pertanyaan paket dan harga dari satu layar tanpa harus berpindah aplikasi."
            },
            {
                q: "Bagaimana SmartSales membantu melacak status pemesanan mulai dari tanya paket sampai berangkat?",
                a: "Setiap calon pelanggan dicatat dalam alur kerja visual (pipeline) mulai dari Tanya Paket, Proses DP/Visa, hingga Lunas/Berangkat. Anda bisa melihat di tahap mana setiap pelanggan berada tanpa perlu membuka catatan manual atau Excel."
            },
            {
                q: "Apakah dokumen pelanggan seperti paspor dan visa bisa dipantau kelengkapannya di SmartSales?",
                a: "Bisa. Profil pemesanan tiap pelanggan mencatat status kelengkapan dokumen dan aktivitas terakhir, seperti verifikasi pembayaran DP, sehingga tim tidak perlu menanyakan ulang dokumen yang sudah masuk."
            },
            {
                q: "Bagaimana cara menangani permintaan reschedule atau pembatalan tiket pelanggan?",
                a: "Permintaan reschedule, pembatalan, atau keluhan penginapan diubah menjadi tiket penanganan melalui modul CRM Services, lalu dieskalasi ke divisi Ticketing, Maskapai, atau Keuangan sesuai kebutuhan, lengkap dengan batas waktu penanganan (SLA) sampai statusnya selesai."
            },
            {
                q: "Apakah balasan seperti itinerary dan syarat pembatalan bisa dikirim otomatis?",
                a: "Bisa. Anda dapat menyiapkan Quick Replies untuk mengirim PDF itinerary, harga paket promo, dan syarat pembatalan dalam satu klik, sehingga admin tidak perlu mengetik ulang jawaban yang sama setiap hari."
            },
            {
                q: "Apakah SmartSales bisa memisahkan minat pelanggan, misalnya paket domestik, internasional, atau Umrah/Haji?",
                a: "Bisa. Anda dapat menggunakan Custom Tags untuk mengelompokkan klien berdasarkan minat paket, sehingga follow-up dan promosi berikutnya bisa lebih tepat sasaran sesuai kategori perjalanan yang diminati."
            },
            {
                q: "Bagaimana jika beberapa staf ingin membalas chat dari nomor WhatsApp yang sama?",
                a: "Karena menggunakan WhatsApp Business API resmi, satu nomor WhatsApp bisa diakses bersama oleh beberapa staf sekaligus tanpa berebut ponsel atau bertabrakan sesi login, dan setiap percakapan tetap tercatat di sistem."
            },
            {
                q: "Apakah data pelanggan dan riwayat pemesanan tetap aman jika ada pergantian agen?",
                a: "Aman. Data pelanggan, riwayat chat, dan riwayat pemesanan tersimpan di sistem CRM, bukan di HP pribadi agen, sehingga tetap tersedia meski ada pergantian personel."
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk agen tour & travel?",
                a: "Struktur paket SmartSales sama untuk semua industri, mencakup modul CRM Sales, CRM Services (ticketing), dan Omnichannel WhatsApp. Rincian paket dan harga terbaru bisa dilihat di halaman harga kami."
            },
            {
                q: "Bisakah alur kerja SmartSales disesuaikan dengan proses bisnis travel kami saat ini?",
                a: "Bisa. SmartSales bersifat multi-tenant dan dibangun dengan pendekatan custom build, sehingga tahapan pipeline, tag segmentasi paket, hingga alur eskalasi tiket reschedule bisa disesuaikan dengan proses yang sudah berjalan di bisnis Anda."
            },
            {
                q: "Bisakah kami mencoba dulu alur pemesanan paket dan tiket handling sebelum berlangganan?",
                a: "Bisa. Kami menyediakan periode uji coba gratis di mana tim agen travel Anda bisa langsung menjajal pipeline pemesanan paket, tag segmentasi Umrah/Haji vs domestik/internasional, hingga eskalasi tiket reschedule menggunakan skenario booking nyata sebelum memutuskan berlangganan."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for Tour & Travel",
        desc: "The questions tour & travel agents ask most often before adopting SmartSales.",
        items: [
            {
                q: "Can SmartSales manage holiday package bookings from WhatsApp, Instagram, and Facebook at the same time?",
                a: "Yes. SmartSales brings the WhatsApp Business API, Instagram DM, and Facebook together into one Unified Inbox, so your admin team can answer package and pricing questions from a single screen instead of switching apps."
            },
            {
                q: "How does SmartSales help track a booking's status from first inquiry to departure?",
                a: "Every prospect is tracked in a visual pipeline: Package Inquiry, DP/Visa Process, and Paid/Departed. You can see exactly which stage a customer is at without digging through manual notes or a spreadsheet."
            },
            {
                q: "Can passport and visa document completeness be tracked in SmartSales?",
                a: "Yes. Each customer's booking profile records document completeness status and the latest activity, such as DP payment verification, so the team doesn't need to ask customers for documents they already submitted."
            },
            {
                q: "How are reschedule or ticket cancellation requests handled?",
                a: "Reschedule requests, cancellations, or lodging complaints are turned into a handling ticket through the CRM Services module, then escalated to the Ticketing, Airline, or Finance division as needed, with a handling deadline (SLA) tracked until the status is resolved."
            },
            {
                q: "Can replies like itineraries and cancellation terms be sent automatically?",
                a: "Yes. You can set up Quick Replies to send itinerary PDFs, promotional package prices, and cancellation terms in one click, so admins don't need to retype the same answers every day."
            },
            {
                q: "Can SmartSales separate customer interest, for example domestic, international, or Umrah/Hajj packages?",
                a: "Yes. You can use Custom Tags to group clients by package interest, so follow-up and future promotions can be targeted more precisely by travel category."
            },
            {
                q: "What if several staff members need to reply from the same WhatsApp number?",
                a: "Because it runs on the official WhatsApp Business API, one WhatsApp number can be shared by multiple staff at once without fighting over a phone or colliding login sessions, and every conversation stays logged in the system."
            },
            {
                q: "Is customer data and booking history still safe if an agent leaves?",
                a: "Yes. Customer data, chat history, and booking history are stored in the CRM system, not on an agent's personal phone, so they stay available even when staff change."
            },
            {
                q: "How much does a SmartSales subscription cost for a tour & travel agency?",
                a: "SmartSales plan structure is the same across industries, covering CRM Sales, CRM Services (ticketing), and Omnichannel WhatsApp. Current plan and pricing details are on our Pricing page."
            },
            {
                q: "Can SmartSales' workflow be adapted to our current travel business process?",
                a: "Yes. SmartSales is multi-tenant and built with a custom-build approach, so pipeline stages, package segmentation tags, and reschedule-ticket escalation flows can be adapted to the process already running in your business."
            },
            {
                q: "Can we test the package booking and reschedule-handling flow before subscribing?",
                a: "Yes. We offer a free trial period where your travel team can try the package booking pipeline, Umrah/Hajj vs domestic/international segmentation tags, and reschedule-ticket escalation firsthand using real booking scenarios before deciding to subscribe."
            }
        ]
    }
};

export default function TravelFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

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
                            display: 'block'
                        }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            mb: 2
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '620px', mx: 'auto' }}>
                        {t.desc}
                    </Typography>
                </Box>

                <Box>
                    {t.items.map((item, index) => (
                        <Accordion
                            key={index}
                            elevation={0}
                            disableGutters
                            sx={{
                                mb: 2,
                                borderRadius: '16px !important',
                                border: '1px solid #E2E8F0',
                                bgcolor: 'white',
                                '&:before': { display: 'none' },
                                overflow: 'hidden'
                            }}
                        >
                            <AccordionSummary
                                id={`faq-summary-${index}`}
                                aria-controls={`faq-panel-${index}`}
                                expandIcon={<ExpandMoreIcon sx={{ color: '#3854D6' }} />}
                                sx={{
                                    px: 3,
                                    py: 1,
                                    '& .MuiAccordionSummary-content': { my: 1.5 }
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                                id={`faq-panel-${index}`}
                                aria-labelledby={`faq-summary-${index}`}
                                sx={{ px: 3, pb: 3, pt: 0 }}
                            >
                                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7 }}>
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
