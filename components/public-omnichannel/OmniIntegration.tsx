"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function OmniIntegration() {
    useLanguage();

    const features = [
        {
            icon: <HubOutlinedIcon sx={{ fontSize: 28, color: '#3B82F6' }} />, // Blue
            iconBg: '#EFF6FF',
            title: strings.omni_integ_feat1_title,
            desc: strings.omni_integ_feat1_desc
        },
        {
            icon: <InstagramIcon sx={{ fontSize: 28, color: '#EC4899' }} />, // Pink
            iconBg: '#FDF2F8',
            title: strings.omni_integ_feat2_title,
            desc: strings.omni_integ_feat2_desc
        },
        {
            icon: <ConfirmationNumberOutlinedIcon sx={{ fontSize: 28, color: '#8B5CF6' }} />, // Purple
            iconBg: '#F5F3FF',
            title: strings.omni_integ_feat3_title,
            desc: strings.omni_integ_feat3_desc
        }
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#597CFF',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase'
                        }}
                    >
                        {strings.omni_integ_badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            mb: 3,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        {strings.omni_integ_title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            maxWidth: '700px',
                            mx: 'auto'
                        }}
                    >
                        {strings.omni_integ_subtitle}
                    </Typography>
                </Box>

                {/* Features Grid (3 Columns) */}
                <Grid container spacing={4} justifyContent="center">
                    {features.map((feature, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    borderRadius: '24px',
                                    bgcolor: '#FAFAFA',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
                                        borderColor: 'transparent'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: '16px',
                                        bgcolor: feature.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3
                                    }}
                                >
                                    {feature.icon}
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 2,
                                        color: '#111827',
                                        fontSize: '1.25rem',
                                        lineHeight: 1.4
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#4B5563',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem',
                                        flex: 1
                                    }}
                                >
                                    {feature.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
