"use client";

import { Box, Container, Typography, Stack, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Hotel",
        subtitle: "Hal-hal yang biasa ditanyakan tim hotel sebelum mulai menggunakan sistem reservasi dan layanan tamu SmartSales.",
        faqs: [
            {
                q: "Apa itu SmartSales untuk industri perhotelan?",
                a: "SmartSales adalah platform yang membantu hotel dan vila mengelola reservasi kamar, komunikasi tamu via WhatsApp, dan penanganan komplain layanan dalam satu sistem terpusat, menggantikan pencatatan manual di buku atau spreadsheet."
            },
            {
                q: "Bagaimana cara kerja manajemen reservasi kamar di SmartSales?",
                a: "Setiap pertanyaan tamu soal ketersediaan kamar tercatat sebagai sales pipeline, mulai dari tahap tanya harga, hold/DP, hingga check-in. Tim sales dapat melihat status setiap calon tamu tanpa perlu membuka buku catatan manual."
            },
            {
                q: "Apakah SmartSales menggunakan WhatsApp resmi (WhatsApp Business API)?",
                a: "Ya. SmartSales menggunakan WhatsApp Business API resmi sehingga nomor hotel Anda tidak berisiko diblokir, dan beberapa staf (resepsionis, sales, admin) bisa membalas chat dari satu nomor yang sama secara bersamaan."
            },
            {
                q: "Bagaimana SmartSales membantu menangani komplain tamu?",
                a: "Komplain atau permintaan layanan yang masuk lewat WhatsApp, misalnya AC bermasalah atau butuh handuk tambahan, bisa langsung diubah menjadi tiket kerja dan diteruskan ke tim Housekeeping atau Engineering, sehingga status pengerjaannya bisa dipantau."
            },
            {
                q: "Apakah SmartSales bisa dipakai untuk beberapa properti atau cabang sekaligus?",
                a: "Bisa. SmartSales dibangun dengan arsitektur multi-tenant, sehingga cocok digunakan oleh grup hotel dengan beberapa properti yang masing-masing memerlukan data dan tim terpisah."
            },
            {
                q: "Apakah alur kerja bisa disesuaikan dengan kebutuhan hotel kami?",
                a: "Bisa. Selain paket standar, SmartSales menyediakan opsi custom build untuk menyesuaikan kategori kamar, tahapan reservasi, atau jenis tiket layanan sesuai operasional hotel Anda."
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk hotel?",
                a: "Biaya tergantung jumlah pengguna dan fitur yang dibutuhkan. Detail paket dan harga terbaru bisa dilihat di halaman Harga, atau hubungi tim kami untuk rekomendasi paket yang sesuai dengan skala hotel Anda."
            },
            {
                q: "Apakah data tamu dan reservasi di SmartSales aman?",
                a: "Data disimpan pada sistem yang terpisah per klien (multi-tenant) dan hanya bisa diakses oleh tim internal hotel yang diberi hak akses, sehingga histori chat dan data tamu tidak tercampur dengan hotel lain."
            },
            {
                q: "Apakah ada masa uji coba sebelum berlangganan?",
                a: "Ada. Tersedia uji coba gratis agar tim hotel Anda bisa mencoba langsung alur reservasi dan penanganan tiket layanan sebelum memutuskan berlangganan."
            },
            {
                q: "Apakah histori chat tamu tetap tersimpan jika staf resepsionis berganti?",
                a: "Ya. Karena percakapan tersimpan di sistem terpusat, bukan di HP pribadi staf, pergantian resepsionis atau shift tidak akan menghilangkan histori komunikasi dengan tamu."
            },
            {
                q: "Berapa lama proses implementasi SmartSales di hotel kami?",
                a: "Untuk paket standar, hotel bisa mulai menggunakan SmartSales dalam hitungan hari setelah data kamar dan tim dikonfigurasi. Untuk kebutuhan custom build, waktu implementasi disesuaikan dengan kompleksitas alur kerja yang diminta."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for Hotels",
        subtitle: "Common questions hotel teams ask before adopting SmartSales' reservation and guest service system.",
        faqs: [
            {
                q: "What is SmartSales for the hospitality industry?",
                a: "SmartSales is a platform that helps hotels and villas manage room reservations, guest communication over WhatsApp, and service complaints in one centralized system, replacing manual notebooks or spreadsheets."
            },
            {
                q: "How does room reservation management work in SmartSales?",
                a: "Every guest inquiry about room availability is recorded as a sales pipeline, from price inquiry, hold/DP, through to check-in. The sales team can see the status of every prospective guest without opening a manual logbook."
            },
            {
                q: "Does SmartSales use the official WhatsApp Business API?",
                a: "Yes. SmartSales uses the official WhatsApp Business API so your hotel's number isn't at risk of being blocked, and multiple staff (receptionist, sales, admin) can reply to chats from the same number at the same time."
            },
            {
                q: "How does SmartSales help handle guest complaints?",
                a: "Complaints or service requests coming in via WhatsApp, such as a broken AC or a request for extra towels, can be turned directly into a work ticket and forwarded to the Housekeeping or Engineering team, so progress can be tracked."
            },
            {
                q: "Can SmartSales be used for multiple properties or branches at once?",
                a: "Yes. SmartSales is built with a multi-tenant architecture, making it suitable for hotel groups with several properties that each need separate data and teams."
            },
            {
                q: "Can the workflow be customized to our hotel's needs?",
                a: "Yes. Besides the standard package, SmartSales offers a custom build option to tailor room categories, reservation stages, or service ticket types to your hotel's operations."
            },
            {
                q: "How much does a SmartSales subscription cost for a hotel?",
                a: "Pricing depends on the number of users and features needed. See the Pricing page for current package details, or contact our team for a package recommendation that fits your hotel's scale."
            },
            {
                q: "Is guest and reservation data in SmartSales safe?",
                a: "Data is stored on a system that's separated per client (multi-tenant) and accessible only to your hotel's authorized internal team, so chat history and guest data are never mixed with other hotels."
            },
            {
                q: "Is there a trial period before subscribing?",
                a: "Yes. A free trial is available so your hotel team can try the reservation and service ticketing flow directly before committing to a subscription."
            },
            {
                q: "Does guest chat history stay saved if a receptionist changes?",
                a: "Yes. Because conversations are stored in a centralized system rather than on staff's personal phones, a change in receptionist or shift won't erase the guest communication history."
            },
            {
                q: "How long does implementation take for our hotel?",
                a: "For the standard package, a hotel can start using SmartSales within days after room and team data is configured. For custom build needs, implementation time depends on the complexity of the requested workflow."
            }
        ]
    }
};

export default function HotelFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'white' }}>
            <Container maxWidth="md">
                <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{ color: '#597CFF', fontWeight: 800, letterSpacing: 2, display: 'block' }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            lineHeight: 1.2
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', fontSize: '1.05rem', maxWidth: '640px', mx: 'auto' }}>
                        {t.subtitle}
                    </Typography>
                </Stack>

                <Stack spacing={2}>
                    {t.faqs.map((item, index) => (
                        <Accordion
                            key={index}
                            elevation={0}
                            disableGutters
                            sx={{
                                border: '1px solid #E2E8F0',
                                borderRadius: '16px !important',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': { borderColor: '#597CFF' }
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#597CFF' }} />}
                                sx={{ px: 3, py: 1 }}
                            >
                                <Typography sx={{ fontWeight: 700, color: '#1E293B', fontSize: '1rem' }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: 3, pb: 3 }}>
                                <Typography sx={{ color: '#64748B', lineHeight: 1.7, fontSize: '0.95rem' }}>
                                    {item.a}
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
}
