"use client";

import { Box, Typography, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import MoodIcon from '@mui/icons-material/Mood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PageHero from '@/components/marketing/PageHero';

export default function CSHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_role_cs)}
            title={strings.sol_cs_hero_title}
            description={strings.sol_cs_hero_desc}
            trackSource="solusi/customer-service"
            secondaryCta={{
                label: strings.sol_cs_hero_btn2,
                href: '/register',
                trackLabel: 'hero_demo_cta',
            }}
            visual={<CSHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function CSHeroVisual() {
    return (
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E2E8F0', pb: 2 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                        {strings.sol_cs_hero_mock_title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {strings.sol_cs_hero_mock_period}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {strings.sol_cs_hero_mock_target}
                    </Typography>
                    <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoodIcon sx={{ fontSize: 14 }} /> 98%
                    </Box>
                </Box>
            </Box>

            {/* Top Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                    <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: '12px', border: '1px solid #E0F2FE', textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 800, color: '#0284C7', fontSize: '1.5rem' }}>
                            142
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.65rem', display: 'block' }}>
                            {strings.sol_cs_hero_mock_col1}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ p: 2, bgcolor: '#FEFCE8', borderRadius: '12px', border: '1px solid #FEF08A', textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 800, color: '#D97706', fontSize: '1.5rem' }}>
                            12
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.65rem', display: 'block' }}>
                            {strings.sol_cs_hero_mock_col2}
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={4}>
                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7', textAlign: 'center' }}>
                        <Typography sx={{ fontWeight: 800, color: '#166534', fontSize: '1.5rem' }}>
                            130
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.65rem', display: 'block' }}>
                            {strings.sol_cs_hero_mock_col3}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Bottom Card */}
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #F1F5F9' }}>
                <Box sx={{ color: '#E2E8F0', display: 'flex' }}>
                    <AccessTimeIcon fontSize="medium" />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.75rem', display: 'block' }}>
                        {strings.sol_cs_hero_mock_footer_label}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.875rem' }}>
                        {strings.sol_cs_hero_mock_footer_val}
                    </Typography>
                </Box>
                <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                    {strings.sol_cs_hero_mock_footer_badge}
                </Box>
            </Box>
        </Paper>
    );
}
