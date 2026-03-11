"use client";

import { Box, Container, Typography, Button, Paper } from "@mui/material";
import HotelIcon from '@mui/icons-material/Hotel';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function HotelHero() {
    useLanguage();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#597CFF', // Standard blue
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
                            <HotelIcon sx={{ color: 'white', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                {strings.hotel_hero_badge}
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
                            {strings.hotel_hero_title}
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
                            {strings.hotel_hero_desc}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
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
                                {strings.hotel_hero_btn_trial}
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
                                {strings.hotel_hero_btn_consult}
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

                </Box>
            </Container>
        </Box>
    );
}
