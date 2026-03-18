"use client";

import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GroupsIcon from '@mui/icons-material/Groups';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';

export default function HRChallenges() {
    useLanguage();

    const challenges = [
        {
            title: strings.sol_hr_chall1_title,
            desc: strings.sol_hr_chall1_desc,
            icon: <QuestionAnswerIcon sx={{ fontSize: 32, color: '#EF4444' }} />,
            bgColor: '#FFF1F2',
            iconBg: '#FFE4E6'
        },
        {
            title: strings.sol_hr_chall2_title,
            desc: strings.sol_hr_chall2_desc,
            icon: <GroupsIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
            bgColor: '#FFFBEB',
            iconBg: '#FEF3C7'
        },
        {
            title: strings.sol_hr_chall3_title,
            desc: strings.sol_hr_chall3_desc,
            icon: <SpeakerNotesOffIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
            bgColor: '#F5F3FF',
            iconBg: '#EDE9FE'
        }
    ];

    return (
        <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Stack spacing={2} sx={{ mb: 8, textAlign: 'center' }}>
                    <Typography
                        variant="overline"
                        sx={{
                            color: '#6366F1',
                            fontWeight: 800,
                            letterSpacing: 2,
                            display: 'block'
                        }}
                    >
                        {strings.sol_hr_chall_badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            color: '#0F172A',
                            lineHeight: 1.2
                        }}
                    >
                        {strings.sol_hr_chall_title}
                    </Typography>
                </Stack>

                <Grid container spacing={4}>
                    {challenges.map((item, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    bgcolor: item.bgColor,
                                    borderRadius: '24px',
                                    border: '1px solid #F1F5F9',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)',
                                        borderColor: '#6366F1'
                                    }
                                }}
                            >
                                <Stack spacing={3} alignItems="center" sx={{ textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '16px',
                                            bgcolor: item.iconBg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            sx={{ fontWeight: 800, mb: 2, color: '#1E293B' }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#64748B',
                                                lineHeight: 1.7,
                                                fontSize: '1rem',
                                                '& b, & strong': { color: '#334155' }
                                            }}
                                            dangerouslySetInnerHTML={{ __html: item.desc.replace(/\*(.*?)\*/g, '<strong>$1</strong>') }}
                                        />
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
