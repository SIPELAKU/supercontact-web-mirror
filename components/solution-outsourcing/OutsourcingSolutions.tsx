"use client";

import { Box, Container, Typography, Grid, Stack, Paper, alpha } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import ForumIcon from '@mui/icons-material/Forum';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';

export default function OutsourcingSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: '#597CFF', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.out_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.out_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={12}>
                    {/* Solution 1 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <BadgeIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.out_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.out_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.out_sol1_li1, strings.out_sol1_li2, strings.out_sol1_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#597CFF', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Typography sx={{ fontWeight: 700, mb: 2, color: '#64748B', fontSize: '0.875rem' }}>Profil Kandidat / Pekerja</Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#597CFF' }}>AS</Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>Andi Saputra</Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Divisi: Security Guard (Sertifikat Gada Pratama)</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography variant="caption" sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: '4px', fontWeight: 700 }}>SIAP PENEMPATAN</Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', display: 'block', color: '#475569', lineHeight: 1.6 }}>
                                    <strong>Status Saat Ini:</strong> Lulus *interview* dan *medical check-up*. Siap ditempatkan untuk proyek Bank ABC.
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Solution 2 */}
                    <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#22C55E' }} />
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>WhatsApp HRD Resmi (Centang Hijau)</Typography>
                                </Stack>
                                <Stack spacing={2}>
                                    <Typography variant="caption" sx={{ alignSelf: 'flex-start', p: 1.5, bgcolor: '#F1F5F9', borderRadius: '12px 12px 12px 0', maxWidth: '80%', fontSize: '0.75rem' }}>
                                        [PENGUMUMAN MASSAL] Halo Andi! Jadwal *shift* keamanan Anda untuk minggu ini telah diperbarui. Silakan cek aplikasi portal karyawan Anda. Terima kasih. 👨‍✈️
                                    </Typography>
                                    <Typography variant="caption" sx={{ alignSelf: 'flex-end', p: 1.5, bgcolor: '#DCFCE7', borderRadius: '12px 12px 0 12px', maxWidth: '80%', fontSize: '0.75rem', color: '#166534' }}>
                                        Baik Pak, jadwal sudah saya terima dan konfirmasi. Mau tanya, untuk seragam baru apakah bisa diambil besok di kantor pusat?
                                    </Typography>
                                </Stack>
                                <Box sx={{ mt: 2, p: 1, borderTop: '1px solid #F1F5F9', color: '#94A3B8', fontSize: '0.75rem' }}>
                                    Gunakan balasan cepat (/InfoSeragam)...
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <ForumIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.out_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.out_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.out_sol2_li1, strings.out_sol2_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#597CFF', fontSize: 20, mt: 0.3 }} />
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
                                <MoveToInboxIcon sx={{ color: '#7E22CE' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.out_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.out_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.out_sol3_li1, strings.out_sol3_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#597CFF', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, color: '#7E22CE' }}>
                                        <ForumIcon sx={{ fontSize: 16 }} />
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>Tiket Komplain Klien #281</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography variant="caption" sx={{ bgcolor: '#FFE4E6', color: '#E11D48', px: 1, py: 0.5, borderRadius: '4px', fontWeight: 800, fontSize: '0.6rem' }}>URGENT - PENGGANTIAN STAF</Typography>
                                </Stack>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1 }}>LAPORAN PT MAJU JAYA (KLIEN):</Typography>
                                    <Typography sx={{ fontSize: '0.875rem', color: '#1E293B', bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', borderLeft: '4px solid #F1F5F9' }}>
                                        "Admin, staf *cleaning service* a/n Riko hari ini tidak datang tanpa keterangan. Tolong segera dikirimkan staf *back-up* pengganti."
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, bgcolor: '#F5F3FF', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6D28D9', fontSize: '0.75rem' }}>SPV</Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Ditugaskan ke: Supervisor Area Barat</Typography>
                                        <Typography variant="caption" sx={{ color: '#7C3AED' }}>Target Resolusi: Penempatan back-up maksimal 2 Jam</Typography>
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
