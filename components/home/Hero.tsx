'use client';

import React from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import { NO_WA } from '@/lib/constants/constants';
import { trackCtaClick } from '@/lib/analytics/events';

const Hero = () => {
    useLanguage();

    return (
        <Box sx={{
            backgroundColor: "var(--brand)",
            color: "white",
            width: "100%",
            position: "relative",
            overflow: "hidden",
            pt: { xs: 8, md: 5 },
            pb: { xs: 8, md: 0 },
        }}>
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, md: 0 } }}>
                <Grid container spacing={0} alignItems="start" sx={{ pt: { xs: 8, md: "83px" } }}>
                    <Grid item xs={12} md={7} >
                        <Box sx={{
                            ml: { xs: 0, md: 4, lg: "147px" },
                            maxWidth: { xs: '100%', md: '626px' },
                            width: '100%'
                        }}>
                            <Typography
                                variant="h1"
                                component="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '40px' },
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    mb: 3
                                }}
                            >
                                {strings.hero_title}
                            </Typography>
                            <Typography
                                variant="h6"
                                component="p"
                                sx={{
                                    fontSize: { xs: '1rem', md: '20px' },
                                    fontWeight: 400,
                                    opacity: 0.9,
                                    mb: 4,
                                    maxWidth: { xs: '100%', md: '90%' }
                                }}
                            >
                                {strings.hero_subtitle}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <Button
                                    component={Link}
                                    href="/register"
                                    variant="contained"
                                    size="large"
                                    onClick={() => trackCtaClick('home', 'hero_register_cta')}
                                    sx={{
                                        backgroundColor: 'white',
                                        color: 'primary.main',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '50px',
                                        '&:hover': {
                                            backgroundColor: '#f5f5f5',
                                        },
                                    }}
                                >
                                    {strings.hero_cta_free}
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    startIcon={<WhatsAppIcon />}
                                    onClick={() => {
                                        trackCtaClick('home', 'hero_cta');
                                        const message = encodeURIComponent(strings.formatString(strings.wa_interest_msg, "SmartSales"));
                                        window.open(`https://wa.me/${NO_WA}?text=${message}`, '_blank');
                                    }}
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '50px',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                        },
                                    }}
                                >
                                    {strings.whatsapp_sales_button}
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={5} sx={{
                        position: 'relative',
                        height: { xs: 'auto', md: '100%' },
                        minHeight: { xs: 'auto', md: 600 },
                        display: { xs: 'flex', md: 'block' },
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3,
                        mt: { xs: 4, md: 0 },
                        pb: { xs: 8, md: 0 }
                    }}>
                        {/* Main Banner Illustration */}
                        <Box
                            component="img"
                            src="/assets/banner-design.png"
                            alt="Dasbor analitik penjualan SmartSales dengan grafik performa tim sales"
                            sx={{
                                width: { xs: '100%', md: '500px', lg: '715.23px' },
                                maxWidth: 'none',
                                position: 'absolute',
                                bottom: 0,
                                right: { xs: '50%', md: '-10%', lg: '2%' },
                                transform: { xs: 'translateX(50%)', md: 'none' },
                                zIndex: 1,
                                display: { xs: 'none', md: 'block' }
                            }}
                        />

                        {/* Floating Card 1: Sales Summary */}
                        <Card sx={{
                            position: { xs: 'relative', md: 'absolute' },
                            top: { xs: 'auto', md: '-40px', lg: '-20px' },
                            right: { xs: 'auto', md: '0', lg: '5%' },
                            zIndex: 3,
                            width: { xs: '100%', md: 220 },
                            maxWidth: { xs: 300, md: 'none' },
                            minHeight: 280,
                            borderRadius: '24px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{
                                    bgcolor: '#E7F7E8',
                                    borderRadius: '16px',
                                    p: 1.5,
                                    color: '#52C41A',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ShoppingBagOutlinedIcon sx={{ fontSize: 28 }} />
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: '#52C41A', fontWeight: 600 }}>
                                        +38%
                                    </Typography>
                                    <ArrowOutwardIcon sx={{ color: '#52C41A', fontSize: 16 }} />
                                </Box>
                            </Box>
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#1F2937' }}>
                                    $13.4k
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>
                                    {strings.hero_card_total_sales}
                                </Typography>
                            </Box>
                            <Box sx={{
                                bgcolor: '#F3F4F6',
                                borderRadius: '99px',
                                py: 1,
                                px: 2,
                                width: 'fit-content'
                            }}>
                                <Typography variant="caption" sx={{ color: '#4B5563', fontWeight: 600 }}>
                                    {strings.hero_card_last_6_months}
                                </Typography>
                            </Box>
                        </Card>

                        {/* Floating Card 2: Congratulations */}
                        <Card sx={{
                            position: { xs: 'relative', md: 'absolute' },
                            top: { xs: 'auto', md: '280px', lg: '60px' },
                            left: { xs: 'auto', md: '0', lg: '-40px' },
                            zIndex: 2,
                            width: { xs: '100%', md: 380 },
                            maxWidth: { xs: 450, md: 'none' },
                            borderRadius: '20px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            p: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937', fontSize: '1rem' }}>
                                    {strings.hero_card_congrats} <Box component="span" sx={{ fontWeight: 800 }}>Muhammad!</Box>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
                                    {strings.hero_card_best_seller}
                                </Typography>
                                <Typography variant="h4" sx={{ color: '#3B82F6', fontWeight: 700, mb: 0.5 }}>
                                    $42.8k
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                        78% {strings.hero_card_target}
                                    </Typography>
                                    <Box sx={{ width: 14, height: 14, bgcolor: '#4B5563', borderRadius: '3px' }} />
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: '#3B82F6',
                                        '&:hover': { bgcolor: '#2563EB' },
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 3,
                                        py: 0.8
                                    }}
                                >
                                    {strings.hero_card_view_sales}
                                </Button>
                            </Box>
                            <Box sx={{ transform: 'translateX(10px)' }}>
                                <Image src="/assets/Trophy.png" alt="" width={140} height={140} style={{ objectFit: 'contain' }} />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Hero;
