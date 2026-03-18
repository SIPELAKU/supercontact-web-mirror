"use client";

import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import EventNoteIcon from '@mui/icons-material/EventNote';
import RouterIcon from '@mui/icons-material/Router';
import BugReportIcon from '@mui/icons-material/BugReport';

export default function ITSaaSChallenges() {
    useLanguage();

    const challenges = [
        {
            title: strings.it_chall1_title,
            desc: strings.it_chall1_desc,
            icon: <EventNoteIcon sx={{ fontSize: 32, color: '#F43F5E' }} />,
            bgColor: '#FFF1F2',
            iconBg: '#FFE4E6'
        },
        {
            title: strings.it_chall2_title,
            desc: strings.it_chall2_desc,
            icon: <RouterIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
            bgColor: '#FFFBEB',
            iconBg: '#FEF3C7'
        },
        {
            title: strings.it_chall3_title,
            desc: strings.it_chall3_desc,
            icon: <BugReportIcon sx={{ fontSize: 32, color: '#6366F1' }} />,
            bgColor: '#F5F3FF',
            iconBg: '#EDE9FE'
        }
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                        {strings.it_chall_badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            maxWidth: '700px',
                            mx: 'auto'
                        }}
                    >
                        {strings.it_chall_title}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {challenges.map((challenge, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    height: '100%',
                                    borderRadius: '24px',
                                    bgcolor: challenge.bgColor,
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.02)',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)'
                                    }
                                }}
                            >
                                <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '16px',
                                            bgcolor: challenge.iconBg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {challenge.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: '#0F172A' }}>
                                            {challenge.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.7 }}>
                                            {challenge.desc}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
