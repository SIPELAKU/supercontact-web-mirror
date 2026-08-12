"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar CRM Sales",
        subtitle: "Hal-hal yang paling sering ditanyakan sebelum mulai menggunakan CRM Sales.",
        items: [
            {
                q: "Apa itu CRM Sales dari SmartSales?",
                a: "CRM Sales adalah aplikasi untuk mengelola prospek, pipeline penjualan, dan tugas tim sales dalam satu dashboard. Anda bisa memantau setiap prospek dari status baru hingga closing tanpa berpindah-pindah spreadsheet atau aplikasi chat.",
            },
            {
                q: "Bagaimana cara kerja pipeline penjualan di CRM Sales?",
                a: "Setiap prospek ditampilkan dalam tampilan Kanban yang bisa digeser antar tahap, misalnya prospek baru, negosiasi, hingga closing. Tim sales dan manajer bisa melihat posisi setiap deal secara real-time tanpa perlu membuat laporan manual.",
            },
            {
                q: "Apakah tugas dan follow-up bisa diatur otomatis?",
                a: "Ya. Anda bisa menjadwalkan tugas follow-up untuk setiap prospek dan sistem akan mengirim pengingat otomatis, sehingga peluang penjualan tidak terlewat karena lupa menghubungi calon pelanggan.",
            },
            {
                q: "Laporan apa saja yang tersedia di fitur analitik?",
                a: "Dashboard analitik menampilkan total pendapatan, jumlah prospek yang berhasil dikonversi, dan rasio win/loss tim sales, sehingga manajer bisa memantau performa tanpa merekap data secara manual.",
            },
            {
                q: "Apakah CRM Sales terintegrasi dengan WhatsApp?",
                a: "Ya, CRM Sales terhubung dengan WhatsApp Business API sehingga komunikasi dengan prospek dapat tercatat dalam riwayat kontak yang sama dengan data pipeline penjualan.",
            },
            {
                q: "Berapa lama waktu implementasi untuk mulai menggunakan CRM Sales?",
                a: "Setup awal seperti membuat akun, mengatur tahapan pipeline, dan menambahkan anggota tim umumnya bisa diselesaikan dalam hitungan hari. Tim kami membantu proses onboarding sesuai kebutuhan bisnis Anda.",
            },
            {
                q: "Apakah data pelanggan dan sales aman di CRM Sales?",
                a: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan akses per perusahaan, sehingga data prospek dan histori komunikasi hanya bisa diakses oleh tim internal Anda sendiri.",
            },
            {
                q: "Apakah CRM Sales bisa disesuaikan dengan alur kerja tim saya?",
                a: "Bisa. Anda dapat menyesuaikan tahapan pipeline, custom tags untuk prospek, dan pengaturan tugas sesuai proses penjualan yang sudah berjalan di tim Anda. Untuk kebutuhan yang lebih spesifik, tim kami juga menyediakan custom build.",
            },
            {
                q: "Berapa biaya berlangganan CRM Sales?",
                a: "Biaya berlangganan bervariasi tergantung jumlah pengguna dan kebutuhan fitur. Detail paket dan harga dapat dilihat di halaman harga SmartSales.",
            },
            {
                q: "Apakah tersedia uji coba gratis?",
                a: "Ya, Anda bisa mencoba CRM Sales secara gratis untuk melihat langsung bagaimana pipeline, tugas, dan analitik bekerja sebelum memutuskan untuk berlangganan.",
            },
        ],
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About CRM Sales",
        subtitle: "The things people ask most before they start using CRM Sales.",
        items: [
            {
                q: "What is SmartSales CRM Sales?",
                a: "CRM Sales is an application for managing prospects, the sales pipeline, and sales team tasks in a single dashboard. You can track every prospect from new status through to closing without switching between spreadsheets or chat apps.",
            },
            {
                q: "How does the sales pipeline work in CRM Sales?",
                a: "Every prospect appears in a Kanban view that can be moved between stages, such as new prospect, negotiation, and closing. Sales teams and managers can see where every deal stands in real time without building a manual report.",
            },
            {
                q: "Can tasks and follow-ups be automated?",
                a: "Yes. You can schedule follow-up tasks for each prospect and the system sends automatic reminders, so sales opportunities don't get missed because someone forgot to reach out.",
            },
            {
                q: "What kind of reports does the analytics feature show?",
                a: "The analytics dashboard shows total revenue, the number of converted prospects, and the sales team's win/loss ratio, so managers can monitor performance without compiling data by hand.",
            },
            {
                q: "Does CRM Sales integrate with WhatsApp?",
                a: "Yes, CRM Sales connects to the WhatsApp Business API so conversations with prospects are recorded in the same contact history as the pipeline data.",
            },
            {
                q: "How long does it take to get started with CRM Sales?",
                a: "Initial setup, such as creating an account, configuring pipeline stages, and adding team members, is usually finished within a few days. Our team helps with onboarding based on your business needs.",
            },
            {
                q: "Is customer and sales data safe in CRM Sales?",
                a: "Data is stored on multi-tenant infrastructure with access separated per company, so prospect data and communication history can only be accessed by your own internal team.",
            },
            {
                q: "Can CRM Sales be adapted to my team's workflow?",
                a: "Yes. You can customize pipeline stages, use custom tags for prospects, and configure tasks to match the sales process your team already follows. For more specific needs, our team also offers custom builds.",
            },
            {
                q: "How much does CRM Sales cost?",
                a: "Subscription cost varies depending on the number of users and feature needs. Full package and pricing details are available on the SmartSales pricing page.",
            },
            {
                q: "Is a free trial available?",
                a: "Yes, you can try CRM Sales for free to see firsthand how the pipeline, tasks, and analytics work before subscribing.",
            },
        ],
    },
};

export default function CrmSalesFAQ() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#597CFF',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                        }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            mb: 3,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            maxWidth: '600px',
                            mx: 'auto',
                        }}
                    >
                        {t.subtitle}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {t.items.map((item, index) => (
                        <Accordion
                            key={index}
                            disableGutters
                            elevation={0}
                            sx={{
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '16px !important',
                                bgcolor: 'background.paper',
                                overflow: 'hidden',
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': {
                                    borderColor: '#597CFF',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ color: '#597CFF' }} />}
                                sx={{
                                    px: { xs: 2.5, md: 3 },
                                    py: 1,
                                    '& .MuiAccordionSummary-content': {
                                        my: 1.5,
                                    },
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1rem' }}>
                                    {item.q}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ px: { xs: 2.5, md: 3 }, pb: 3, pt: 0 }}>
                                <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, fontSize: '0.95rem' }}>
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
