"use client";

import { Box, Typography, Paper } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { getWhatsAppLink } from '@/lib/utils/wa-link';
import PageHero from '@/components/marketing/PageHero';

export default function HotelHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_ind_hotel)}
            title={strings.hotel_hero_title}
            description={strings.hotel_hero_desc}
            trackSource="solusi/perhotelan"
            secondaryCta={{
                label: strings.hotel_hero_btn_consult,
                href: getWhatsAppLink('/solusi/perhotelan'),
                external: true,
                icon: <WhatsAppIcon />,
                trackLabel: 'hero_wa_cta',
            }}
            visual={<HotelHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function HotelHeroVisual() {
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
                            {strings.hotel_hero_mockup_title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                            {strings.hotel_hero_mockup_period}
                        </Typography>
                    </Box>
                    <Box sx={{
                        bgcolor: '#DCFCE7', color: '#16A34A', px: 1.5, py: 0.5,
                        borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                        {strings.hotel_hero_mockup_stats}
                    </Box>
                </Box>

                {/* Kanban Columns */}
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>

                    {/* Column 1: Tanya Harga */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', mb: 1, textTransform: 'uppercase' }}>
                            {strings.hotel_hero_mockup_col1}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #E2E8F0' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Bpk. Gunawan</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Deluxe Room - 3 Night</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #FCD34D' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Ibu Sinta</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Wedding Venue Inquiry</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 2: Hold / DP */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', mb: 1, textTransform: 'uppercase' }}>
                            {strings.hotel_hero_mockup_col2}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Sdr. Adrian</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Standard - Paid DP</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 3: Check-in */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', mb: 1, textTransform: 'uppercase' }}>
                            {strings.hotel_hero_mockup_col3}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Kel. Baskoro</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>Villa - Check-in</Typography>
                            </Paper>
                        </Box>
                    </Box>

                </Box>

            </Paper>

        </Box>
    );
}
