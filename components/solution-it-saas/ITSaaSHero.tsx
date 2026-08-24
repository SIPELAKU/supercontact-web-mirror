"use client";

import { Box, Typography, Stack, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getWhatsAppLink } from '@/lib/utils/wa-link';
import PageHero from '@/components/marketing/PageHero';

export default function ITSaaSHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_ind_it)}
            title={strings.it_hero_title}
            description={strings.it_hero_desc}
            trackSource="solusi/it-saas"
            secondaryCta={{
                label: strings.it_hero_btn2,
                href: getWhatsAppLink('/solusi/it-saas'),
                external: true,
                icon: <WhatsAppIcon />,
                trackLabel: 'hero_wa_cta',
            }}
            visual={<ITSaaSHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function ITSaaSHeroVisual() {
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                        {strings.it_hero_mock_title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        {strings.it_hero_mock_subtitle}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        bgcolor: '#F0FDF4',
                        color: '#166534',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid #DCFCE7'
                    }}
                >
                    {strings.it_hero_mock_total}
                </Box>
            </Box>

            {/* Mockup Grid */}
            <Grid container spacing={1.5}>
                {/* Col 1 */}
                <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#64748B', mb: 1.5 }}>
                            {strings.it_hero_mock_col1}
                        </Typography>
                        <Stack spacing={1}>
                            <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #64748B' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>PT. Logistik Cepat</Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Kebutuhan: Custom ERP</Typography>
                            </Paper>
                            <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #64748B' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Klinik Sehat</Typography>
                                <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Tanya Modul SaaS</Typography>
                            </Paper>
                        </Stack>
                    </Box>
                </Grid>

                {/* Col 2 */}
                <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#F59E0B', mb: 1.5 }}>
                            {strings.it_hero_mock_col2}
                        </Typography>
                        <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #F59E0B' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Grup Retail XYZ</Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Kirim Penawaran Harga</Typography>
                        </Paper>
                    </Box>
                </Grid>

                {/* Col 3 */}
                <Grid item xs={4}>
                    <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', height: '100%' }}>
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, fontSize: '0.65rem', color: '#10B981', mb: 1.5 }}>
                            {strings.it_hero_mock_col3}
                        </Typography>
                        <Paper sx={{ p: 1, borderRadius: '8px', borderLeft: '3px solid #10B981' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.7rem' }}>Bank Daerah Maju</Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.6rem' }}>Tanda Tangan SPK</Typography>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
}
