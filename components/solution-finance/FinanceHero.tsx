"use client";

import { Box, Container, Typography, Button, Paper } from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";
import { trackCtaClick } from '@/lib/analytics/events';

export default function FinanceHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#3854D6', // Standard blue
                pt: { xs: 12, md: 16 },
                pb: { xs: 10, md: 16 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8, alignItems: 'center' }}>

                    {/* Left Side Info */}
                    <Box sx={{ flex: 1, maxWidth: { xs: '100%', lg: '50%' } }}>
                        {/* Badge */}
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.2)',
                            px: 2,
                            py: 0.75,
                            borderRadius: '999px',
                            mb: 3
                        }}>
                            <AccountBalanceIcon sx={{ color: 'white', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                {strings.fin_hero_badge}
                            </Typography>
                        </Box>

                        <Typography
                            variant="h2"
                            component="h1"
                            sx={{
                                color: 'white',
                                fontWeight: 800,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.2,
                                mb: 3
                            }}
                        >
                            {strings.fin_hero_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: { xs: '1rem', md: '1.125rem' },
                                mb: 5,
                                maxWidth: '95%',
                                lineHeight: 1.6
                            }}
                        >
                            {strings.fin_hero_desc}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => { trackCtaClick('solusi/keuangan', 'hero_cta'); window.open(getWhatsAppLink(pathname), '_blank'); }}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#3854D6',
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
                                {strings.fin_hero_btn1}
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    borderColor: 'rgba(255,255,255,0.5)',
                                    color: 'white',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255,255,255,0.1)'
                                    }
                                }}
                            >
                                {strings.fin_hero_btn2}
                            </Button>
                        </Box>
                    </Box>

                    {/* Right Side Mockup */}
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

                </Box>
            </Container>
        </Box>
    );
}
