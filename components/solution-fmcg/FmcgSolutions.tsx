"use client";

import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { Ticket, Store } from "lucide-react";

export default function FmcgSolutions() {
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
                        {strings.fmcg_sol_badge}
                    </Typography>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                        {strings.fmcg_sol_title}
                    </Typography>
                </Box>

                {/* Solution 1: CRM & Canvassing */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 } }}>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fmcg_sol1_title,
                            strings.fmcg_sol1_desc,
                            [strings.fmcg_sol1_list1, strings.fmcg_sol1_list2, strings.fmcg_sol1_list3]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 1: Retailer Profile */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', bgcolor: '#10B981' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', mb: 2 }}>Profil Toko / Retailer</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 700 }}>
                                    SR
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>Toko Sumber Rejeki</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Tipe: Grosir Menengah</Typography>
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FEF3C7', color: '#D97706', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    JADWAL VISIT
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Typography sx={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Instruksi Sales:</span> Jadwal visit hari ini pukul 11:00. Tawarkan promo produk susu kemasan baru.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Solution 2: WhatsApp Ordering (Reversed Order) */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 }, flexDirection: { xs: 'column-reverse', md: 'row' } }}>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 2: WhatsApp Chat */}
                        <Paper elevation={12} sx={{ borderRadius: '24px', overflow: 'hidden' }}>
                            <Box sx={{ bgcolor: '#075E54', p: 2, borderBottom: '1px solid #054D44', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <WhatsAppIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.9rem', lineHeight: 1 }}>WhatsApp Resmi Distributor (Centang Hijau)</Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>Pusat Order & Layanan Pelanggan</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#E5DDD5' }}>
                                <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: '#FFFFFF', p: 2, borderRadius: '0 16px 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#334155' }}>Min, pesanan untuk Warung Bu Yati ya. Order Kopi Sachet merk X 5 dus dan Sabun cuci cair 10 karton. Apakah stoknya ada?</Typography>
                                </Box>
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%', bgcolor: '#DCF8C6', p: 2, borderRadius: '16px 0 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.85rem', color: '#14532D' }}>
                                        Halo Ibu Yati! 👋 Pesanan sudah kami terima. Stok Kopi dan Sabun tersedia di gudang. Total tagihan Rp 1.550.000. Barang akan dikirimkan besok pagi oleh armada kami. Terima kasih! 🚚
                                    </Typography>
                                </Box>
                                <Box sx={{ px: 2, py: 0.8, bgcolor: 'rgba(255,255,255,0.8)', borderRadius: '20px', alignSelf: 'center' }}>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>Gunakan balasan cepat: (/KatalogHarga)...</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fmcg_sol2_title,
                            strings.fmcg_sol2_desc,
                            [strings.fmcg_sol2_list1, strings.fmcg_sol2_list2]
                        )}
                    </Grid>
                </Grid>

                {/* Solution 3: Returns & Complaints */}
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.fmcg_sol3_title,
                            strings.fmcg_sol3_desc,
                            [strings.fmcg_sol3_list1, strings.fmcg_sol3_list2]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 3: Return Ticket */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Ticket size={20} color="#8B5CF6" /> Tiket Retur #904
                                </Typography>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#F3E8FF', color: '#7E22CE', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}>
                                    PROSES - GUDANG
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', mb: 1.5, textTransform: 'uppercase' }}>
                                LAPORAN TOKO:
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontStyle: 'italic', lineHeight: 1.5 }}>
                                    "Ada 2 karton susu kaleng penyok dari pengiriman kemarin. Tolong diproses retur untuk diganti baru."
                                </Typography>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: '#F5F3FF', borderRadius: '12px', border: '1px solid #DDD6FE' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7E22CE', fontWeight: 800, fontSize: '0.75rem' }}>
                                        WH
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#7E22CE' }}>Ditugaskan ke: Kepala Gudang (Warehouse)</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: '#9333EA' }}>Batas Waktu: Persetujuan Maksimal 1x24 Jam</Typography>
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
