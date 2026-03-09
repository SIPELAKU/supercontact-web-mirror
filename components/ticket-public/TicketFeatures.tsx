"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import BoltIcon from '@mui/icons-material/Bolt';
import ShareIcon from '@mui/icons-material/Share';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function TicketFeatures() {
    useLanguage();

    const features = [
        {
            icon: <BoltIcon sx={{ fontSize: 28, color: '#3B82F6' }} />, // Blue
            iconBg: '#EFF6FF',
            title: strings.ticket_feat1_title,
            desc: strings.ticket_feat1_desc
        },
        {
            icon: <ShareIcon sx={{ fontSize: 24, color: '#22C55E' }} />, // Green
            iconBg: '#DCFCE7',
            title: strings.ticket_feat2_title,
            desc: strings.ticket_feat2_desc
        },
        {
            icon: <VisibilityIcon sx={{ fontSize: 28, color: '#F97316' }} />, // Orange
            iconBg: '#FFEDD5',
            title: strings.ticket_feat3_title,
            desc: strings.ticket_feat3_desc
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
                        MENGAPA FITUR INI PENTING?
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
                        {strings.ticket_feat_title}
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
                        {strings.ticket_feat_subtitle}
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
