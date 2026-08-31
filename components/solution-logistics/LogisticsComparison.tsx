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
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ClientLogos } from "@/components/ui/ClientLogos";

const COPY = {
    id: {
        badge: "SEBELUM VS SESUDAH",
        title: "Proses Manual vs SmartSales",
        subtitle: "Begini bedanya menangani pickup, cek resi, dan komplain sebelum dan sesudah pakai satu sistem terpadu.",
        colProcess: "Proses",
        colManual: "Cara Manual",
        colSmartSales: "Dengan SmartSales",
        rows: [
            {
                process: "Cek status resi",
                manual: "Admin buka satu per satu chat WhatsApp, cari nomor resi, cek manual ke sistem kurir.",
                smartsales: "Auto-Reply menjawab cek resi otomatis 24/7 lewat WhatsApp Business API resmi.",
            },
            {
                process: "Jadwal pickup B2B",
                manual: "Permintaan pickup dicatat di buku besar atau Excel terpisah, rawan terlewat.",
                smartsales: "Tercatat sebagai kartu di CRM Sales dengan status visual: Terjadwal, Dalam Proses, Selesai.",
            },
            {
                process: "Notifikasi status paket",
                manual: "Pelanggan harus bertanya duluan untuk tahu posisi paketnya.",
                smartsales: "Notifikasi status dikirim otomatis (blast) via WhatsApp saat status berubah.",
            },
            {
                process: "Komplain barang rusak/salah alamat",
                manual: "Komplain masuk lewat chat, sering hilang saat harus dikoordinasikan antar tim.",
                smartsales: "Langsung jadi tiket lewat Ticket Creation, dieskalasi ke Operasional Gudang atau Koordinator Kurir.",
            },
            {
                process: "Pantau progres investigasi",
                manual: "Tidak ada status yang jelas, pelanggan harus follow-up berkali-kali.",
                smartsales: "Status tiket terpantau (Open, In Progress, Resolved) sampai selesai.",
            },
            {
                process: "Laporan rekap ke klien korporat",
                manual: "Disusun manual setiap akhir bulan dari catatan terpisah-pisah.",
                smartsales: "Invoice dan laporan rekap pengiriman dikirim otomatis ke klien korporat.",
            },
        ],
    },
    en: {
        badge: "BEFORE VS AFTER",
        title: "Manual Process vs SmartSales",
        subtitle: "Here's how handling pickups, receipt checks, and complaints differs before and after using one unified system.",
        colProcess: "Process",
        colManual: "Manual Way",
        colSmartSales: "With SmartSales",
        rows: [
            {
                process: "Checking receipt status",
                manual: "Admin opens WhatsApp chats one by one, finds the receipt number, checks the courier system manually.",
                smartsales: "Auto-Reply answers receipt checks automatically 24/7 via the official WhatsApp Business API.",
            },
            {
                process: "B2B pickup scheduling",
                manual: "Pickup requests are logged in a ledger or separate spreadsheet, easy to miss.",
                smartsales: "Recorded as a card in CRM Sales with a visual status: Scheduled, In Progress, Completed.",
            },
            {
                process: "Package status notifications",
                manual: "Customers have to ask first to find out where their package is.",
                smartsales: "Status notifications are sent automatically (blast) via WhatsApp whenever status changes.",
            },
            {
                process: "Damaged/misdelivered goods complaints",
                manual: "Complaints come in through chat and often get lost when coordinating between teams.",
                smartsales: "Instantly becomes a ticket via Ticket Creation, escalated to Warehouse Operations or the Courier Coordinator.",
            },
            {
                process: "Tracking investigation progress",
                manual: "No clear status, customers have to follow up repeatedly.",
                smartsales: "Ticket status is tracked (Open, In Progress, Resolved) until completion.",
            },
            {
                process: "Recap reports for corporate clients",
                manual: "Compiled manually at the end of every month from scattered notes.",
                smartsales: "Invoices and shipment recap reports are sent to corporate clients automatically.",
            },
        ],
    },
};

export default function LogisticsComparison() {
    const { language } = useLanguage();
    const copy = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.paper" }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 }, maxWidth: "800px", mx: "auto" }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: "var(--brand-deep)",
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: "block",
                            textTransform: "uppercase",
                        }}
                    >
                        {copy.badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: "#111827",
                            fontSize: { xs: "1.75rem", md: "2.25rem" },
                            mb: 2,
                        }}
                    >
                        {copy.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#4B5563", fontSize: { xs: "1rem", md: "1.05rem" } }}>
                        {copy.subtitle}
                    </Typography>
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: "24px",
                        border: "1px solid #E2E8F0",
                        overflow: "hidden",
                    }}
                >
                    <Table sx={{ minWidth: 720 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: "#111827",
                                        bgcolor: "var(--surface-alt)",
                                        fontSize: "0.9rem",
                                        width: { md: "22%" },
                                    }}
                                >
                                    {copy.colProcess}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: "#94A3B8",
                                        bgcolor: "var(--surface-alt)",
                                        fontSize: "0.9rem",
                                        width: { md: "36%" },
                                    }}
                                >
                                    {copy.colManual}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: "white",
                                        background: "var(--gradient-brand)",
                                        fontSize: "0.9rem",
                                        width: { md: "42%" },
                                    }}
                                >
                                    {copy.colSmartSales}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {copy.rows.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        "&:last-child td": { borderBottom: 0 },
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 700, color: "#1E293B", verticalAlign: "top" }}>
                                        {row.process}
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: "top" }}>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                            <CloseIcon sx={{ color: "#F87171", fontSize: 18, mt: "2px", flexShrink: 0 }} />
                                            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                                {row.manual}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: "top", bgcolor: "#F5F7FF" }}>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                            <CheckCircleIcon sx={{ color: "var(--brand-deep)", fontSize: 18, mt: "2px", flexShrink: 0 }} />
                                            <Typography sx={{ color: "#334155", fontSize: "0.9rem", lineHeight: 1.6, fontWeight: 500 }}>
                                                {row.smartsales}
                                            </Typography>
                                        </Box>
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
