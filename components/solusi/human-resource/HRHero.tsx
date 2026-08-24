"use client";

import { Box, Typography, Stack, Grid, Paper, LinearProgress } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PageHero from '@/components/marketing/PageHero';

export default function HRHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_role_hr)}
            title={strings.sol_hr_hero_title}
            description={strings.sol_hr_hero_desc}
            trackSource="solusi/human-resource"
            secondaryCta={{
                label: strings.sol_hr_hero_btn2,
                href: '/register',
                trackLabel: 'hero_demo_cta',
            }}
            visual={<HRHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function HRHeroVisual() {
    const categories = [
        { label: strings.sol_hr_hero_mock_cat1, value: 45, icon: <PaymentsIcon sx={{ fontSize: 16, color: '#22C55E' }} />, color: '#22C55E' },
        { label: strings.sol_hr_hero_mock_cat2, value: 35, icon: <BusinessIcon sx={{ fontSize: 16, color: '#F97316' }} />, color: '#F97316' },
        { label: strings.sol_hr_hero_mock_cat3, value: 20, icon: <CalendarMonthIcon sx={{ fontSize: 16, color: '#3B82F6' }} />, color: '#3B82F6' }
    ];

    return (
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
    );
}
