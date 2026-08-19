"use client";

import { Box, Typography, Paper } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { getWhatsAppLink } from '@/lib/utils/wa-link';
import PageHero from '@/components/marketing/PageHero';

export default function LogisticsHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_ind_logistics)}
            title={strings.logistics_hero_title}
            description={strings.logistics_hero_desc}
            trackSource="solusi/logistik"
            secondaryCta={{
                label: strings.logistics_hero_btn_consult,
                href: getWhatsAppLink('/solusi/logistik'),
                external: true,
                icon: <WhatsAppIcon />,
                trackLabel: 'hero_wa_cta',
            }}
            visual={<LogisticsHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function LogisticsHeroVisual() {
    return (
        <Box sx={{ flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

            <Paper
                elevation={16}
                sx={{
                    position: 'relative',
                    zIndex: 3,
                    borderRadius: '16px',
                    width: '100%',
                    p: 3,
                    bgcolor: 'white',
                    transform: { lg: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)' },
                    transition: 'all 0.4s ease',
                    '&:hover': {
                        transform: { lg: 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-5px)' }
                    }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#1E293B' }}>
                            {strings.logistics_hero_mockup_title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                            {strings.logistics_hero_mockup_period}
                        </Typography>
                    </Box>
                    <Box sx={{
                        bgcolor: '#DBEAFE', color: '#2563EB', px: 1.5, py: 0.5,
                        borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                        {strings.logistics_hero_mockup_stats}
                    </Box>
                </Box>

                {/* Kanban Columns */}
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>

                    {/* Column 1: Tanya Tarif */}
                    <Box sx={{ flex: 1, minWidth: '160px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', mb: 1, textTransform: 'uppercase' }}>
                            {strings.logistics_hero_mockup_col1}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #E2E8F0' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>CV. Makmur Jaya</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Kargo 50kg - Tujuan Bali</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #FCD34D' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Bpk. Rendi</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Pindahan Rumah</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 2: Jadwal Pickup */}
                    <Box sx={{ flex: 1, minWidth: '160px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', mb: 1, textTransform: 'uppercase' }}>
                            {strings.logistics_hero_mockup_col2}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Toko Laris Manis</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Pickup Jam 13:00 - Kurir: Budi</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 3: Dalam Pengiriman */}
                    <Box sx={{ flex: 1, minWidth: '160px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', mb: 1, textTransform: 'uppercase' }}>
                            {strings.logistics_hero_mockup_col3}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>PT. Abadi</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>Menuju Hub Jakarta</Typography>
                            </Paper>
                        </Box>
                    </Box>

                </Box>

            </Paper>

        </Box>
    );
}
