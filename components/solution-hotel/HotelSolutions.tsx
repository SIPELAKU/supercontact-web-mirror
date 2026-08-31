"use client";

import { Box, Container, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { Ticket } from "lucide-react";

export default function HotelSolutions() {
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
                        {strings.hotel_sol_badge}
                    </Typography>
                    <Typography variant="h3" component="h2" sx={{ fontWeight: 800, color: '#111827', fontSize: { xs: '2rem', md: '2.75rem' } }}>
                        {strings.hotel_sol_title}
                    </Typography>
                </Box>

                {/* Solution 1: CRM Sales */}
                <Grid container spacing={8} alignItems="center" sx={{ mb: { xs: 12, md: 16 } }}>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.hotel_sol1_title,
                            strings.hotel_sol1_desc,
                            [strings.hotel_sol1_list1, strings.hotel_sol1_list2, strings.hotel_sol1_list3]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 1: Booking Profile */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', bgcolor: '#22C55E' }} />
                            <Typography sx={{ fontWeight: 700, color: '#334155', mb: 3 }}>Profil Reservasi Kamar</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4338CA', fontWeight: 700 }}>
                                    BG
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography sx={{ fontWeight: 700, color: '#1E293B' }}>Bpk. Gunawan</Typography>
                                    <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Deluxe Room - 3 Malam</Typography>
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#DCFCE7', color: '#15803D', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>
                                    DP TERVERIFIKASI
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                <Typography sx={{ fontSize: '0.85rem', color: '#475569' }}>
                                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Aktivitas Terakhir:</span> Pembayaran DP berhasil diverifikasi (Hari ini, 09:12).
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
                                <WhatsAppIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>WhatsApp Business API</Typography>
                                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>Agen aktif: Sari (Resepsionis), Budi (Admin)</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#E5DDD5' }}>
                                <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%', bgcolor: '#FFFFFF', p: 2, borderRadius: '0 16px 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#334155' }}>Halo, apakah ada kamar kosong untuk besok?</Typography>
                                </Box>
                                <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%', bgcolor: '#DCF8C6', p: 2, borderRadius: '16px 0 16px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                    <Typography sx={{ fontSize: '0.9rem', color: '#166534' }}>Halo! Masih ada tipe Deluxe dan Suite. Mau saya bantu cek harganya?</Typography>
                                    <Typography sx={{ fontSize: '0.65rem', color: '#166534', textAlign: 'right', mt: 0.5 }}>Dibalas oleh: Sari</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ p: 2, borderTop: '1px solid #E2E8F0', bgcolor: 'white' }}>
                                <Typography sx={{ color: '#94A3B8', fontSize: '0.9rem' }}>Ketik balasan...</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.hotel_sol2_title,
                            strings.hotel_sol2_desc,
                            [strings.hotel_sol2_list1, strings.hotel_sol2_list2]
                        )}
                    </Grid>
                </Grid>

                {/* Solution 3: Ticketing */}
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        {renderSolutionText(
                            strings.hotel_sol3_title,
                            strings.hotel_sol3_desc,
                            [strings.hotel_sol3_list1, strings.hotel_sol3_list2]
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {/* Mockup 3: Service Ticket */}
                        <Paper elevation={12} sx={{ p: 4, borderRadius: '24px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography sx={{ fontWeight: 800, color: '#334155', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Ticket color="#F59E0B" /> Tiket Layanan #1042
                                </Typography>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FFEDD5', color: '#D97706', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>
                                    ROOM SERVICE
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', mb: 1, textTransform: 'uppercase' }}>
                                Permintaan Tamu:
                            </Typography>
                            <Box sx={{ p: 2, bgcolor: 'var(--surface-alt)', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 3 }}>
                                <Typography sx={{ fontSize: '0.9rem', color: '#334155', fontStyle: 'italic' }}>
                                    "Tamu di kamar 302 meminta tambahan 2 handuk dan air mineral."
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: '#F0F9FF', borderRadius: '12px', border: '1px solid #BAE6FD' }}>
                                <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#7DD3FC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369A1', fontWeight: 700, fontSize: '0.8rem' }}>
                                    HK
                                </Box>
                                <Box>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0369A1' }}>Ditugaskan ke: Housekeeping</Typography>
                                    <Typography sx={{ fontSize: '0.75rem', color: '#0EA5E9' }}>Batas Waktu (SLA): 30 Menit</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
