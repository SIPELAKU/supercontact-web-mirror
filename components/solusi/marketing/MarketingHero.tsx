"use client";

import { Box, Container, Typography, Stack, Button, Grid, Paper, LinearProgress } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';

export default function MarketingHero() {
    useLanguage();
    const pathname = usePathname();

    const sources = [
        { label: "WA Blast", value: 65, icon: <WhatsAppIcon sx={{ fontSize: 16, color: '#22C55E' }} />, color: '#22C55E' },
        { label: "Email", value: 25, icon: <EmailIcon sx={{ fontSize: 16, color: '#F97316' }} />, color: '#F97316' },
        { label: "Web Form", value: 10, icon: <LanguageIcon sx={{ fontSize: 16, color: '#64748B' }} />, color: '#64748B' }
    ];

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)',
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
                            <CampaignIcon sx={{ fontSize: 16, color: 'white' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {strings.sol_mkt_hero_badge}
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
                            {strings.sol_mkt_hero_title}
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
                            {strings.sol_mkt_hero_desc}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button
                                variant="contained"
                                onClick={() => { trackCtaClick('solusi/marketing', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#3854D6',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' }
                                }}
                            >
                                {strings.sol_mkt_hero_btn1}
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
                                {strings.sol_mkt_hero_btn2}
                            </Button> */}
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
                                        {strings.sol_mkt_hero_mock_title}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                        {strings.sol_mkt_hero_mock_subtitle}
                                    </Typography>
                                </Box>
                                <Box sx={{ bgcolor: '#DCFCE7', color: '#166534', px: 1.5, py: 0.5, borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUpIcon sx={{ fontSize: 14 }} /> {strings.sol_mkt_hero_mock_roi}
                                </Box>
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800, letterSpacing: 1, mb: 2, display: 'block' }}>
                                    {strings.sol_mkt_hero_mock_source_title}
                                </Typography>
                                <Stack spacing={2.5}>
                                    {sources.map((src, i) => (
                                        <Box key={i}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    {src.icon}
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>{src.label}</Typography>
                                                </Stack>
                                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E293B' }}>{src.value}%</Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={src.value}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: '#F1F5F9',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: src.color,
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
                                    <Box sx={{ p: 2, bgcolor: '#F0F7FF', borderRadius: '12px', border: '1px solid #E0F2FE' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369A1', display: 'block', mb: 0.5 }}>
                                            {strings.sol_mkt_hero_mock_mql_label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                                                {strings.sol_mkt_hero_mock_mql_val}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', display: 'block', mb: 0.5 }}>
                                            {strings.sol_mkt_hero_mock_sales_label}
                                        </Typography>
                                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                                            {strings.sol_mkt_hero_mock_sales_val}
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
