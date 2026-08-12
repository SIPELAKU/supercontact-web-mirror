"use client";

import { Box, Container, Typography, Stack, Button, Grid, Breadcrumbs } from "@mui/material";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function IntHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #597CFF 0%, #7692FF 100%)',
                pt: { xs: 10, md: 14 },
                pb: { xs: 10, md: 15 },
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg">
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" sx={{ color: 'white' }} />}
                    sx={{
                        display: 'inline-flex',
                        mb: 5,
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px',
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        '& a, & p': { color: 'white', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' },
                    }}
                >
                    <Link href="/">{strings.sol_int_breadcrumb_home}</Link>
                    <Typography component="span" sx={{ color: 'white !important', fontSize: '0.85rem', fontWeight: 600 }}>
                        {strings.sol_int_breadcrumb_current}
                    </Typography>
                </Breadcrumbs>

                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={7}>
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
                            <SyncAltIcon sx={{ fontSize: 16, color: 'white' }} />
                            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {strings.sol_int_hero_badge}
                            </Typography>
                        </Box>

                        <Typography
                            variant="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2.25rem', md: '3.25rem' },
                                lineHeight: 1.15,
                                mb: 3
                            }}
                        >
                            {strings.sol_int_hero_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1.125rem',
                                opacity: 0.92,
                                mb: 4,
                                lineHeight: 1.7,
                                maxWidth: '620px'
                            }}
                        >
                            {strings.sol_int_hero_desc}
                        </Typography>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                            <Button
                                variant="contained"
                                onClick={() => { trackCtaClick('solusi/integrasi-sales-marketing', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
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
                                {strings.sol_int_hero_btn1}
                            </Button>
                            <Button
                                component={Link}
                                href="/produk/crm-sales"
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
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
                                {strings.sol_int_hero_btn2}
                            </Button>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <TrendingUpIcon sx={{ fontSize: 18, opacity: 0.85 }} />
                            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
                                {strings.sol_int_hero_trust}
                            </Typography>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                bgcolor: 'white',
                                borderRadius: '24px',
                                p: 3,
                                boxShadow: '0 50px 100px -20px rgba(0,0,0,0.25)',
                                color: '#1E293B'
                            }}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F0FDF4' }}>
                                    <WhatsAppIcon sx={{ color: '#22C55E' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>WhatsApp</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Lead masuk → profil dibuat otomatis</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F0F7FF' }}>
                                    <EmailIcon sx={{ color: '#3854D6' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Email Campaign</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Balasan → masuk ke pipeline sales</Typography>
                                    </Box>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#FFF7ED' }}>
                                    <SyncAltIcon sx={{ color: '#F97316' }} />
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>Auto-Routing</Typography>
                                        <Typography variant="caption" sx={{ color: '#64748B' }}>Diteruskan ke sales yang bertugas</Typography>
                                    </Box>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
