"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Tim Customer Service",
        desc: "Hal-hal yang paling sering ditanyakan tim CS dan helpdesk sebelum mulai memakai SmartSales.",
        items: [
            {
                q: "Bagaimana cara kerja sistem tiket di SmartSales untuk keluhan yang perlu eskalasi?",
                a: "Chat pelanggan yang membutuhkan bantuan divisi lain (misalnya Gudang atau Finance) bisa diubah menjadi Tiket Tugas. Tiket ini punya status Open, In Progress, dan Resolved, sehingga progres penyelesaiannya bisa dipantau tanpa harus bolak-balik membuka chat aslinya."
            },
            {
                q: "Apa itu SLA di SmartSales dan bagaimana cara mengaturnya?",
                a: "SLA (Service Level Agreement) adalah batas waktu penyelesaian yang Anda tetapkan untuk setiap tiket. Jika sebuah tiket melewati batas waktu tersebut, supervisor otomatis menerima notifikasi agar bisa segera turun tangan sebelum pelanggan menunggu terlalu lama."
            },
            {
                q: "Apa itu Quick Replies dan bagaimana ini membantu tim CS?",
                a: "Quick Replies adalah templat balasan siap pakai untuk pertanyaan yang sering berulang, seperti ongkir, jam operasional, atau format refund. Agen tinggal memilih templat dengan satu klik, tidak perlu mengetik ulang jawaban yang sama setiap hari."
            },
            {
                q: "Apakah pesan dari WhatsApp, Instagram, dan Email pelanggan bisa digabung dalam satu layar?",
                a: "Bisa. Semua pesan dari WhatsApp Business API, Instagram DM, dan Email masuk ke satu inbox yang sama, sehingga agen CS tidak perlu berpindah-pindah aplikasi saat jam sibuk."
            },
            {
                q: "Jika pelanggan ditransfer ke agen lain, apakah riwayat percakapannya hilang?",
                a: "Tidak. Riwayat chat pelanggan tetap tersimpan di sistem. Saat terjadi operan shift atau transfer ke agen lain, agen yang menerima bisa langsung membaca konteks masalah sebelumnya tanpa meminta pelanggan mengulang cerita."
            },
            {
                q: "Bagaimana pesan masuk dibagikan ke agen CS yang sedang bertugas?",
                a: "Sistem Auto-Routing membagikan antrean chat secara merata ke agen yang sedang online, sehingga beban kerja tidak menumpuk hanya pada satu atau dua orang saja."
            },
            {
                q: "Apakah SmartSales bisa membalas pesan secara otomatis di luar jam operasional?",
                a: "Bisa. Anda dapat mengaktifkan Welcome Message untuk menyapa pelanggan baru, dan Away Message otomatis saat tim CS sedang di luar jam kerja."
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk tim Customer Service?",
                a: "Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi /price untuk melihat pilihan paket yang sesuai dengan jumlah agen dan volume chat tim CS Anda."
            },
            {
                q: "Apakah data percakapan dan tiket pelanggan kami aman?",
                a: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga hanya pengguna yang berwenang di tenant Anda yang dapat mengakses riwayat chat dan tiket pelanggan."
            },
            {
                q: "Apakah alur tiket dan eskalasi bisa disesuaikan dengan struktur tim kami?",
                a: "Bisa. Karena SmartSales dibangun dengan pendekatan custom build, alur eskalasi, divisi tujuan tiket, dan isi Quick Replies dapat didiskusikan dan disesuaikan dengan kebutuhan operasional tim CS Anda."
            },
            {
                q: "Berapa lama waktu implementasi sampai tim CS bisa mulai memakai sistem tiket?",
                a: "Untuk kebutuhan inbox dan tiket dasar, tim Anda umumnya sudah bisa mulai memakai SmartSales dalam hitungan hari setelah saluran WhatsApp Business, Instagram, dan Email terhubung. Kebutuhan integrasi tambahan akan didiskusikan sesuai kompleksitasnya saat onboarding."
            },
            {
                q: "Apakah tersedia uji coba gratis sebelum berlangganan?",
                a: "Tersedia. Anda bisa memulai uji coba gratis untuk mencoba langsung fitur inbox, tiket, dan Quick Replies sebelum memutuskan berlangganan."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for Customer Service Teams",
        desc: "The questions CS and helpdesk teams ask most often before adopting SmartSales.",
        items: [
            {
                q: "How does SmartSales' ticketing system work for complaints that need escalation?",
                a: "A customer chat that needs help from another division (for example Warehouse or Finance) can be converted into a Task Ticket. The ticket has an Open, In Progress, or Resolved status, so you can track its progress without going back and forth to the original chat."
            },
            {
                q: "What is an SLA in SmartSales and how do I set one?",
                a: "An SLA (Service Level Agreement) is the resolution deadline you set for each ticket. If a ticket passes that deadline, the supervisor automatically gets notified so they can step in before the customer waits too long."
            },
            {
                q: "What are Quick Replies and how do they help a CS team?",
                a: "Quick Replies are ready-made response templates for questions that come up often, like shipping costs, operating hours, or refund format. Agents just pick a template with one click instead of retyping the same answer every day."
            },
            {
                q: "Can WhatsApp, Instagram, and Email messages be combined into one screen?",
                a: "Yes. Messages from the WhatsApp Business API, Instagram DM, and Email all land in the same inbox, so CS agents don't need to switch between apps during busy hours."
            },
            {
                q: "If a customer is transferred to another agent, is the conversation history lost?",
                a: "No. The customer's chat history stays saved in the system. During a shift handover or transfer to another agent, the receiving agent can immediately read the context of the previous issue without asking the customer to repeat their story."
            },
            {
                q: "How are incoming messages distributed to agents on duty?",
                a: "The Auto-Routing system distributes the chat queue evenly to agents who are currently online, so the workload doesn't pile up on just one or two people."
            },
            {
                q: "Can SmartSales reply automatically outside of operating hours?",
                a: "Yes. You can turn on a Welcome Message to greet new customers, and an automatic Away Message for when the CS team is outside working hours."
            },
            {
                q: "How much does a SmartSales subscription cost for a Customer Service team?",
                a: "Plan and pricing details are on our Pricing page. Visit /price to see the plan options that fit your agent count and CS team's chat volume."
            },
            {
                q: "Is our customer conversation and ticket data safe?",
                a: "Data is stored on multi-tenant infrastructure with data separation between companies, so only authorized users within your tenant can access chat history and customer tickets."
            },
            {
                q: "Can the ticketing and escalation flow be customized to our team's structure?",
                a: "Yes. Because SmartSales is built with a custom-build approach, escalation flows, ticket destination divisions, and Quick Replies content can be discussed and adapted to your CS team's operational needs."
            },
            {
                q: "How long does implementation take before the CS team can start using the ticketing system?",
                a: "For basic inbox and ticketing needs, your team can typically start using SmartSales within days once your WhatsApp Business, Instagram, and Email channels are connected. Additional integration needs are scoped during onboarding based on complexity."
            },
            {
                q: "Is a free trial available before subscribing?",
                a: "Yes. You can start a free trial to try the inbox, ticketing, and Quick Replies features directly before deciding to subscribe."
            }
        ]
    }
};

export default function CSFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#597CFF',
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
                                expandIcon={<ExpandMoreIcon sx={{ color: '#597CFF' }} />}
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
                            <AccordionDetails sx={{ px: 3, pb: 3, pt: 0 }}>
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
