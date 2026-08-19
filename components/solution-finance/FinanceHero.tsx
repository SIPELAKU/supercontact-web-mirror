"use client";

import { Box, Typography, Paper } from "@mui/material";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { getWhatsAppLink } from '@/lib/utils/wa-link';
import PageHero from '@/components/marketing/PageHero';

export default function FinanceHero() {
    useLanguage();

    return (
        <PageHero
            badge={strings.formatString(strings.hero_slide_badge_solusi, strings.sol_ind_finance)}
            title={strings.fin_hero_title}
            description={strings.fin_hero_desc}
            trackSource="solusi/keuangan"
            secondaryCta={{
                label: strings.fin_hero_btn2,
                href: getWhatsAppLink('/solusi/keuangan'),
                external: true,
                icon: <WhatsAppIcon />,
                trackLabel: 'hero_wa_cta',
            }}
            visual={<FinanceHeroVisual />}
        />
    );
}

// Right-side hero visual, also reused by the homepage hero slider
// (components/home/HeroSlider.tsx) so the slide matches this page exactly.
export function FinanceHeroVisual() {
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
                            Pipeline Pengajuan Kredit
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: '#64748B' }}>
                            Target Bulan Ini
                        </Typography>
                    </Box>
                    <Box sx={{
                        bgcolor: '#DCFCE7', color: '#16A34A', px: 1.5, py: 0.5,
                        borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700
                    }}>
                        +Rp 2,5 Miliar
                    </Box>
                </Box>

                {/* Kanban Columns */}
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>

                    {/* Column 1: Prospek Baru */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', mb: 1, textTransform: 'uppercase' }}>
                            Prospek Baru (24)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #E2E8F0' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Bpk. Santoso</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Kredit Usaha Rakyat</Typography>
                            </Paper>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #FCD34D' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Ibu Wati</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Dari IG Ads</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 2: BI Checking */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#F59E0B', mb: 1, textTransform: 'uppercase' }}>
                            BI Checking (8)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #F59E0B' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>PT. Maju Terus</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Proses Verifikasi</Typography>
                            </Paper>
                        </Box>
                    </Box>

                    {/* Column 3: Disetujui */}
                    <Box sx={{ flex: 1, minWidth: '150px' }}>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#10B981', mb: 1, textTransform: 'uppercase' }}>
                            Disetujui (5)
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: '8px', borderLeft: '4px solid #10B981' }}>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#334155' }}>Sdr. Budi P.</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600 }}>Siap Cair</Typography>
                            </Paper>
                        </Box>
                    </Box>

                </Box>

            </Paper>

        </Box>
    );
}
