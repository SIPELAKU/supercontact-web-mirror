"use client";

import { Box, Container, Typography, Stack, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ClientLogos } from '@/components/ui/ClientLogos';

const COPY = {
    id: {
        badge: "SEBELUM & SESUDAH",
        title: "Cara Manual vs Dengan SmartSales",
        desc: "Lihat perbedaan nyata mengelola tim dan proses lapangan sebelum dan sesudah menggunakan SmartSales.",
        colProcess: "Proses",
        colManual: "Cara Manual",
        colSmart: "Dengan SmartSales",
        rows: [
            {
                process: "Penugasan tugas lapangan",
                manual: "Dibagikan satu per satu lewat grup WhatsApp, rawan terlewat atau salah kirim.",
                smart: "Alokasi tugas terpusat dengan rute berbasis peta, langsung terlihat oleh staf terkait."
            },
            {
                process: "Verifikasi kehadiran & lokasi",
                manual: "Mengandalkan laporan lisan atau foto yang dikirim manual, sulit dipastikan kebenarannya.",
                smart: "Check-in dan Check-out berbasis GPS (Geotagging) tercatat otomatis di sistem."
            },
            {
                process: "Bukti penyelesaian tugas",
                manual: "Foto pekerjaan tersebar di chat pribadi masing-masing staf, sulit ditelusuri kembali.",
                smart: "Foto proof dan tanda tangan digital tersimpan langsung pada tugas yang bersangkutan."
            },
            {
                process: "Notifikasi penugasan (dispatch/SPK)",
                manual: "Diketik ulang manual satu per satu di grup WhatsApp setiap ada tugas baru.",
                smart: "Pesan dispatch/SPK terkirim otomatis ke WhatsApp staf lewat WhatsApp Business API."
            },
            {
                process: "Pelaporan insiden atau kerusakan",
                manual: "Dilaporkan lewat telepon atau chat, sering terlewat sehingga penanganan terlambat.",
                smart: "Otomatis menjadi tiket perbaikan dengan penugasan tim dan SLA yang bisa dilacak."
            },
            {
                process: "Perubahan jadwal mendadak",
                manual: "Informasi revisi jadwal sulit menjangkau semua staf yang terdampak tepat waktu.",
                smart: "Jadwal dapat diatur ulang secara dinamis dan langsung terlihat oleh staf terkait."
            }
        ]
    },
    en: {
        badge: "BEFORE & AFTER",
        title: "Manual Process vs With SmartSales",
        desc: "See the real difference in managing field teams and processes before and after using SmartSales.",
        colProcess: "Process",
        colManual: "Manual Way",
        colSmart: "With SmartSales",
        rows: [
            {
                process: "Field task assignment",
                manual: "Shared one by one through WhatsApp groups, easy to miss or send to the wrong person.",
                smart: "Centralized task allocation with map-based routing, visible directly to the assigned staff."
            },
            {
                process: "Attendance & location verification",
                manual: "Relies on verbal reports or manually sent photos that are hard to verify.",
                smart: "GPS-based Check-in and Check-out (Geotagging) recorded automatically in the system."
            },
            {
                process: "Proof of task completion",
                manual: "Work photos scattered across each staff member's private chat, hard to trace back.",
                smart: "Photo proof and digital signatures are stored directly on the related task."
            },
            {
                process: "Assignment notifications (dispatch)",
                manual: "Retyped manually one by one in a WhatsApp group for every new task.",
                smart: "Dispatch messages are sent automatically to staff WhatsApp via the WhatsApp Business API."
            },
            {
                process: "Incident or breakdown reporting",
                manual: "Reported by phone or chat, often missed, so handling is delayed.",
                smart: "Automatically becomes a repair ticket with team assignment and a trackable SLA."
            },
            {
                process: "Sudden schedule changes",
                manual: "Schedule revisions are hard to reach every affected staff member in time.",
                smart: "Schedules can be dynamically rearranged and are immediately visible to the relevant staff."
            }
        ]
    }
};

export default function OpComparison() {
    const { language } = useLanguage();
    const t = COPY[language];

    return (
        <>
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Stack spacing={2} sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{ color: 'var(--brand-deep)', fontWeight: 800, letterSpacing: 2, display: 'block' }}
                    >
                        {t.badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', lineHeight: 1.2 }}
                    >
                        {t.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#64748B', maxWidth: '620px', mx: 'auto' }}>
                        {t.desc}
                    </Typography>
                </Stack>

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
                            <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A', bgcolor: 'var(--surface-alt)', fontSize: '0.9rem', width: { md: '26%' } }}>
                                    {t.colProcess}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B', bgcolor: 'var(--surface-alt)', fontSize: '0.9rem', width: { md: '37%' } }}>
                                    {t.colManual}
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 800,
                                        color: 'white',
                                        background: 'var(--gradient-brand)',
                                        fontSize: '0.9rem',
                                        width: { md: '37%' }
                                    }}
                                >
                                    {t.colSmart}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {t.rows.map((row, index) => (
                                <TableRow key={index} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                    <TableCell sx={{ fontWeight: 700, color: '#1E293B', fontSize: '0.9rem', verticalAlign: 'top' }}>
                                        {row.process}
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <CloseIcon sx={{ color: '#EF4444', fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6 }}>
                                                {row.manual}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ verticalAlign: 'top', bgcolor: '#F5F8FF' }}>
                                        <Stack direction="row" spacing={1} alignItems="flex-start">
                                            <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, lineHeight: 1.6 }}>
                                                {row.smart}
                                            </Typography>
                                        </Stack>
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
