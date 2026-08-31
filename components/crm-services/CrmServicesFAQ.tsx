"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar CRM Services SmartSales",
        desc: "Hal-hal yang paling sering ditanyakan tim Customer Service sebelum mulai memakai sistem ticketing SmartSales.",
        items: [
            {
                q: "Apa itu CRM Services dari SmartSales?",
                a: "CRM Services adalah modul SmartSales untuk tim Customer Service yang mengubah setiap interaksi pelanggan dari WhatsApp, Instagram, dan Email menjadi tiket terpusat, lengkap dengan status, SLA, dan histori percakapan dalam satu halaman."
            },
            {
                q: "Bagaimana cara kerja sistem tiket terpusat di SmartSales?",
                a: "Setiap pesan atau komplain yang masuk dari WhatsApp, Instagram, maupun Email otomatis diubah menjadi tiket. Tim CS dapat melacak status tiket (baru, diproses, selesai) dan membaca histori percakapan tanpa berpindah aplikasi."
            },
            {
                q: "Apa itu SLA dan bagaimana SmartSales membantu memantaunya?",
                a: "SLA adalah batas waktu maksimum untuk merespons tiket. Anda dapat menetapkan batas waktu ini di SmartSales, dan jika sebuah tiket belum dijawab hingga mendekati atau melewati batas tersebut, sistem mengirim peringatan atau meneruskannya secara otomatis ke supervisor."
            },
            {
                q: "Apa itu Quick Replies dan bagaimana cara memakainya?",
                a: "Quick Replies adalah kumpulan template balasan yang sudah disiapkan sebelumnya untuk pertanyaan yang sering diulang. Agen tinggal memilih template yang sesuai dan mengirimkannya dalam satu klik, tanpa perlu mengetik jawaban yang sama berulang kali."
            },
            {
                q: "Apakah tiket bisa didistribusikan otomatis ke agen tertentu?",
                a: "Bisa. Fitur Automated Routing meneruskan tiket ke agen yang paling sesuai berdasarkan keahlian, shift kerja yang sedang aktif, atau beban tugas yang sedang ditangani agen tersebut, sehingga distribusi kerja lebih merata."
            },
            {
                q: "Berapa lama waktu implementasi CRM Services sampai tim CS bisa mulai memakainya?",
                a: "Untuk kebutuhan ticketing dasar, tim CS umumnya sudah bisa mulai bekerja di SmartSales dalam hitungan hari setelah nomor WhatsApp Business dan channel lain terhubung. Kebutuhan alur SLA atau integrasi khusus akan didiskusikan sesuai kompleksitasnya saat onboarding."
            },
            {
                q: "Apakah data komplain dan histori pelanggan kami aman?",
                a: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga hanya pengguna yang berwenang di tenant Anda yang dapat mengakses tiket, percakapan, dan riwayat pelanggan."
            },
            {
                q: "Apakah pesan WhatsApp yang masuk ke sistem tiket resmi dan aman dari risiko banned?",
                a: "SmartSales terintegrasi dengan WhatsApp Business API resmi, bukan modifikasi WhatsApp biasa, sehingga pengiriman dan penerimaan pesan mengikuti aturan resmi Meta."
            },
            {
                q: "Bisakah alur tiket dan aturan SLA disesuaikan dengan proses internal perusahaan kami?",
                a: "Bisa. Karena SmartSales dibangun dengan pendekatan custom build, hal-hal seperti status tiket, aturan eskalasi, atau kategori keluhan dapat didiskusikan dan disesuaikan dengan kebutuhan tim CS Anda."
            },
            {
                q: "Berapa biaya berlangganan CRM Services?",
                a: "Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi /price untuk melihat pilihan paket yang sesuai dengan jumlah agen dan channel yang Anda butuhkan."
            },
            {
                q: "Bisakah tim CS kami mencoba sistem tiket ini sebelum berlangganan?",
                a: "Bisa. Kami menyediakan uji coba gratis agar tim CS Anda dapat langsung merasakan alur tiket WhatsApp, Instagram, dan Email, pengaturan SLA, serta penggunaan Quick Replies di lingkungan nyata sebelum memutuskan berlangganan."
            },
            {
                q: "Bisakah CRM Services digabung dengan modul CRM Sales atau Omnichannel lain?",
                a: "Bisa. CRM Services adalah bagian dari platform SmartSales yang sama dengan CRM Sales dan Omnichannel WhatsApp & Email, sehingga data kontak dan riwayat interaksi pelanggan tetap terhubung di satu tempat."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales CRM Services",
        desc: "The questions Customer Service teams ask most often before adopting SmartSales' ticketing system.",
        items: [
            {
                q: "What is SmartSales CRM Services?",
                a: "CRM Services is SmartSales' module for Customer Service teams that turns every customer interaction from WhatsApp, Instagram, and Email into a centralized ticket, complete with status, SLA, and conversation history on a single page."
            },
            {
                q: "How does the centralized ticketing system work?",
                a: "Every message or complaint coming in from WhatsApp, Instagram, or Email is automatically turned into a ticket. Your CS team can track ticket status (new, in progress, resolved) and read conversation history without switching apps."
            },
            {
                q: "What is SLA and how does SmartSales help monitor it?",
                a: "SLA is the maximum time allowed to respond to a ticket. You can set this limit in SmartSales, and if a ticket hasn't been answered as it approaches or passes that limit, the system sends an alert or automatically forwards it to a supervisor."
            },
            {
                q: "What are Quick Replies and how do I use them?",
                a: "Quick Replies are a set of pre-prepared reply templates for frequently repeated questions. Agents simply pick the right template and send it in one click, instead of typing the same answer over and over."
            },
            {
                q: "Can tickets be automatically distributed to specific agents?",
                a: "Yes. Automated Routing forwards tickets to the most suitable agent based on their expertise, current active shift, or current workload, so work gets distributed more evenly."
            },
            {
                q: "How long does implementation take before the CS team can start using CRM Services?",
                a: "For basic ticketing needs, your CS team can typically start working in SmartSales within days once your WhatsApp Business number and other channels are connected. SLA workflow or specific integration needs are scoped during onboarding based on complexity."
            },
            {
                q: "Is our complaint data and customer history safe?",
                a: "Data is stored on multi-tenant infrastructure with data separation between companies, so only authorized users within your tenant can access tickets, conversations, and customer history."
            },
            {
                q: "Are the WhatsApp messages coming into the ticketing system official and safe from being banned?",
                a: "SmartSales integrates with the official WhatsApp Business API, not an unofficial WhatsApp mod, so sending and receiving messages follows Meta's official rules."
            },
            {
                q: "Can the ticket flow and SLA rules be adapted to our company's internal process?",
                a: "Yes. Because SmartSales is built with a custom-build approach, things like ticket statuses, escalation rules, or complaint categories can be discussed and adapted to your CS team's needs."
            },
            {
                q: "How much does a CRM Services subscription cost?",
                a: "Plan and pricing details are on our Pricing page. Visit /price to see the plan options that fit the number of agents and channels you need."
            },
            {
                q: "Can our CS team try this ticketing system before subscribing?",
                a: "Yes. We offer a free trial so your CS team can experience the WhatsApp, Instagram, and Email ticket flow, SLA setup, and Quick Replies firsthand in a real environment before committing to a subscription."
            },
            {
                q: "Can CRM Services be combined with the CRM Sales or Omnichannel modules?",
                a: "Yes. CRM Services is part of the same SmartSales platform as CRM Sales and Omnichannel WhatsApp & Email, so contact data and customer interaction history stay connected in one place."
            }
        ]
    }
};

export default function CrmServicesFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

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
                            display: 'block'
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
                                expandIcon={<ExpandMoreIcon sx={{ color: 'var(--brand-deep)' }} />}
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
                            <AccordionDetails id={`faq-panel-${index}`} aria-labelledby={`faq-summary-${index}`} sx={{ px: 3, pb: 3, pt: 0 }}>
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
