"use client";

import { Box, Container, Typography, Stack, Button, Grid, Paper, LinearProgress } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from '@/lib/analytics/events';
import Link from 'next/link';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function HRHero() {
    useLanguage();

    const categories = [
        { label: strings.sol_hr_hero_mock_cat1, value: 45, icon: <PaymentsIcon sx={{ fontSize: 16, color: '#22C55E' }} />, color: '#22C55E' },
        { label: strings.sol_hr_hero_mock_cat2, value: 35, icon: <BusinessIcon sx={{ fontSize: 16, color: '#F97316' }} />, color: '#F97316' },
        { label: strings.sol_hr_hero_mock_cat3, value: 20, icon: <CalendarMonthIcon sx={{ fontSize: 16, color: '#3B82F6' }} />, color: '#3B82F6' }
    ];

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #5D7FFF 0%, #7B9AFF 100%)',
                pt: { xs: 12, md: 20 },
                pb: { xs: 10, md: 15 },
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={6} alignItems="center">
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
                            <PeopleIcon sx={{ fontSize: 16, color: 'white' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {strings.sol_hr_hero_badge}
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
                            {strings.sol_hr_hero_title}
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
                            {strings.sol_hr_hero_desc}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                component={Link}
                                href="/register"
                                onClick={() => trackCtaClick('solusi/human-resource', 'hero_cta')}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#5D7FFF',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                }}
                            >
                                {strings.sol_hr_hero_btn1}
                            </Button>
                            <Button
                                variant="outlined"
                                component={Link}
                                href="/register"
                                onClick={() => trackCtaClick('solusi/human-resource', 'hero_demo_cta')}
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
                                {strings.sol_hr_hero_btn2}
                            </Button>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={24}
                            sx={{
                                p: 3,
                                borderRadius: '24px',
                                bgcolor: 'white',
                                color: '#1E293B',
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                                transform: { lg: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' },
                                transition: 'all 0.4s ease',
                                '&:hover': {
                                    transform: { lg: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px)' }
                                }
                            }}
                        >
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                                        {strings.sol_hr_hero_mock_title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                        {strings.sol_hr_hero_mock_subtitle}
                                    </Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircleIcon sx={{ fontSize: 14 }} /> {strings.sol_hr_hero_mock_sat}
                                </Box>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: 1, mb: 2, display: 'block' }}>
                                    {strings.sol_hr_hero_mock_cat_title}
                                </Typography>
                                <Stack spacing={2.5}>
                                    {categories.map((cat, i) => (
                                        <Box key={i}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {cat.icon}
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>{cat.label}</Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B' }}>{cat.value}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={cat.value}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: '#F1F5F9',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: cat.color,
                                                        borderRadius: 4
                                                    }
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: '#FFF1F2', borderRadius: '12px', border: '1px solid #FFE4E6' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#E11D48', display: 'block', mb: 0.5 }}>
                                            {strings.sol_hr_hero_mock_ticket_label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                                            {strings.sol_hr_hero_mock_ticket_val}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: '12px', border: '1px solid #E0F2FE' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0284C7', display: 'block', mb: 0.5 }}>
                                            {strings.sol_hr_hero_mock_rec_label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                                            {strings.sol_hr_hero_mock_rec_val}
                                        </Typography>
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
