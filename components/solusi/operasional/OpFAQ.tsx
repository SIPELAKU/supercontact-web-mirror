"use client";

import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERTANYAAN UMUM",
        title: "Pertanyaan Seputar SmartSales untuk Tim Operasional",
        desc: "Hal-hal yang paling sering ditanyakan tim operasional sebelum mulai memakai SmartSales.",
        items: [
            {
                q: "Bagaimana SmartSales melacak keberadaan tim lapangan secara real-time?",
                a: "Staf lapangan melakukan Check-in dan Check-out berbasis GPS (Geotagging) saat mulai dan menyelesaikan tugas. Status ini langsung terlihat di dashboard Control Tower Operasional, sehingga tim pusat tahu di mana staf berada dan sejauh mana progres tugas hari itu."
            },
            {
                q: "Apakah staf lapangan bisa melaporkan bukti pekerjaan tanpa mengetik laporan panjang?",
                a: "Bisa. Saat menyelesaikan instalasi, pengiriman, atau perbaikan, staf lapangan cukup mengunggah Photo Proof dan tanda tangan digital dari aplikasi, langsung terhubung ke tugas yang bersangkutan tanpa perlu mengirim laporan terpisah lewat chat."
            },
            {
                q: "Bagaimana cara notifikasi penugasan (dispatch/SPK) dikirim ke staf lapangan?",
                a: "Notifikasi penugasan dikirim otomatis ke nomor WhatsApp staf menggunakan WhatsApp Business API, sehingga tim tidak perlu mengetik ulang surat perintah kerja satu per satu di grup WhatsApp."
            },
            {
                q: "Bagaimana proses pelaporan insiden atau kerusakan alat di lapangan ditangani?",
                a: "Laporan kerusakan yang dikirim staf lapangan lewat WhatsApp langsung diubah menjadi Tiket Perbaikan melalui fitur Ticket Creation, lalu ditugaskan ke tim Maintenance atau Engineering dengan Service Level Agreement (SLA) yang bisa dipantau."
            },
            {
                q: "Apa yang terjadi jika ada perubahan jadwal tugas secara mendadak dari kantor pusat?",
                a: "Jadwal dan alokasi tugas dapat diatur ulang secara dinamis dari sistem. Perubahan tersebut langsung terlihat oleh staf lapangan yang terdampak tanpa harus menghubungi satu per satu."
            },
            {
                q: "Bisakah SmartSales dipakai untuk mengingatkan jadwal perawatan rutin armada atau kontrak vendor?",
                a: "Bisa. Anda dapat mengatur notifikasi otomatis untuk jadwal perawatan rutin armada (fleet maintenance) atau tanggal perpanjangan kontrak vendor, sehingga tidak ada jadwal yang terlewat."
            },
            {
                q: "Apakah data lokasi dan aktivitas tim lapangan kami aman dari perusahaan lain?",
                a: "Data disimpan pada infrastruktur multi-tenant dengan pemisahan data antar perusahaan, sehingga data lokasi, tugas, dan tiket insiden tim Anda hanya bisa diakses oleh pengguna berwenang di tenant Anda sendiri."
            },
            {
                q: "Bisakah alur kerja operasional disesuaikan dengan proses yang sudah berjalan di perusahaan kami?",
                a: "Bisa. Karena SmartSales dibangun dengan pendekatan custom build, struktur tugas lapangan, kategori tiket insiden, hingga template pesan dispatch dapat disesuaikan dengan proses operasional yang sudah ada di perusahaan Anda."
            },
            {
                q: "Berapa biaya berlangganan SmartSales untuk kebutuhan tim operasional?",
                a: "Detail paket dan harga tersedia di halaman Harga kami. Silakan kunjungi halaman /price untuk melihat pilihan paket yang sesuai dengan jumlah staf lapangan dan kebutuhan modul Anda."
            },
            {
                q: "Apakah tersedia uji coba gratis sebelum berlangganan?",
                a: "Tersedia. Anda bisa memulai uji coba gratis atau konsultasi langsung dengan tim kami terlebih dahulu untuk melihat apakah alur penugasan lapangan, notifikasi WhatsApp, dan ticketing di SmartSales sesuai dengan kebutuhan operasional Anda."
            }
        ]
    },
    en: {
        badge: "FREQUENTLY ASKED QUESTIONS",
        title: "Questions About SmartSales for Operations Teams",
        desc: "The questions operations teams ask most often before adopting SmartSales.",
        items: [
            {
                q: "How does SmartSales track where the field team is in real time?",
                a: "Field staff perform GPS-based Check-in and Check-out (Geotagging) when starting and finishing a task. This status shows up immediately on the Operations Control Tower dashboard, so the central team knows where staff are and how the day's tasks are progressing."
            },
            {
                q: "Can field staff report proof of work without typing a long report?",
                a: "Yes. When finishing an installation, delivery, or repair, field staff simply upload Photo Proof and a digital signature from the app, linked directly to the relevant task without sending a separate report over chat."
            },
            {
                q: "How are assignment notifications (dispatch) sent to field staff?",
                a: "Assignment notifications are sent automatically to staff WhatsApp numbers using the WhatsApp Business API, so the team doesn't have to retype work orders one by one in a WhatsApp group."
            },
            {
                q: "How is field incident or equipment breakdown reporting handled?",
                a: "A breakdown report sent by field staff via WhatsApp is automatically turned into a Repair Ticket through the Ticket Creation feature, then assigned to the Maintenance or Engineering team with a trackable Service Level Agreement (SLA)."
            },
            {
                q: "What happens if there's a sudden schedule change from head office?",
                a: "Task schedules and allocation can be dynamically rearranged in the system. The change is immediately visible to the affected field staff without needing to contact them one by one."
            },
            {
                q: "Can SmartSales remind us about routine fleet maintenance or vendor contract schedules?",
                a: "Yes. You can set up automated notifications for routine fleet maintenance schedules or vendor contract renewal dates, so nothing gets missed."
            },
            {
                q: "Is our field team's location and activity data safe from other companies?",
                a: "Data is stored on multi-tenant infrastructure with data separation between companies, so your team's location, task, and incident ticket data can only be accessed by authorized users within your own tenant."
            },
            {
                q: "Can the operational workflow be adapted to our company's existing process?",
                a: "Yes. Because SmartSales is built with a custom-build approach, field task structures, incident ticket categories, and dispatch message templates can be adapted to the operational process your company already runs."
            },
            {
                q: "How much does a SmartSales subscription cost for an operations team?",
                a: "Plan and pricing details are on our Pricing page. Visit /price to see the plan options that fit your number of field staff and module needs."
            },
            {
                q: "Is a free trial available before subscribing?",
                a: "Yes. You can start a free trial or talk directly with our team first to see whether the field assignment, WhatsApp notification, and ticketing workflow in SmartSales fits your operational needs."
            }
        ]
    }
};

export default function OpFAQ() {
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
