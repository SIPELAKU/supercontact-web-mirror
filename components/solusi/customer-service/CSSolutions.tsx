"use client";

import { Box, Container, Typography, Grid, Stack, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ForumIcon from '@mui/icons-material/Forum';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';

export default function CSSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: '#597CFF', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_cs_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_cs_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={12}>
                    {/* Solution 1 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DBEAFE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <ForumIcon sx={{ color: '#2563EB' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_cs_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_cs_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_cs_sol1_li1, strings.sol_cs_sol1_li2, strings.sol_cs_sol1_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 0, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                                {/* Mockup Header */}
                                <Box sx={{ p: 2, borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#FFE4E6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E11D48', fontWeight: 800, fontSize: '0.875rem' }}>
                                            S
                                        </Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>@Sinta_N</Typography>
                                    </Stack>
                                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#DCFCE7', color: '#166534', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        Tugas: Rina (CS)
                                    </Box>
                                </Box>

                                {/* Mockup Chat Body */}
                                <Box sx={{ p: 3, height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
                                    <Typography variant="caption" sx={{ textAlign: 'center', color: '#94A3B8', display: 'block', mb: 1 }}>Kemarin, 14:20 WIB</Typography>

                                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                        <Box sx={{ p: 2, bgcolor: '#F1F5F9', borderRadius: '12px 12px 12px 0' }}>
                                            <Typography variant="body2" sx={{ color: '#334155' }}>
                                                Halo kak, paket saya yang nomor resinya JD8812 belum sampai juga. Padahal statusnya sudah delivered. Tolong bantu cek ya.
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="caption" sx={{ textAlign: 'center', color: '#94A3B8', display: 'block', mt: 1, mb: 1 }}>Hari Ini, 09:05 WIB</Typography>

                                    <Box sx={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                                        <Box sx={{ p: 1.5, bgcolor: '#F1F5F9', borderRadius: '12px 12px 12px 0' }}>
                                            <Typography variant="body2" sx={{ color: '#334155' }}>
                                                Halo?? Kok belum ada balasan yw?
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Scrollbar Mock */}
                                    <Box sx={{ position: 'absolute', right: 8, top: 16, bottom: 16, width: 6, bgcolor: '#E2E8F0', borderRadius: '4px' }}>
                                        <Box sx={{ width: '100%', height: '40%', bgcolor: '#94A3B8', mt: '40%', borderRadius: '4px' }} />
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Solution 2 */}
                    <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Tiket Keluhan #890</Typography>
                                    <Box sx={{ px: 1.5, py: 0.5, bgcolor: '#FFE4E6', color: '#E11D48', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                                        ESKALASI - HIGH PRIORITY
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mb: 0.5, display: 'block' }}>TOPIK:</Typography>
                                <Typography sx={{ fontWeight: 700, mb: 2, fontSize: '0.95rem' }}>Paket Diklaim Delivered Tapi Belum Diterima</Typography>

                                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', borderLeft: '4px solid #CBD5E1', mb: 3 }}>
                                    <Typography variant="body2" sx={{ color: '#475569' }}>
                                        Pelanggan a/n Sinta komplain pesanan JD8812 tidak diterima. Ekspedisi mengklaim sudah terkirim ke satpam komplek.
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2, bgcolor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                        <ConfirmationNumberIcon fontSize="small" />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#1E293B' }}>Ditugaskan ke: Tim Operasional Logistik</Typography>
                                        <Typography variant="caption" sx={{ color: '#EF4444', fontWeight: 700 }}>Batas SLA: Tersisa 45 Menit</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <ConfirmationNumberIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_cs_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_cs_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_cs_sol2_li1, strings.sol_cs_sol2_li2, strings.sol_cs_sol2_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Solution 3 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#F3E8FF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <ElectricBoltIcon sx={{ color: '#9333EA' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_cs_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_cs_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_cs_sol3_li1, strings.sol_cs_sol3_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#22C55E', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
                                    <Box sx={{ position: 'relative', bgcolor: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', p: 2, mb: 2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
                                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, mb: 1, display: 'block' }}>PILIH TEMPLAT BALASAN</Typography>

                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', borderLeft: '3px solid #6366F1', mb: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F1F5F9' } }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', mb: 0.5 }}>/SOP_Refund</Typography>
                                            <Typography variant="caption" sx={{ color: '#64748B', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                Halo Kak, untuk proses refund dana memakan waktu 3-5 hari kerja...
                                            </Typography>
                                        </Box>

                                        <Box sx={{ p: 2, bgcolor: '#EEF2FF', borderRadius: '8px', borderLeft: '3px solid #4F46E5', cursor: 'pointer' }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: '#4F46E5', mb: 0.5 }}>/Katalog_Harga</Typography>
                                            <Typography variant="caption" sx={{ color: '#6366F1', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                Berikut adalah link katalog harga terbaru kami...
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center' }}>
                                        <Typography sx={{ ml: 2, color: '#3B82F6', fontWeight: 600, fontSize: '0.875rem', flexGrow: 1 }}>
                                            / Katalog_Harga
                                        </Typography>
                                        <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Box sx={{ width: 0, height: 0, borderTop: '5px solid transparent', borderLeft: '8px solid white', borderBottom: '5px solid transparent', ml: 0.5 }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
