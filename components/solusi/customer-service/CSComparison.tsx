"use client";

import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useLanguage } from "@/lib/context/LanguageContext";

const COPY = {
    id: {
        badge: "PERBANDINGAN",
        title: "Cara Manual vs Customer Service dengan SmartSales",
        desc: "Begini perbedaan alur kerja tim CS saat menangani chat dan keluhan pelanggan secara manual dibanding menggunakan SmartSales.",
        colAspect: "Aspek",
        colManual: "Cara Manual",
        colSmartSales: "Dengan SmartSales",
        rows: [
            {
                aspect: "Menerima pesan dari berbagai kanal",
                manual: "Buka tab WhatsApp, Instagram, dan Email secara terpisah satu per satu",
                smartsales: "Semua pesan masuk ke satu inbox omnichannel yang sama"
            },
            {
                aspect: "Pelanggan pindah agen atau shift",
                manual: "Pelanggan harus mengulang cerita karena riwayat keluhan tidak tersimpan",
                smartsales: "Riwayat chat tersimpan, agen baru langsung paham konteks masalah"
            },
            {
                aspect: "Keluhan yang perlu bantuan divisi lain",
                manual: "Dilaporkan manual lewat chat/telepon ke divisi lain, rawan terlupakan",
                smartsales: "Diubah menjadi Tiket Tugas dengan status jelas (Open, In Progress, Resolved)"
            },
            {
                aspect: "Batas waktu penyelesaian keluhan",
                manual: "Tidak ada pengingat otomatis, keluhan bisa menggantung tanpa disadari",
                smartsales: "SLA per tiket, supervisor mendapat notifikasi jika batas waktu terlewat"
            },
            {
                aspect: "Menjawab pertanyaan berulang (ongkir, jam operasional, refund)",
                manual: "Mengetik ulang jawaban yang sama setiap kali ada pertanyaan serupa",
                smartsales: "Pakai Quick Replies siap pakai yang bisa dikirim dengan satu klik"
            },
            {
                aspect: "Distribusi chat ke agen",
                manual: "Dibagi manual atau agen berebut menjawab, mudah menumpuk pada satu orang",
                smartsales: "Auto-Routing membagikan antrean chat secara merata ke agen yang online"
            },
            {
                aspect: "Balasan di luar jam kerja",
                manual: "Pelanggan tidak mendapat respons apa pun sampai jam kerja berikutnya",
                smartsales: "Welcome Message dan Away Message otomatis aktif di luar jam operasional"
            }
        ],
        footnote: "Ringkasan di atas menggambarkan alur kerja umum, bukan klaim hasil yang dijamin untuk setiap bisnis."
    },
    en: {
        badge: "COMPARISON",
        title: "Manual Process vs Customer Service with SmartSales",
        desc: "Here's how a CS team's workflow differs when handling customer chats and complaints manually versus using SmartSales.",
        colAspect: "Aspect",
        colManual: "Manual Process",
        colSmartSales: "With SmartSales",
        rows: [
            {
                aspect: "Receiving messages from different channels",
                manual: "Open WhatsApp, Instagram, and Email tabs separately one by one",
                smartsales: "All messages land in the same omnichannel inbox"
            },
            {
                aspect: "Customer moves to another agent or shift",
                manual: "Customer has to repeat their story because complaint history isn't saved",
                smartsales: "Chat history is saved, so the new agent immediately understands the context"
            },
            {
                aspect: "Complaints that need help from another division",
                manual: "Reported manually by chat or phone to another division, easy to forget",
                smartsales: "Converted into a Task Ticket with a clear status (Open, In Progress, Resolved)"
            },
            {
                aspect: "Complaint resolution deadline",
                manual: "No automatic reminder, complaints can go stale without anyone noticing",
                smartsales: "SLA per ticket, supervisor gets notified if the deadline is missed"
            },
            {
                aspect: "Answering repeat questions (shipping, hours, refunds)",
                manual: "Retyping the same answer every time a similar question comes in",
                smartsales: "Use ready-made Quick Replies that can be sent with one click"
            },
            {
                aspect: "Distributing chats to agents",
                manual: "Split manually or agents race to answer, easy to pile up on one person",
                smartsales: "Auto-Routing distributes the chat queue evenly to agents who are online"
            },
            {
                aspect: "Replies outside working hours",
                manual: "Customer gets no response at all until the next working hours",
                smartsales: "Welcome Message and Away Message automatically active outside operating hours"
            }
        ],
        footnote: "The summary above describes a typical workflow, not a guaranteed outcome for every business."
    }
};

export default function CSComparison() {
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
