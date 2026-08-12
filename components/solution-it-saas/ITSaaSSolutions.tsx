"use client";

import { Box, Container, Typography, Grid, Stack, Paper, alpha } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

export default function ITSaaSSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.it_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.it_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={12}>
                    {/* Solution 1 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <BusinessCenterIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.it_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.it_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.it_sol1_li1, strings.it_sol1_li2, strings.it_sol1_li3].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', fontSize: 20, mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                                            {item}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Typography sx={{ fontWeight: 700, mb: 2, color: '#64748B', fontSize: '0.875rem' }}>Profil Akun Klien (B2B)</Typography>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#3854D6' }}>TM</Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1rem' }}>PT. Teknologi Maju</Typography>
                                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>Proyek: Pengadaan Server & Jaringan</Typography>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography variant="caption" sx={{ bgcolor: '#FEF3C7', color: '#92400E', px: 1, py: 0.5, borderRadius: '4px', fontWeight: 700 }}>EVALUASI TEKNIS</Typography>
                                </Stack>
                                <Typography variant="caption" sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '8px', display: 'block', color: '#475569', lineHeight: 1.6 }}>
                                    <strong>Status Saat Ini:</strong> Proposal awal senilai Rp 450 Juta sudah dikirimkan. Jadwalkan *meeting* teknis lanjutan dengan CTO mereka.
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
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>IT Helpdesk Resmi (Centang Hijau)</Typography>
                                </Stack>
                                <Stack spacing={2}>
                                    <Typography variant="caption" sx={{ alignSelf: 'flex-start', p: 1.5, bgcolor: '#F1F5F9', borderRadius: '12px 12px 12px 0', maxWidth: '80%', fontSize: '0.75rem' }}>
                                        Halo tim support, modul absensi karyawan di aplikasi HRIS tiba-tiba *error 500* saat kami coba akses pagi ini. Mohon segera dicek.
                                    </Typography>
                                    <Typography variant="caption" sx={{ alignSelf: 'flex-end', p: 1.5, bgcolor: '#DCFCE7', borderRadius: '12px 12px 0 12px', maxWidth: '80%', fontSize: '0.75rem', color: '#166534' }}>
                                        Halo Bapak, mohon maaf atas ketidaknyamanan yang terjadi. Laporan *error 500* pada modul absensi sudah kami catat dan segera kami eskalasikan ke tim teknis (L2) untuk pengecekan darurat. 🙏
                                    </Typography>
                                </Stack>
                                <Box sx={{ mt: 2, p: 1, borderTop: '1px solid #F1F5F9', color: '#94A3B8', fontSize: '0.75rem' }}>
                                    Gunakan balasan cepat (/EskalasiBug)...
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <HeadsetMicIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.it_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.it_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.it_sol2_li1, strings.it_sol2_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', fontSize: 20, mt: 0.3 }} />
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
                                <ManageAccountsIcon sx={{ color: '#7E22CE' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.it_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.it_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.it_sol3_li1, strings.it_sol3_li2].map((item, i) => (
                                    <Stack direction="row" spacing={2} key={i}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', fontSize: 20, mt: 0.3 }} />
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
                                    <BusinessCenterIcon sx={{ fontSize: 16, color: '#A855F7' }} />
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Tiket Insiden #1024</Typography>
                                    <Box sx={{ flexGrow: 1 }} />
                                    <Typography variant="caption" sx={{ bgcolor: '#FFE4E6', color: '#E11D48', px: 1, py: 0.5, borderRadius: '4px', fontWeight: 800, fontSize: '0.6rem' }}>URGENT - CRITICAL BUG</Typography>
                                </Stack>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block', mb: 1 }}>DESKRIPSI INSIDEN:</Typography>
                                    <Typography sx={{ fontSize: '0.875rem', color: '#1E293B', bgcolor: '#F8FAFC', p: 2, borderRadius: '8px', borderLeft: '4px solid #F1F5F9' }}>
                                        "Klien PT Logistik (Modul HRIS) melaporkan Error 500 saat hitung *payroll*. Diduga terkait update *database* semalam."
                                    </Typography>
                                </Box>
                                <Box sx={{ p: 2, bgcolor: '#F5F3FF', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', bgcolor: '#DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#6D28D9', fontSize: '0.75rem' }}>ENG</Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>Ditugaskan ke: Tim Backend Engineering</Typography>
                                        <Typography variant="caption" sx={{ color: '#7C3AED' }}>Target Resolusi: Maksimal 2 Jam (SLA VIP)</Typography>
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
