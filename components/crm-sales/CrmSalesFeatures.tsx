"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

// Icons
import ViewKanbanOutlinedIcon from '@mui/icons-material/ViewKanbanOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

export default function CrmSalesFeatures() {
    useLanguage();

    const features = [
        {
            icon: <ViewKanbanOutlinedIcon sx={{ fontSize: 32, color: '#597CFF' }} />,
            iconBg: '#EEF2FF',
            title: strings.crm_sales_feat_1_title,
            desc: strings.crm_sales_feat_1_desc
        },
        {
            icon: <PeopleOutlineIcon sx={{ fontSize: 32, color: '#10B981' }} />,
            iconBg: '#ECFDF5',
            title: strings.crm_sales_feat_2_title,
            desc: strings.crm_sales_feat_2_desc
        },
        {
            icon: <EventAvailableOutlinedIcon sx={{ fontSize: 32, color: '#8B5CF6' }} />,
            iconBg: '#F5F3FF',
            title: strings.crm_sales_feat_3_title,
            desc: strings.crm_sales_feat_3_desc
        },
        {
            icon: <BarChartOutlinedIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
            iconBg: '#FFFBEB',
            title: strings.crm_sales_feat_4_title,
            desc: strings.crm_sales_feat_4_desc
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
                            display: 'block'
                        }}
                    >
                        {strings.crm_sales_features_badge}
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
                        {strings.crm_sales_features_title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'text.secondary',
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            maxWidth: '600px',
                            mx: 'auto'
                        }}
                    >
                        {strings.crm_sales_features_subtitle}
                    </Typography>
                </Box>

                {/* Features Grid */}
                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
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
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.08)',
                                        borderColor: 'transparent'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 64,
                                        height: 64,
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
                                        color: 'text.primary',
                                        fontSize: '1.25rem',
                                        lineHeight: 1.4
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem'
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
