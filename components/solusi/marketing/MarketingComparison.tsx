"use client";

import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs Marketing dengan SmartSales",
        desc: "Begini perbedaan alur kerja tim marketing saat mengelola campaign secara manual dibanding menggunakan SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmartSales: "Dengan SmartSales",
        rows: [
            {
                aspect: "Kirim WA & Email Blast",
                manual: "Kirim satu per satu dari HP pribadi atau tools terpisah untuk WhatsApp dan Email",
                smartsales: "Kirim broadcast WhatsApp Business API dan Email dari satu platform yang sama"
            },
            {
                aspect: "Balasan pelanggan",
                manual: "Balasan tersebar di banyak nomor/akun, mudah terlewat atau terlambat direspons",
                smartsales: "Semua balasan masuk ke satu inbox CRM yang bisa dipantau tim"
            },
            {
                aspect: "Segmentasi kontak",
                manual: "Menyortir manual dari spreadsheet sebelum setiap pengiriman",
                smartsales: "Gunakan Custom Tags untuk menyegmentasikan kontak dan pilih target langsung saat broadcast"
            },
            {
                aspect: "Melacak sumber lead",
                manual: "Sulit mengetahui campaign mana yang menghasilkan lead tanpa pencatatan manual",
                smartsales: "Sumber setiap lead (WhatsApp, Email, Web Form) tercatat otomatis"
            },
            {
                aspect: "Mengukur ROI campaign",
                manual: "Menebak efektivitas iklan karena data marketing dan data penjualan terpisah",
                smartsales: "Lead dari campaign terhubung dengan follow-up Sales hingga transaksi tercatat"
            },
            {
                aspect: "Koordinasi dengan tim Sales",
                manual: "Data lead dikirim manual (chat/spreadsheet), rawan tidak ditindaklanjuti",
                smartsales: "Lead baru bisa didistribusikan otomatis ke agen Sales yang bertugas (Auto-Routing)"
            }
        ],
        footnote: "Ringkasan di atas menggambarkan alur kerja umum, bukan klaim hasil yang dijamin untuk setiap bisnis."
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs Marketing with SmartSales",
        desc: "Here's how a marketing team's workflow differs when managing campaigns manually versus using SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmartSales: "With SmartSales",
        rows: [
            {
                aspect: "Sending WA & Email Blast",
                manual: "Sent one by one from a personal phone or separate tools for WhatsApp and Email",
                smartsales: "Send WhatsApp Business API and Email broadcasts from the same platform"
            },
            {
                aspect: "Customer replies",
                manual: "Replies scattered across many numbers/accounts, easy to miss or respond to late",
                smartsales: "All replies land in one CRM inbox the whole team can monitor"
            },
            {
                aspect: "Contact segmentation",
                manual: "Manually sorted from a spreadsheet before every send",
                smartsales: "Use Custom Tags to segment contacts and pick a target directly when broadcasting"
            },
            {
                aspect: "Tracking lead source",
                manual: "Hard to know which campaign generated a lead without manual logging",
                smartsales: "Every lead's source (WhatsApp, Email, Web Form) is recorded automatically"
            },
            {
                aspect: "Measuring campaign ROI",
                manual: "Guessing ad effectiveness because marketing and sales data live separately",
                smartsales: "Campaign leads are linked to Sales follow-up all the way to a recorded transaction"
            },
            {
                aspect: "Coordinating with Sales",
                manual: "Lead data shared manually (chat/spreadsheet), easy to leave unfollowed",
                smartsales: "New leads can be auto-distributed to the Sales agent on duty (Auto-Routing)"
            }
        ],
        footnote: "The summary above describes a typical workflow, not a guaranteed outcome for every business."
    }
};

export default function MarketingComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
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
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '640px', mx: 'auto' }}>
                        {t.desc}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: '24px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.875rem' }}>{t.colAspect}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.875rem' }}>{t.colManual}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#597CFF', fontSize: '0.875rem' }}>{t.colSmartSales}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        '&:last-child td': { border: 0 },
                                        '&:hover': { bgcolor: '#F8FAFC' }
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A', verticalAlign: 'top', width: { md: '20%' } }}>
                                        {row.aspect}
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748B', verticalAlign: 'top' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CloseIcon sx={{ fontSize: 18, color: '#F43F5E', mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                                                {row.manual}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#334155', verticalAlign: 'top' }}>
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <CheckCircleIcon sx={{ fontSize: 18, color: '#22C55E', mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                                                {row.smartsales}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#94A3B8', mt: 3 }}>
                    {t.footnote}
                </Typography>
            </Container>
        </Box>
    );
}
