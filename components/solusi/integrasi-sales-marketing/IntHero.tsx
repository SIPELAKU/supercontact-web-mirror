"use client";

import { Box, Typography, Stack, Breadcrumbs } from "@mui/material";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PageHero from '@/components/marketing/PageHero';

export default function IntHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_role_intmkt)}
            title={strings.sol_int_hero_title}
            description={strings.sol_int_hero_desc}
            trackSource="solusi/integrasi-sales-marketing"
            secondaryCta={{
                label: strings.sol_int_hero_btn2,
                href: '/produk/crm-sales',
                trackLabel: 'hero_secondary_cta',
            }}
            topSlot={
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" sx={{ color: 'white' }} />}
                    sx={{
                        display: 'inline-flex',
                        mt: 4,
                        mb: -3,
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
            }
            visual={<IntHeroVisual />}
        >
            {/* Trust line kept below the standardized hero block */}
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                    maxWidth: { xs: '600px', lg: '1120px' },
                    mx: 'auto',
                    mt: -6,
                    pb: 8,
                    justifyContent: { xs: 'center', lg: 'flex-start' },
                }}
            >
                <TrendingUpIcon sx={{ fontSize: 18, opacity: 0.85 }} />
                <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
                    {strings.sol_int_hero_trust}
                </Typography>
            </Stack>
        </PageHero>
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function IntHeroVisual() {
    return (
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
    );
}
