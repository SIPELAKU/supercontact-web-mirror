"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Tim Marketing",
        desc: "Hal-hal yang paling sering ditanyakan tim marketing sebelum mulai memakai SmartSales.",
        items: [
            {
                q: "Apakah SmartSales bisa mengirim WhatsApp Blast dan Email Blast sekaligus?",
                a: "Bisa. Anda dapat mengirim broadcast promosi lewat WhatsApp Business API dan Email dari satu platform yang sama, lalu semua balasan pelanggan masuk ke inbox CRM yang sama sehingga tidak tercecer di aplikasi terpisah."
            },
            {
                q: "Bagaimana cara melacak ROI dari kampanye yang saya kirim?",
                a: "Setiap lead yang masuk otomatis tercatat sumbernya (WhatsApp, Email, atau Web Form). SmartSales menghubungkan lead tersebut dengan follow-up tim Sales sampai transaksi tercatat, sehingga Anda bisa melihat kampanye mana yang benar-benar menghasilkan penjualan, bukan sekadar jumlah pesan terkirim."
            },
            {
                q: "Berapa lama waktu implementasi sampai tim marketing bisa mulai broadcast?",
                a: "Untuk kebutuhan broadcast dan inbox dasar, tim Anda umumnya sudah bisa mulai memakai SmartSales dalam hitungan hari setelah data kontak dan nomor WhatsApp Business disiapkan. Kebutuhan integrasi atau kustomisasi tambahan akan didiskusikan sesuai kompleksitasnya saat onboarding."
            },
            {
                q: "Apakah bisa menyegmentasikan kontak sebelum mengirim broadcast?",
                a: "Bisa. Anda dapat memakai Custom Tags di CRM untuk mengelompokkan kontak, misalnya berdasarkan status pelanggan atau minat produk, lalu memilih segmen tersebut sebagai target sebelum mengirim broadcast WhatsApp atau Email."
            },
            {
                q: "Apakah pesan WhatsApp yang dikirim melalui SmartSales resmi dan aman dari risiko banned?",
                a: "SmartSales terintegrasi dengan WhatsApp Business API resmi, bukan modifikasi WhatsApp biasa, sehingga pengiriman pesan mengikuti aturan resmi Meta dan lebih aman dibanding tools tidak resmi."
            },
            {
                q: "Apakah lead yang masuk dari campaign otomatis terhubung ke tim Sales?",
                a: "Ya. Lead baru yang masuk dari balasan WhatsApp, Email, atau Web Form bisa didistribusikan otomatis ke agen Sales atau Telesales yang bertugas (Auto-Routing), sehingga Marketing dapat memantau apakah lead tersebut ditindaklanjuti."
            },
            {
                q: "Apakah saya bisa melihat tingkat keterbacaan (read rate) pesan broadcast?",
                a: "Bisa. SmartSales mencatat status pengiriman dan jumlah pelanggan yang merespons kampanye promosi Anda, sehingga Anda punya data untuk membandingkan performa antar campaign."
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk tim Marketing?",
                a: "Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi halaman /price untuk melihat pilihan paket yang sesuai dengan kebutuhan volume kontak dan fitur marketing Anda."
            },
            {
                q: "Apakah data pelanggan dan histori campaign kami aman?",
                a: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, dan hanya pengguna yang berwenang di tenant Anda yang dapat mengakses database kontak serta histori campaign."
            },
            {
                q: "Bisakah SmartSales disesuaikan dengan alur campaign khusus perusahaan kami?",
                a: "Bisa. Karena SmartSales dibangun dengan pendekatan custom build, kebutuhan khusus seperti template pesan, struktur tag segmentasi, atau laporan funnel tertentu dapat didiskusikan dan disesuaikan dengan tim kami."
            },
            {
                q: "Apakah tersedia uji coba gratis sebelum berlangganan?",
                a: "Tersedia. Anda bisa memulai uji coba gratis untuk mencoba langsung fitur inbox, broadcast, dan pelacakan funnel sebelum memutuskan berlangganan."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for Marketing Teams",
        desc: "The questions marketing teams ask most often before adopting SmartSales.",
        items: [
            {
                q: "Can SmartSales send WhatsApp Blast and Email Blast at the same time?",
                a: "Yes. You can send promotional broadcasts via WhatsApp Business API and Email from the same platform, and every customer reply lands in the same CRM inbox so nothing gets scattered across separate apps."
            },
            {
                q: "How do I track the ROI of the campaigns I send?",
                a: "Every incoming lead is automatically tagged with its source (WhatsApp, Email, or Web Form). SmartSales links that lead to the Sales team's follow-up until a transaction is recorded, so you can see which campaign actually generated revenue, not just how many messages were sent."
            },
            {
                q: "How long does implementation take before marketing can start sending broadcasts?",
                a: "For basic broadcast and inbox needs, your team can typically start using SmartSales within days once your contact data and WhatsApp Business number are ready. Additional integration or customization needs are scoped during onboarding based on complexity."
            },
            {
                q: "Can I segment contacts before sending a broadcast?",
                a: "Yes. You can use Custom Tags in the CRM to group contacts, for example by customer status or product interest, then select that segment as your target before sending a WhatsApp or Email broadcast."
            },
            {
                q: "Are WhatsApp messages sent through SmartSales official and safe from being banned?",
                a: "SmartSales integrates with the official WhatsApp Business API, not an unofficial WhatsApp mod, so messages follow Meta's official rules and are safer than unofficial tools."
            },
            {
                q: "Are leads from a campaign automatically connected to the Sales team?",
                a: "Yes. New leads coming in from WhatsApp replies, Email, or a Web Form can be automatically distributed to the Sales or Telesales agent on duty (Auto-Routing), so Marketing can monitor whether each lead gets followed up."
            },
            {
                q: "Can I see the read rate of my broadcast messages?",
                a: "Yes. SmartSales records delivery status and how many customers responded to your promotional campaign, giving you data to compare performance across campaigns."
            },
            {
                q: "How much does a SmartSales subscription cost for a Marketing team?",
                a: "Plan and pricing details are on our Pricing page. Visit /price to see the plan options that fit your contact volume and marketing feature needs."
            },
            {
                q: "Is our customer data and campaign history safe?",
                a: "Data is stored on multi-tenant infrastructure with data separation between companies, and only authorized users within your tenant can access the contact database and campaign history."
            },
            {
                q: "Can SmartSales be customized to our company's specific campaign workflow?",
                a: "Yes. Because SmartSales is built with a custom-build approach, specific needs like message templates, segmentation tag structures, or particular funnel reports can be discussed and adapted with our team."
            },
            {
                q: "Is a free trial available before subscribing?",
                a: "Yes. You can start a free trial to try the inbox, broadcast, and funnel-tracking features directly before deciding to subscribe."
            }
        ]
    }
};

export default function MarketingFAQ() {
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
