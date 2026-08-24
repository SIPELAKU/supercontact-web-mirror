"use client";

import { Box, Typography, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PageHero from '@/components/marketing/PageHero';

export default function SalesHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_role_sales)}
            title={strings.sol_sales_hero_title}
            description={strings.sol_sales_hero_desc}
            trackSource="solusi/sales"
            visual={<SalesHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function SalesHeroVisual() {
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
                        {strings.sol_sales_hero_mock_title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {strings.sol_sales_hero_mock_period}
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
                        {strings.sol_sales_hero_mock_target}
                    </Typography>
                    <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1, py: 0.5, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                        82%
                    </Box>
                </Box>
            </Box>

            {/* Center Chart Area */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '120px', mb: 4 }}>
                {/* Sept */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%' }}>
                    <Box sx={{ width: '40px', height: '30%', bgcolor: '#BAE6FD', borderRadius: '4px 4px 0 0' }}></Box>
                    <Box sx={{ width: '40px', height: '50%', bgcolor: '#93C5FD', borderRadius: '4px 4px 0 0' }}></Box>
                </Box>

                {/* Oct */}
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: '100%' }}>
                    <Box sx={{ width: '40px', height: '45%', bgcolor: '#60A5FA', borderRadius: '4px 4px 0 0' }}></Box>
                    <Box sx={{ width: '50px', height: '90%', bgcolor: '#4ADE80', borderRadius: '4px 4px 0 0', boxShadow: '0 10px 15px -3px rgba(74, 222, 128, 0.4)' }}></Box>
                </Box>
            </Box>

            {/* Bottom Cards */}
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #F1F5F9' }}>
                        <Box sx={{ bgcolor: '#FFEDD5', color: '#EA580C', p: 1, borderRadius: '8px', display: 'flex' }}>
                            <TrackChangesIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.65rem' }}>
                                {strings.sol_sales_hero_mock_col1}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem' }}>
                                48
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid #DCFCE7' }}>
                        <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', p: 1, borderRadius: '8px', display: 'flex' }}>
                            <WorkspacePremiumIcon fontSize="small" />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', fontSize: '0.65rem' }}>
                                {strings.sol_sales_hero_mock_col2}
                            </Typography>
                            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                                Rp 245 Jt
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
