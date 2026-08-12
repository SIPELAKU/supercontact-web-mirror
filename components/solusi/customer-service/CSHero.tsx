"use client";

import { Box, Container, Typography, Stack, Button, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MoodIcon from '@mui/icons-material/Mood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function CSHero() {
    useLanguage();
    const pathname = usePathname();

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
                            <SupportAgentIcon sx={{ fontSize: 16, color: 'white' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {strings.sol_cs_hero_badge}
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
                            {strings.sol_cs_hero_title}
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
                            {strings.sol_cs_hero_desc}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                onClick={() => { trackCtaClick('solusi/customer-service', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#597CFF',
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
                                {strings.sol_cs_hero_btn1}
                            </Button>
                            {/* <Button
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
                                {strings.sol_cs_hero_btn2}
                            </Button> */}
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
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
