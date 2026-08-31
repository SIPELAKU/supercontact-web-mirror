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
        title: 'Pertanyaan Seputar SmartSales untuk Tim Sales',
        subtitle: 'Hal-hal yang biasa ditanyakan tim sales dan sales manager sebelum mulai pakai SmartSales.',
        faqs: [
            {
                q: 'Berapa lama proses implementasi sampai tim sales bisa mulai pakai?',
                a: 'Untuk kebutuhan standar seperti pipeline, kartu prospek, dan pengingat follow-up, tim kami biasanya bisa menyiapkan akun dan struktur pipeline Anda dalam beberapa hari kerja. Jika ada kebutuhan integrasi khusus atau alur kerja custom, waktunya menyesuaikan kompleksitas kebutuhan tersebut.',
            },
            {
                q: 'Apakah data pipeline dan kontak pelanggan kami aman?',
                a: 'Setiap perusahaan memiliki ruang data tersendiri (multi-tenant) yang terpisah dari perusahaan lain. Akses ke data pipeline, kontak, dan riwayat chat diatur berdasarkan peran pengguna, jadi sales bisa dibatasi hanya melihat data timnya sendiri jika diperlukan.',
            },
            {
                q: 'Apakah SmartSales terhubung dengan WhatsApp Business API?',
                a: 'Ya. SmartSales terintegrasi dengan WhatsApp Business API sehingga percakapan dengan prospek dan pelanggan tercatat langsung di kartu prospek yang sama, tanpa harus berpindah aplikasi untuk mengecek riwayat chat.',
            },
            {
                q: 'Bagaimana cara kerja pengingat follow-up otomatis?',
                a: 'Setiap prospek atau deal yang butuh tindak lanjut bisa diberi jadwal follow-up. Sistem akan menampilkan pengingat pada waktu yang ditentukan sehingga sales tidak perlu mengandalkan catatan manual atau memori untuk mengingat siapa yang harus dihubungi.',
            },
            {
                q: 'Bisakah tahapan pipeline disesuaikan dengan proses penjualan kami?',
                a: 'Bisa. Tahapan pipeline (misalnya dari prospek masuk sampai closing) dapat dikonfigurasi mengikuti alur penjualan perusahaan Anda, bukan alur baku yang dipaksakan.',
            },
            {
                q: 'Apakah sales manager bisa memantau kinerja tim tanpa harus tanya satu per satu?',
                a: 'Bisa. Sales manager dapat melihat posisi setiap deal di pipeline, siapa yang menangani, dan status follow-up-nya langsung dari dashboard, tanpa harus meminta laporan manual dari masing-masing sales.',
            },
            {
                q: 'Berapa biaya berlangganan SmartSales untuk tim sales?',
                a: 'Detail paket dan harga dapat dilihat di halaman /price. Tim kami juga bisa membantu merekomendasikan paket yang sesuai dengan jumlah pengguna dan kebutuhan tim Anda.',
            },
            {
                q: 'Apakah ada masa uji coba sebelum berlangganan?',
                a: 'Silakan hubungi tim kami melalui WhatsApp untuk menanyakan opsi uji coba yang tersedia saat ini, karena ketentuannya bisa berbeda tergantung kebutuhan dan jumlah pengguna.',
            },
            {
                q: 'Apakah SmartSales bisa dipakai di HP, tidak hanya di komputer?',
                a: 'Bisa. Sales lapangan dapat mengecek pipeline, membuka kartu prospek, dan membalas chat pelanggan langsung dari perangkat mobile, tanpa harus menunggu kembali ke kantor.',
            },
            {
                q: 'Apakah data lama dari spreadsheet atau sistem sebelumnya bisa dipindahkan?',
                a: 'Bisa. Tim kami dapat membantu proses migrasi data pipeline dan kontak yang sudah ada agar tim sales tidak perlu memasukkan ulang data dari nol.',
            },
            {
                q: 'Apakah SmartSales hanya untuk perusahaan besar?',
                a: 'Tidak. SmartSales dibangun sebagai sistem multi-tenant yang bisa disesuaikan untuk tim sales kecil maupun perusahaan dengan banyak sales dan cabang, tergantung paket dan kebutuhan yang dipilih.',
            },
            {
                q: 'Bagaimana cara memulai jika kami tertarik?',
                a: 'Cara tercepat: daftar trial gratis secara mandiri di smartsales.id/register (tanpa kartu kredit, masa trial 30 hari). Ingin didampingi? Klik tombol WhatsApp di halaman ini — tim kami bantu memahami kebutuhan tim sales Anda dan menjelaskan langkah selanjutnya.',
            },
        ],
    },
    en: {
        badge: 'FAQ',
        subtitle: 'Common questions from sales teams and sales managers before adopting SmartSales.',
        title: 'Frequently Asked Questions for Sales Teams',
        faqs: [
            {
                q: 'How long does implementation take before our sales team can start using it?',
                a: 'For standard needs like pipeline setup, prospect cards, and follow-up reminders, our team can usually prepare your account and pipeline structure within a few business days. Custom integrations or workflows take longer depending on complexity.',
            },
            {
                q: 'Is our pipeline and customer data safe?',
                a: 'Each company gets its own isolated data space (multi-tenant), separate from other companies. Access to pipeline data, contacts, and chat history is controlled by user roles, so sales reps can be restricted to their own team\'s data if needed.',
            },
            {
                q: 'Does SmartSales connect with the WhatsApp Business API?',
                a: 'Yes. SmartSales integrates with the WhatsApp Business API so conversations with prospects and customers are logged directly on the same prospect card, without switching apps to check chat history.',
            },
            {
                q: 'How do automated follow-up reminders work?',
                a: 'Any prospect or deal that needs follow-up can be given a schedule. The system surfaces a reminder at the set time, so sales reps don\'t have to rely on manual notes or memory to know who to contact.',
            },
            {
                q: 'Can pipeline stages be customized to match our sales process?',
                a: 'Yes. Pipeline stages (from incoming lead to closing) can be configured to follow your company\'s actual sales flow, instead of a fixed generic flow.',
            },
            {
                q: 'Can sales managers monitor team performance without asking each rep individually?',
                a: 'Yes. Sales managers can see every deal\'s position in the pipeline, who owns it, and its follow-up status directly from the dashboard, without requesting manual reports from each rep.',
            },
            {
                q: 'How much does SmartSales cost for a sales team?',
                a: 'Plan and pricing details are available on the /price page. Our team can also help recommend a plan based on your number of users and team needs.',
            },
            {
                q: 'Is there a trial period before subscribing?',
                a: 'Please reach out to our team via WhatsApp to ask about the trial options currently available, as terms may vary based on your needs and user count.',
            },
            {
                q: 'Can SmartSales be used on mobile, not just on a computer?',
                a: 'Yes. Field sales reps can check the pipeline, open prospect cards, and reply to customer chats directly from a mobile device, without waiting to get back to the office.',
            },
            {
                q: 'Can existing data from spreadsheets or a previous system be migrated?',
                a: 'Yes. Our team can help migrate your existing pipeline and contact data so your sales team doesn\'t have to re-enter everything from scratch.',
            },
            {
                q: 'Is SmartSales only for large companies?',
                a: 'No. SmartSales is built as a multi-tenant system that can be adapted for small sales teams as well as companies with many sales reps and branches, depending on the plan and needs.',
            },
            {
                q: 'How do we get started if we\'re interested?',
                a: 'The fastest way: sign up for the free trial yourself at smartsales.id/register (no credit card, 30-day trial). Prefer guidance? Click the WhatsApp button on this page — our team will help understand your sales team\'s needs and walk you through the next steps.',
            },
        ],
    },
};

export default function SalesFAQ() {
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
