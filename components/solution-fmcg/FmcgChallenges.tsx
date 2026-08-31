"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function FmcgChallenges() {
    useLanguage();

    const challenges = [
        {
            icon: <AssignmentLateIcon sx={{ fontSize: 24, color: '#EF4444' }} />, // Red
            iconBg: '#FEE2E2',
            bgTint: '#FFF5F5',
            borderColor: '#FECACA',
            title: strings.fmcg_chall1_title,
            desc: strings.fmcg_chall1_desc
        },
        {
            icon: <VisibilityOffIcon sx={{ fontSize: 24, color: '#F97316' }} />, // Orange
            iconBg: '#FFEDD5',
            bgTint: '#FFFAF5',
            borderColor: '#FED7AA',
            title: strings.fmcg_chall2_title,
            desc: strings.fmcg_chall2_desc
        },
        {
            icon: <InventoryIcon sx={{ fontSize: 24, color: '#2563EB' }} />, // Blue
            iconBg: '#DBEAFE',
            bgTint: '#F5F7FF',
            borderColor: '#C7D2FE',
            title: strings.fmcg_chall3_title,
            desc: strings.fmcg_chall3_desc
        }
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
                {/* Section Header */}
                <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 }, maxWidth: '800px', mx: 'auto' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'var(--brand-deep)',
                            fontWeight: 700,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block',
                            textTransform: 'uppercase'
                        }}
                    >
                        {strings.fmcg_chall_badge}
                    </Typography>
                    <Typography
                        variant="h3"
                        component="h2"
                        sx={{
                            fontWeight: 800,
                            color: 'text.primary',
                            fontSize: { xs: '2rem', md: '2.5rem' }
                        }}
                    >
                        {strings.fmcg_chall_title}
                    </Typography>
                </Box>

                {/* Challenges Grid (3 Columns) */}
                <Grid container spacing={4} justifyContent="center">
                    {challenges.map((chal, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: { xs: 4, md: 5 },
                                    height: '100%',
                                    borderRadius: '24px',
                                    bgcolor: chal.bgTint,
                                    border: '1px solid',
                                    borderColor: chal.borderColor,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: '12px',
                                        bgcolor: chal.iconBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3
                                    }}
                                >
                                    {chal.icon}
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 2,
                                        color: '#111827',
                                        fontSize: '1.2rem',
                                        lineHeight: 1.3
                                    }}
                                >
                                    {chal.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#4B5563',
                                        lineHeight: 1.7,
                                        fontSize: '0.95rem'
                                    }}
                                >
                                    {chal.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
