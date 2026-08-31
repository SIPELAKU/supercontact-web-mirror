"use client";

import { Box, Container, Typography, Grid, Paper, alpha } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

export default function RetailChallenges() {
    useLanguage();

    const challenges = [
        {
            title: strings.retail_chall1_title,
            desc: strings.retail_chall1_desc,
            icon: <PeopleAltIcon sx={{ fontSize: 32, color: '#EF4444' }} />,
            iconBg: '#FEE2E2',
            bgTint: '#FFF5F5',
            borderColor: '#FECACA',
        },
        {
            title: strings.retail_chall2_title,
            desc: strings.retail_chall2_desc,
            icon: <WhatsAppIcon sx={{ fontSize: 32, color: '#F97316' }} />,
            iconBg: '#FFEDD5',
            bgTint: '#FFFAF5',
            borderColor: '#FED7AA',
        },
        {
            title: strings.retail_chall3_title,
            desc: strings.retail_chall3_desc,
            icon: <GppMaybeIcon sx={{ fontSize: 32, color: '#6366F1' }} />,
            iconBg: '#E0E7FF',
            bgTint: '#F5F7FF',
            borderColor: '#C7D2FE',
        }
    ];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 10 }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'var(--brand-deep)',
                            fontWeight: 800,
                            letterSpacing: 1.5,
                            mb: 2,
                            display: 'block'
                        }}
                    >
                        {strings.retail_chall_subtitle}
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            color: '#0F172A',
                            fontSize: { xs: '1.75rem', md: '2.5rem' }
                        }}
                    >
                        {strings.retail_chall_title}
                    </Typography>
                </Box>

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
