"use client";

import { Box, Container, Typography, Stack, Button, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import Link from 'next/link';
import { trackCtaClick } from '@/lib/analytics/events';
import ComputerIcon from '@mui/icons-material/Computer';

export default function ITSaaSHero() {
    useLanguage();

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #597CFF 0%, #7B99FF 100%)',
                pt: { xs: 12, md: 20 },
                pb: { xs: 10, md: 15 },
                color: 'white',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={6} alignItems="center">
                    {/* Left: Text Content */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 1,
                                bgcolor: 'rgba(255, 255, 255, 0.15)',
                                px: 2,
                                py: 0.8,
                                borderRadius: '99px',
                                mb: 4,
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                        >
                            <Box sx={{ bgcolor: 'white', borderRadius: '4px', p: 0.2, display: 'flex' }}>
                                <ComputerIcon sx={{ fontSize: 16, color: '#3854D6' }} />
                            </Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {strings.it_hero_badge}
                            </Typography>
                        </Box>

                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2.5rem', md: '3.75rem' },
                                lineHeight: 1.1,
                                mb: 3
                            }}
                        >
                            {strings.it_hero_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1.125rem',
                                opacity: 0.9,
                                mb: 5,
                                lineHeight: 1.6,
                                maxWidth: '540px'
                            }}
                        >
                            {strings.it_hero_desc}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                component={Link}
                                href="/register"
                                onClick={() => trackCtaClick('solusi/it-saas', 'hero_cta')}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#3854D6',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }}
                            >
                                {strings.it_hero_btn1}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    borderWidth: '2px',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                        borderWidth: '2px'
                                    }
                                }}
                            >
                                {strings.it_hero_btn2}
                            </Button>
                        </Stack>
                    </Grid>

                    {/* Right: Mockup Dashboard */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={24}
                            sx={{
                                p: 3,
                                borderRadius: '24px',
                                bgcolor: 'white',
                                color: '#1E293B',
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                                overflow: 'hidden',
                                transform: { lg: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' },
                                transition: 'all 0.4s ease',
                                '&:hover': {
                                    transform: { lg: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px)' }
                                }
                            }}
                        >
                            {/* Mockup Header */}
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                                        {strings.it_hero_mock_title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                        {strings.it_hero_mock_subtitle}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        bgcolor: '#F0FDF4',
                                        color: '#166534',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '99px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        border: '1px solid #DCFCE7'
                                    }}
                                >
                                    {strings.it_hero_mock_total}
                                </Box>
                            </Box>

                            {/* Mockup Grid */}
                            <Grid container spacing={1.5}>
                                {/* Col 1 */}
                                <Grid item xs={4}>
                                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#64748B', mb: 1.5 }}>
                                            {strings.it_hero_mock_col1}
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #64748B' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>PT. Logistik Cepat</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Kebutuhan: Custom ERP</Typography>
                                            </Paper>
                                            <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #64748B' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Klinik Sehat</Typography>
                                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Tanya Modul SaaS</Typography>
                                            </Paper>
                                        </Stack>
                                    </Box>
                                </Grid>

                                {/* Col 2 */}
                                <Grid item xs={4}>
                                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#F59E0B', mb: 1.5 }}>
                                            {strings.it_hero_mock_col2}
                                        </Typography>
                                        <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Grup Retail XYZ</Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Kirim Penawaran Harga</Typography>
                                        </Paper>
                                    </Box>
                                </Grid>

                                {/* Col 3 */}
                                <Grid item xs={4}>
                                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#10B981', mb: 1.5 }}>
                                            {strings.it_hero_mock_col3}
                                        </Typography>
                                        <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Bank Daerah Maju</Typography>
                                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Tanda Tangan SPK</Typography>
                                        </Paper>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
