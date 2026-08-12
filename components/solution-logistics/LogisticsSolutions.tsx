"use client";

import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { Ticket } from "lucide-react";

export default function LogisticsSolutions() {
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
                            <CheckCircleOutlineIcon sx={{ color: '#3854D6' }} />
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
        <Box sx={{ py: { xs: 10, md: 16 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 12 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block', textTransform: 'uppercase' }}>
                        {strings.logistics_sol_badge}
                    </Typography>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                        {strings.logistics_sol_title}
                    </Typography>
                </Box>

                {/* Solution 1: CRM Sales */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 } }}>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.logistics_sol1_title,
                            strings.logistics_sol1_desc,
                            [strings.logistics_sol1_list1, strings.logistics_sol1_list2, strings.logistics_sol1_list3]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 1: B2B Client Profile */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', bgcolor: '#F59E0B' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', mb: 2 }}>Profil Akun Klien B2B</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB', fontWeight: 700 }}>
                                    SM
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>PT. Sentosa Makmur</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Pelanggan Kargo (Kontrak Bulanan)</Typography>
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FEF3C7', color: '#D97706', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    JADWAL PICKUP
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Instruksi Operasional:</span> Pickup 50 Koli barang di Gudang Cikarang hari ini pukul 15.00 WIB. Kurir: Rahmat.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Solution 2: Omnichannel (Reversed Order) */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 }, flexDirection: { xs: 'column-reverse', md: 'row' } }}>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 2: WhatsApp Chat */}
                        <Paper elevation={12} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <Box sx={{ bgcolor: '#075E54', p: 2, borderBottom: '1px solid #054D44', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <WhatsAppIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', lineHeight: 1 }}>WhatsApp Resmi Ekspedisi (Centang Hijau)</Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>Online 24/7 • Respons Otomatis Aktif</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#E5DDD5' }}>
                                <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: '#FFFFFF', p: 2, borderRadius: '0 16px 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>Halo min, mau cek resi paket nomor #EXP881923, kira-kira sampainya kapan ya?</Typography>
                                </Box>
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%', bgcolor: '#DCF8C6', p: 2, borderRadius: '16px 0 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#14532D' }}>
                                        Halo Kak! 👋 Berdasarkan nomor resi #EXP881923, paket Kakak saat ini sudah tiba di Hub Surabaya dan sedang dalam proses pengiriman oleh kurir ke alamat tujuan. Estimasi tiba hari ini sebelum pukul 17.00 WIB. Terima kasih! 🚚
                                    </Typography>
                                </Box>
                                <Box sx={{ px: 2, py: 0.8, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '20px', alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Gunakan balasan cepat: (/CekResi)...</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.logistics_sol2_title,
                            strings.logistics_sol2_desc,
                            [strings.logistics_sol2_list1, strings.logistics_sol2_list2]
                        )}
                    </Grid>
                </Grid>

                {/* Solution 3: Ticketing */}
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.logistics_sol3_title,
                            strings.logistics_sol3_desc,
                            [strings.logistics_sol3_list1, strings.logistics_sol3_list2]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 3: Investigation Ticket */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Ticket size={20} color="#EF4444" /> Tiket Investigasi #882
                                </Typography>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FEE2E2', color: '#B91C1C', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}>
                                    URGENT - SALAH ALAMAT
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', mb: 1.5, textTransform: 'uppercase' }}>
                                LAPORAN PELANGGAN:
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                                    "Min, di status resi tertera 'Delivered', padahal saya belum terima paketnya sama sekali. Tolong di cek ke kurirnya."
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#C4B5FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5B21B6', fontWeight: 800, fontSize: '0.75rem' }}>
                                        OPR
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#5B21B6' }}>Ditugaskan ke: Koordinator Kurir Area</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#7C3AED' }}>Batas Waktu (SLA): 2 Jam untuk Investigasi Bukti Foto</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
