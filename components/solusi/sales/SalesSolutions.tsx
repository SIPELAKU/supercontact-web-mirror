"use client";

import { Box, Container, Typography, Grid, Stack, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function SalesSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 8, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_sales_sol_badge}
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_sales_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={12}>
                    {/* Solution 1 */}
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DBEAFE', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <AutoGraphIcon sx={{ color: '#2563EB' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_sales_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_sales_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_sales_sol1_li1, strings.sol_sales_sol1_li2, strings.sol_sales_sol1_li3].map((item, i) => (
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
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{strings.sol_sales_sol1_mock_title}</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>{strings.sol_sales_sol1_mock_desc}</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%', borderTop: '4px solid #F59E0B' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 2 }}>{strings.sol_sales_sol1_mock_col1}</Typography>
                                            <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>PT. Sejahtera Abadi</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Est: Rp 450 Jt</Typography>
                                            </Paper>
                                            <Paper sx={{ p: 2, mt: 1.5, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>CV. Maju Terus</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8' }}>Est: Rp 120 Jt</Typography>
                                            </Paper>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%', borderTop: '4px solid #3B82F6' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', display: 'block', mb: 2 }}>{strings.sol_sales_sol1_mock_col2}</Typography>
                                            <Paper sx={{ p: 2, borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                                <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#DBEAFE' }}>Toko Sentral Retail</Typography>
                                                <Box sx={{ width: '60px', height: '12px', bgcolor: '#3B82F6', borderRadius: '4px', mt: 0.5 }} />
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Solution 2 */}
                    <Grid container spacing={6} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Typography sx={{ fontWeight: 800, mb: 3, color: '#0F172A', fontSize: '1rem' }}>{strings.sol_sales_sol2_mock_title}</Typography>
                                <Stack spacing={2}>
                                    <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <NotificationImportantIcon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Telepon Bpk. Johan</Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Tanyakan revisi kontrak</Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#E11D48', p: 0.5, bgcolor: '#FFE4E6', borderRadius: '4px' }}>10:00 WIB</Typography>
                                    </Paper>
                                    <Paper sx={{ p: 2, borderRadius: '12px', border: '1px solid #E0F2FE', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#E0F2FE', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AutoGraphIcon fontSize="small" />
                                        </Box>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>Kirim Penawaran Harga</Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8' }}>Klien: CV. Makmur Jaya</Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8' }}>14:00 WIB</Typography>
                                    </Paper>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ width: 48, height: 48, bgcolor: '#DCFCE7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <NotificationImportantIcon sx={{ color: '#166534' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_sales_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_sales_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_sales_sol2_li1, strings.sol_sales_sol2_li2].map((item, i) => (
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
                                <PhoneIphoneIcon sx={{ color: '#9333EA' }} />
                            </Box>
                            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                                {strings.sol_sales_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7 }}>
                                {strings.sol_sales_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.sol_sales_sol3_li1, strings.sol_sales_sol3_li2].map((item, i) => (
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
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                                    <AccountCircleIcon sx={{ fontSize: 40, color: '#CBD5E1' }} />
                                    <Box>
                                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>Andi Saputra</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>WhatsApp: +62 812-3456-7890</Typography>
                                    </Box>
                                </Stack>
                                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                    <Stack spacing={2}>
                                        <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '8px 8px 8px 0', border: '1px solid #E2E8F0', alignSelf: 'flex-start', maxWidth: '85%' }}>
                                            <Typography sx={{ fontSize: '0.8rem', color: '#334155' }}>Pak, untuk brosur harga alat berat terbaru apakah sudah di-update?</Typography>
                                        </Box>
                                        <Box sx={{ p: 1.5, bgcolor: '#DCFCE7', borderRadius: '8px 8px 0 8px', alignSelf: 'flex-end', maxWidth: '85%' }}>
                                            <Typography sx={{ fontSize: '0.8rem', color: '#166534', mb: 1 }}>Sudah Pak Andi. Berikut saya lampirkan katalog harganya ya.</Typography>
                                            <Box sx={{ p: 1, bgcolor: '#FFF', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 800 }}>PDF</Typography>
                                                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600 }}>Katalog_AlatBerat_2024.pdf</Typography>
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
