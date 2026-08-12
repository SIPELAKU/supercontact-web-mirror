"use client";

import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        badge: "SEBELUM VS SESUDAH",
        title: "Proses Manual vs SmartSales CRM Services",
        desc: "Begini bedanya menangani komplain dan pertanyaan pelanggan dengan cara manual dibandingkan dengan sistem ticketing terpusat SmartSales.",
        colManual: "Cara Manual",
        colSmartSales: "SmartSales CRM Services",
        rows: [
            {
                aspect: "Pencatatan komplain pelanggan",
                manual: "Dicatat manual di spreadsheet atau catatan terpisah, rawan tercecer saat channel banyak.",
                smartsales: "Otomatis menjadi tiket dari WhatsApp, Instagram, dan Email dalam satu halaman."
            },
            {
                aspect: "Pembagian tugas ke agen",
                manual: "Dibagi manual lewat grup chat internal atau pesan pribadi ke agen.",
                smartsales: "Automated Routing meneruskan tiket berdasarkan keahlian, shift, atau beban kerja agen."
            },
            {
                aspect: "Memantau tiket yang lambat direspons",
                manual: "Sulit dipantau secara real-time, biasanya baru diketahui setelah pelanggan komplain ulang.",
                smartsales: "Batas waktu SLA diatur di sistem, dengan peringatan atau eskalasi otomatis ke supervisor."
            },
            {
                aspect: "Menjawab pertanyaan yang sering berulang",
                manual: "Agen mengetik ulang jawaban yang sama setiap kali ada pertanyaan serupa.",
                smartsales: "Quick Replies menyediakan template siap pakai yang tinggal dikirim satu klik."
            },
            {
                aspect: "Histori komunikasi dengan pelanggan",
                manual: "Tersebar di beberapa aplikasi berbeda sesuai channel yang dipakai pelanggan.",
                smartsales: "Tercatat dalam satu profil kontak, mencakup histori dari semua channel."
            },
            {
                aspect: "Memantau performa tim CS",
                manual: "Direkap manual di akhir periode, sulit melihat kondisi terkini.",
                smartsales: "Metrik seperti rata-rata waktu respons dan jumlah tiket selesai terlihat langsung di dashboard."
            }
        ]
    },
    en: {
        badge: "BEFORE VS AFTER",
        title: "Manual Process vs SmartSales CRM Services",
        desc: "Here's the difference between handling customer complaints and questions manually versus using SmartSales' centralized ticketing system.",
        colManual: "Manual Process",
        colSmartSales: "SmartSales CRM Services",
        rows: [
            {
                aspect: "Logging customer complaints",
                manual: "Recorded manually in spreadsheets or separate notes, easy to lose track of across many channels.",
                smartsales: "Automatically becomes a ticket from WhatsApp, Instagram, and Email on a single page."
            },
            {
                aspect: "Assigning tasks to agents",
                manual: "Assigned manually through internal chat groups or direct messages to agents.",
                smartsales: "Automated Routing forwards tickets based on agent expertise, shift, or workload."
            },
            {
                aspect: "Tracking tickets with slow responses",
                manual: "Hard to monitor in real time, usually only noticed after a customer complains again.",
                smartsales: "SLA time limits are set in the system, with automatic alerts or escalation to a supervisor."
            },
            {
                aspect: "Answering frequently repeated questions",
                manual: "Agents retype the same answer every time a similar question comes in.",
                smartsales: "Quick Replies provide ready-made templates that can be sent in one click."
            },
            {
                aspect: "Customer communication history",
                manual: "Scattered across several different apps depending on the channel the customer used.",
                smartsales: "Recorded in a single contact profile, covering history across all channels."
            },
            {
                aspect: "Tracking CS team performance",
                manual: "Compiled manually at the end of a period, hard to see the current state.",
                smartsales: "Metrics like average response time and resolved ticket count are visible directly on a dashboard."
            }
        ]
    }
};

export default function CrmServicesComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 }, maxWidth: '700px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase'
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
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        {t.title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' }
                        }}
                    >
                        {t.desc}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 720 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.95rem',
                                        color: 'text.primary',
                                        bgcolor: '#FAFAFA',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        width: { xs: '28%', md: '24%' }
                                    }}
                                >
                                    &nbsp;
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.95rem',
                                        color: '#6B7280',
                                        bgcolor: '#FAFAFA',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CloseRoundedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                        {t.colManual}
                                    </Box>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: '0.95rem',
                                        color: '#3854D6',
                                        bgcolor: '#EEF2FF',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#3854D6' }} />
                                        {t.colSmartSales}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td': { borderBottom: 0 },
                                    }}
                                >
                                    <TableCell
                                        sx={{
                                            fontWeight: 700,
                                            color: 'text.primary',
                                            fontSize: '0.9rem',
                                            verticalAlign: 'top',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: 'text.secondary',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.6,
                                            verticalAlign: 'top',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {row.manual}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: 'text.primary',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.6,
                                            verticalAlign: 'top',
                                            bgcolor: '#F5F7FF',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        {row.smartsales}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
        <ClientLogos />
        </>
    );
}
