"use client";

import { Box, Typography, Stack, Grid, Paper, Chip, LinearProgress } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import HandymanIcon from '@mui/icons-material/Handyman';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import PageHero from '@/components/marketing/PageHero';

export default function OpHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_role_ops)}
            title={strings.sol_op_hero_title}
            description={strings.sol_op_hero_desc}
            trackSource="solusi/operasional"
            visual={<OpHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function OpHeroVisual() {
    return (
        <Paper
            elevation={24}
            sx={{
                p: 3,
                borderRadius: '24px',
                bgcolor: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                transform: { lg: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' },
                transition: 'all 0.4s ease',
                '&:hover': {
                    transform: { lg: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px)' }
                }
            }}
        >
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                        {strings.sol_op_hero_mock_title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {strings.sol_op_hero_mock_subtitle}
                    </Typography>
                </Box>
                <Chip
                    label={strings.sol_op_hero_mock_eff}
                    sx={{ bgcolor: '#DCFCE7', color: '#166534', fontWeight: 800, height: 28, fontSize: '0.75rem' }}
                />
            </Box>

            <Stack spacing={3} sx={{ mb: 4 }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: 1 }}>
                    {strings.sol_op_hero_mock_task_label}
                </Typography>
                <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <HandymanIcon sx={{ color: '#3B82F6', fontSize: 20 }} />
                        <LinearProgress variant="determinate" value={85} sx={{ flexGrow: 1, height: 8, borderRadius: 5, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' } }} />
                        <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.75rem' }}>{strings.sol_op_hero_mock_task1}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <LocalShippingIcon sx={{ color: '#F97316', fontSize: 20 }} />
                        <LinearProgress variant="determinate" value={60} sx={{ flexGrow: 1, height: 8, borderRadius: 5, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#F97316' } }} />
                        <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.75rem' }}>{strings.sol_op_hero_mock_task2}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <GppMaybeIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                        <LinearProgress variant="determinate" value={100} sx={{ flexGrow: 1, height: 8, borderRadius: 5, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#EF4444' } }} />
                        <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.75rem' }}>{strings.sol_op_hero_mock_task3}</Typography>
                    </Stack>
                </Box>
            </Stack>

            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', p: 1, bgcolor: 'white', borderRadius: '10px' }}>
                            <LocationOnIcon sx={{ color: '#3B82F6' }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#3B82F6', fontWeight: 800, display: 'block' }}>{strings.sol_op_hero_mock_staff_label}</Typography>
                            <Typography sx={{ color: '#1E293B', fontWeight: 800 }}>{strings.sol_op_hero_mock_staff_val}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ p: 2, bgcolor: '#FFFBEB', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', p: 1, bgcolor: 'white', borderRadius: '10px' }}>
                            <WarningIcon sx={{ color: '#F59E0B' }} />
                        </Box>
                        <Box>
                            <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 800, display: 'block' }}>{strings.sol_op_hero_mock_incident_label}</Typography>
                            <Typography sx={{ color: '#1E293B', fontWeight: 800 }}>{strings.sol_op_hero_mock_incident_val}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
