"use client";

import { Box, Container, Typography, Stack, Button, Grid, Paper, Chip, LinearProgress } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';
import HandymanIcon from '@mui/icons-material/Handyman';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

export default function OpHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                pt: { xs: 15, md: 20 },
                pb: { xs: 10, md: 15 },
                background: 'linear-gradient(135deg, #597CFF 0%, #7B99FF 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative background circle */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Grid container spacing={8} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Stack spacing={4}>
                            <Box sx={{ display: 'flex' }}>
                                <Chip
                                    icon={<AutoFixHighIcon sx={{ fontSize: '1rem !important', color: 'white !important' }} />}
                                    label={strings.sol_op_hero_badge}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 700,
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                        px: 1
                                    }}
                                />
                            </Box>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    lineHeight: 1.1,
                                    letterSpacing: '-0.02em'
                                }}
                            >
                                {strings.sol_op_hero_title}
                            </Typography>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontSize: '1.125rem',
                                    opacity: 0.9,
                                    lineHeight: 1.6,
                                    maxWidth: '500px'
                                }}
                            >
                                {strings.sol_op_hero_desc}
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button
                                    variant="contained"
                                    onClick={() => { trackCtaClick('solusi/operasional', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                                    sx={{
                                        bgcolor: 'white',
                                        color: '#597CFF',
                                        fontWeight: 800,
                                        px: 4,
                                        py: 2,
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                                        '&:hover': { bgcolor: '#F8FAFC' }
                                    }}
                                >
                                    {strings.sol_op_hero_btn1}
                                </Button>
                                {/* <Button
                                    variant="outlined"
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.5)',
                                        fontWeight: 700,
                                        px: 4,
                                        py: 2,
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        borderWidth: '2px',
                                        '&:hover': {
                                            borderColor: 'white',
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderWidth: '2px'
                                        }
                                    }}
                                >
                                    {strings.sol_op_hero_btn2}
                                </Button> */}
                            </Stack>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
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
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
