"use client";

import { Box, Container, Typography, Button, Paper, Grid, Stack, Divider } from "@mui/material";
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { usePathname } from "next/navigation";
import { getWhatsAppLink } from "@/lib/utils/wa-link";

export default function CrmServicesHero() {
    useLanguage();
    const pathname = usePathname();

    return (
        <Box
            sx={{
                width: '100%',
                bgcolor: '#597CFF', // Standard blue from the image
                pt: { xs: 12, md: 16 },
                pb: { xs: 10, md: 16 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Grid container spacing={6} alignItems="center">
                    {/* Left Side Info */}
                    <Grid item xs={12} md={6}>
                        {/* Badge */}
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'rgba(0, 0, 0, 0.15)',
                            px: 2,
                            py: 0.75,
                            borderRadius: '999px',
                            mb: 3
                        }}>
                            <HeadsetMicIcon sx={{ color: 'white', fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, fontSize: '0.8rem' }}>
                                {strings.crm_services_badge}
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
                            {strings.crm_services_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: { xs: '1rem', md: '1.125rem' },
                                mb: 5,
                                maxWidth: '90%',
                                lineHeight: 1.6
                            }}
                        >
                            {strings.crm_services_desc}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                onClick={() => window.open(getWhatsAppLink(pathname), '_blank')}
                                sx={{
                                    bgcolor: 'white',
                                    color: '#597CFF',
                                    fontWeight: 600,
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
                                {strings.crm_sales_btn_trial} {/* Same mapped text as sales "Mulai Uji Coba Gratis" */}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PlayCircleOutlineIcon />}
                                sx={{
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                    color: 'white',
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                }}
                            >
                                {strings.crm_services_btn_demo}
                            </Button>
                        </Box>
                    </Grid>

                    {/* Right Side Card Mockup (Support Dashboard) */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                position: 'relative',
                                perspective: '1000px',
                                // Hover group container
                                '&:hover .main-card': {
                                    transform: 'rotate(-2deg) translateY(-10px)',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
                                },
                                '&:hover .inner-col-1': {
                                    transform: 'translateY(0)',
                                },
                                '&:hover .inner-col-2': {
                                    transform: 'translateY(0)',
                                },
                                '&:hover .inner-col-3': {
                                    transform: 'translateY(0)',
                                }
                            }}
                        >
                            {/* Main Background Card */}
                            <Paper
                                className="main-card"
                                elevation={24}
                                sx={{
                                    bgcolor: '#FFFFFF',
                                    borderRadius: '16px',
                                    p: { xs: 3, md: 4 },
                                    transform: 'rotate(2deg) translateY(0)', // Initially rotated & slightly unaligned
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                                    position: 'relative',
                                }}
                            >
                                {/* Header */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1A1D20', mb: 0.5 }}>
                                            {strings.crm_services_dashboard}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 500, fontSize: '0.8rem' }}>
                                            {strings.crm_services_sla_target}
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        bgcolor: '#EFF6FF',
                                        color: '#3B82F6',
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        fontSize: '0.8rem'
                                    }}>
                                        <FilterAltOutlinedIcon fontSize="small" />
                                        {strings.crm_services_all_channels}
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                {/* Board columns */}
                                <Grid container spacing={2}>
                                    {/* Column 1: Tiket Baru */}
                                    <Grid item xs={4}>
                                        <Box className="inner-col-1" sx={{ transition: 'transform 0.5s ease-out', transform: 'translateY(15px)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {strings.crm_services_new_ticket}
                                                </Typography>
                                                <Typography variant="caption" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: 700, fontSize: '0.65rem' }}>
                                                    15
                                                </Typography>
                                            </Box>

                                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderLeft: '3px solid #EF4444', borderRadius: '8px', p: 1.5, mb: 1.5, bgcolor: '#FFFFFF' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '0.8rem' }}>Paket Belum Sampai</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>Siska A. •</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>Menunggu balasan</Typography>
                                            </Paper>

                                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderLeft: '3px solid #F59E0B', borderRadius: '8px', p: 1.5, bgcolor: '#FFFFFF' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', mb: 0.5, fontSize: '0.8rem' }}>Tanya Info Produk</Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>Budi P. • 2 menit lalu</Typography>
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    {/* Column 2: Sedang Diproses */}
                                    <Grid item xs={4}>
                                        <Box className="inner-col-2" sx={{ transition: 'transform 0.5s ease-out', transitionDelay: '0.05s', transform: 'translateY(5px)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#3B82F6', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {strings.crm_services_in_progress}
                                                </Typography>
                                                <Typography variant="caption" sx={{ bgcolor: '#EFF6FF', color: '#3B82F6', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: 700, fontSize: '0.65rem' }}>
                                                    4
                                                </Typography>
                                            </Box>

                                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderLeft: '3px solid #3B82F6', borderRadius: '8px', p: 1.5, bgcolor: '#FFFFFF' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', mb: 1, fontSize: '0.8rem' }}>Refund Transaksi</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6B7280' }}>
                                                    <PersonOutlineIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>Ditangani: Rina</Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </Grid>

                                    {/* Column 3: Selesai */}
                                    <Grid item xs={4}>
                                        <Box className="inner-col-3" sx={{ transition: 'transform 0.5s ease-out', transitionDelay: '0.1s', transform: 'translateY(-10px)' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                                                <Typography variant="subtitle2" sx={{ color: '#10B981', fontSize: '0.65rem', fontWeight: 700 }}>
                                                    {strings.crm_services_resolved}
                                                </Typography>
                                                <Typography variant="caption" sx={{ bgcolor: '#ECFDF5', color: '#10B981', px: 0.8, py: 0.2, borderRadius: '4px', fontWeight: 700, fontSize: '0.65rem' }}>
                                                    42
                                                </Typography>
                                            </Box>

                                            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderLeft: '3px solid #10B981', borderRadius: '8px', p: 1.5, bgcolor: '#FFFFFF' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827', mb: 1, fontSize: '0.8rem' }}>Ganti Alamat Kirim</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10B981' }}>
                                                    <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                                                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem' }}>Resolved (5m)</Typography>
                                                </Box>
                                            </Paper>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
