"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function CrmSalesWhyChoose() {
    useLanguage();

    const listItems = [
        { title: strings.crm_sales_why_list_1_title, desc: strings.crm_sales_why_list_1_desc },
        { title: strings.crm_sales_why_list_2_title, desc: strings.crm_sales_why_list_2_desc },
        { title: strings.crm_sales_why_list_3_title, desc: strings.crm_sales_why_list_3_desc },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                <Grid container spacing={8} alignItems="center">

                    {/* Left Column - Text Content */}
                    <Grid item xs={12} md={6}>
                        <Typography
                            variant="h3"
                            component="h2"
                            sx={{
                                fontWeight: 800,
                                color: '#111827',
                                mb: 3,
                                fontSize: { xs: '2rem', md: '2.5rem' },
                                lineHeight: 1.2
                            }}
                        >
                            {strings.crm_sales_why_title}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '1.125rem',
                                mb: 5,
                                lineHeight: 1.8
                            }}
                        >
                            {strings.crm_sales_why_subtitle}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {listItems.map((item, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2.5 }}>
                                    <Box sx={{ mt: 0.5 }}>
                                        {/* Light blue checkmark circle */}
                                        <Box sx={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: '50%',
                                            bgcolor: '#E0E7FF', // Light indigo background
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#6366F1' // Indigo icon color
                                        }}>
                                            <CheckCircleIcon sx={{ fontSize: 18 }} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827', mb: 0.5 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                            {item.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Column - Custom Blue Card Mockup */}
                    <Grid item xs={12} md={6}>
                        <Paper
                            elevation={12}
                            sx={{
                                bgcolor: '#3854D6', // Standard blue from hero image, matching reference 2
                                borderRadius: '24px',
                                p: { xs: 3, md: 5 },
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(89, 124, 255, 0.3)'
                            }}
                        >
                            {/* Decorative background curve/gradient effect (optional subtle enhancement) */}
                            <Box sx={{
                                position: 'absolute',
                                right: '-10%',
                                bottom: '-20%',
                                width: '60%',
                                height: '60%',
                                borderRadius: '50%',
                                bgcolor: 'rgba(255, 255, 255, 0.05)',
                                zIndex: 0
                            }} />

                            <Box sx={{ position: 'relative', zIndex: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 700, mb: 4 }}>
                                    {strings.crm_sales_perf_title}
                                </Typography>

                                {/* Top Full-width Stats Box */}
                                <Box sx={{
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    borderRadius: '16px',
                                    p: 3,
                                    mb: 3,
                                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontWeight: 500 }}>
                                            {strings.crm_sales_perf_revenue}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                                            Rp 128.5M
                                        </Typography>
                                    </Box>
                                    {/* Small Green Indicator inside */}
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        color: '#34D399', // Bright emerald green
                                        fontWeight: 700,
                                        fontSize: '1.25rem'
                                    }}>
                                        <TrendingUpIcon fontSize="medium" />
                                        24%
                                    </Box>
                                </Box>

                                {/* Bottom Split Stats Boxes */}
                                <Grid container spacing={3}>
                                    <Grid item xs={6}>
                                        <Box sx={{
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '16px',
                                            p: 3,
                                            height: '100%',
                                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontWeight: 500 }}>
                                                {strings.crm_sales_perf_converted}
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                142
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box sx={{
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '16px',
                                            p: 3,
                                            height: '100%',
                                            bgcolor: 'rgba(255, 255, 255, 0.05)'
                                        }}>
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1, fontWeight: 500 }}>
                                                {strings.crm_sales_perf_win_loss}
                                            </Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                68%
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                </Grid>
            </Container>
        </Box>
    );
}
