"use client";

import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { Ticket } from "lucide-react";

export default function FinanceSolutions() {
    useLanguage();

    const renderSolutionText = (title: string, desc: string, lists: string[]) => (
        <Box sx={{ pr: { md: 4 } }}>
            <Typography variant="h4" component="h3" sx={{ fontWeight: 800, color: '#111827', mb: 3, lineHeight: 1.3 }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ color: '#4B5563', mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}>
                {desc}
            </Typography>
            <List sx={{ p: 0 }}>
                {lists.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                            <CheckCircleOutlineIcon sx={{ color: 'var(--brand-deep)' }} />
                        </ListItemIcon>
                        <ListItemText
                            primary={item}
                            primaryTypographyProps={{ sx: { color: '#374151', lineHeight: 1.6 } }}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: 'var(--surface-alt)' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography variant="overline" sx={{ color: 'var(--brand-deep)', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block', textTransform: 'uppercase' }}>
                        {strings.fin_sol_subtitle}
                    </Typography>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                        {strings.fin_sol_title}
                    </Typography>
                </Box>

                {/* Solution 1: CRM Sales */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 } }}>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fin_sol1_title,
                            strings.fin_sol1_desc,
                            [strings.fin_sol1_list1, strings.fin_sol1_list2, strings.fin_sol1_list3]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 1: Calon Debitur Profile Profile */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, w: '100%', h: '8px', bgcolor: '#22C55E' }} />
                            <Typography sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Profil Calon Debitur</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5', fontWeight: 700 }}>
                                    AS
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>Agus Setiawan</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Pengajuan: Kredit Usaha (Rp 50 Juta)</Typography>
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#DCFCE7', color: '#15803D', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    SKOR BAIK
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Aktivitas Terakhir:</span> Dokumen KTP & NPWP telah diunggah (Hari ini, 09:30).
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Solution 2: Omnichannel (Reversed Order) */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 }, flexDirection: { xs: 'column-reverse', md: 'row' } }}>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 2: Omnichannel Chat */}
                        <Paper elevation={12} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <Box sx={{ bgcolor: '#F1F5F9', p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Typography sx={{ color: 'white', fontSize: '1rem' }} className="fab fa-whatsapp" />
                                </Box>
                                <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>WhatsApp Resmi Perusahaan</Typography>
                            </Box>
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#FAFAF9' }}>
                                <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: '#FFFFFF', p: 2, borderRadius: '16px 16px 16px 0', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>Selamat pagi, saya ingin bertanya syarat untuk mengajukan KPR rumah baru apa saja ya?</Typography>
                                </Box>
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%', bgcolor: '#DCFCE7', p: 2, borderRadius: '16px 16px 0 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#166534' }}>Selamat pagi Bapak! Untuk pengajuan KPR, syarat utamanya adalah KTP, NPWP, dan Slip Gaji 3 bulan terakhir. Apakah Bapak ingin kami bantu proses pendaftarannya sekarang? 🏢</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: 'white' }}>
                                <Typography sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>Ketik pesan balasan (Tersimpan sebagai arsip)...</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fin_sol2_title,
                            strings.fin_sol2_desc,
                            [strings.fin_sol2_list1, strings.fin_sol2_list2]
                        )}
                    </Grid>
                </Grid>

                {/* Solution 3: Ticketing */}
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fin_sol3_title,
                            strings.fin_sol3_desc,
                            [strings.fin_sol3_list1, strings.fin_sol3_list2]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 3: Escalation Ticket */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Ticket className="color-[#8B5CF6]" /> Tiket Layanan #502
                                </Typography>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FFE4E6', color: '#E11D48', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>
                                    URGENT - KARTU HILANG
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', mb: 1, textTransform: 'uppercase' }}>
                                Laporan Nasabah:
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic' }}>
                                    "Kartu ATM saya tertelan di mesin SPBU, mohon segera diblokir agar saldo tetap aman."
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: '#F5F3FF', borderRadius: '12px', border: '1px solid #EDE9FE' }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#C4B5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B21B6', fontWeight: 700, fontSize: '0.8rem' }}>
                                    IT
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#4C1D95' }}>Ditugaskan ke: Tim IT / Security</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#6D28D9' }}>Batas Waktu (SLA): 15 Menit</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
