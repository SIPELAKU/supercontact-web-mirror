"use client";

import { Box, Container, Typography, Grid, Stack, Paper, alpha } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ConstructionIcon from '@mui/icons-material/Construction';

export default function RetailSolutions() {
    useLanguage();

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: { xs: 8, md: 15 } }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#3854D6',
                            fontWeight: 800,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block'
                        }}
                    >
                        {strings.retail_sol_subtitle}
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: '#0F172A',
                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                        }}
                    >
                        {strings.retail_sol_title}
                    </Typography>
                </Box>

                <Stack spacing={15}>
                    {/* Solution 1: Global Presence */}
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 4, display: 'inline-flex', p: 1, bgcolor: '#F0FDF4', color: '#166534', borderRadius: '12px' }}>
                                <BadgeIcon />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1E293B' }}>
                                {strings.retail_sol1_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                                {strings.retail_sol1_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.retail_sol1_li1, strings.retail_sol1_li2, strings.retail_sol1_li3].map((text, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{text}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3, color: '#64748B' }}>
                                    {strings.retail_sol1_mock_title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, p: 2, bgcolor: '#F8FAFC', borderRadius: '16px' }}>
                                    <Box sx={{ width: 48, height: 48, bgcolor: '#F59E0B', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>SM</Box>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{strings.retail_sol1_mock_name}</Typography>
                                        <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 800 }}>{strings.retail_sol1_mock_status}</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, fontWeight: 600 }}>
                                    {strings.retail_sol1_mock_history}
                                    <br />
                                    <Typography component="span" sx={{ color: '#3854D6', fontWeight: 800 }}>Rp 2.450.000</Typography>
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Solution 2: WhatsApp CRM */}
                    <Grid container spacing={8} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                    <WhatsAppIcon sx={{ color: '#25D366' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>{strings.retail_sol2_mock_title}</Typography>
                                </Box>
                                <Stack spacing={2}>
                                    <Box sx={{ alignSelf: 'flex-start', p: 1.5, bgcolor: '#F1F5F9', borderRadius: '12px 12px 12px 0', maxWidth: '80%' }}>
                                        <Typography variant="caption" sx={{ display: 'block' }}>{strings.retail_sol2_mock_msg1}</Typography>
                                    </Box>
                                    <Box sx={{ alignSelf: 'flex-end', p: 1.5, bgcolor: '#DCF8C6', borderRadius: '12px 12px 0 12px', maxWidth: '80%' }}>
                                        <Typography variant="caption" sx={{ display: 'block' }}>{strings.retail_sol2_mock_msg2}</Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 4, display: 'inline-flex', p: 1, bgcolor: '#F0FDF4', color: '#25D366', borderRadius: '12px' }}>
                                <WhatsAppIcon />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1E293B' }}>
                                {strings.retail_sol2_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                                {strings.retail_sol2_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.retail_sol2_li1, strings.retail_sol2_li2].map((text, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{text}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                    </Grid>

                    {/* Solution 3: After-Sales */}
                    <Grid container spacing={8} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box sx={{ mb: 4, display: 'inline-flex', p: 1, bgcolor: '#F5F3FF', color: '#8B5CF6', borderRadius: '12px' }}>
                                <ConstructionIcon />
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, color: '#1E293B' }}>
                                {strings.retail_sol3_title}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#64748B', mb: 4, lineHeight: 1.7, fontSize: '1.1rem' }}>
                                {strings.retail_sol3_desc}
                            </Typography>
                            <Stack spacing={2}>
                                {[strings.retail_sol3_li1, strings.retail_sol3_li2].map((text, i) => (
                                    <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                                        <CheckCircleIcon sx={{ color: '#3854D6', mt: 0.3 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569' }}>{text}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#8B5CF6' }}>{strings.retail_sol3_mock_title}</Typography>
                                    </Box>
                                    <Box sx={{ px: 1, py: 0.2, bgcolor: '#EEF2FF', color: '#6366F1', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
                                        {strings.retail_sol3_mock_status}
                                    </Box>
                                </Box>
                                <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '8px', mb: 2 }}>
                                    <Typography variant="caption" sx={{ display: 'block', fontStyle: 'italic', color: '#475569' }}>{strings.retail_sol3_mock_desc}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                    <Box sx={{ width: 32, height: 32, bgcolor: '#F5F0FF', color: '#8B5CF6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>SVC</Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>{strings.retail_sol3_mock_assign}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </Box>
    );
}
