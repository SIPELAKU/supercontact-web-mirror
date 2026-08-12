"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function IntProblem() {
    useLanguage();

    const problems = [
        {
            title: strings.sol_int_problem1_title,
            desc: strings.sol_int_problem1_desc,
            icon: <ChatBubbleOutlineIcon sx={{ fontSize: 32, color: '#F43F5E' }} />,
            bgColor: '#FFF1F2',
        },
        {
            title: strings.sol_int_problem2_title,
            desc: strings.sol_int_problem2_desc,
            icon: <HelpOutlineIcon sx={{ fontSize: 32, color: '#F59E0B' }} />,
            bgColor: '#FFFBEB',
        },
        {
            title: strings.sol_int_problem3_title,
            desc: strings.sol_int_problem3_desc,
            icon: <TrendingDownIcon sx={{ fontSize: 32, color: '#6366F1' }} />,
            bgColor: '#F5F3FF',
        },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="overline"
                        sx={{ color: '#597CFF', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}
                    >
                        {strings.sol_int_problem_badge}
                    </Typography>
                    <Typography
                        variant="h2"
                        component="h2"
                        sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', maxWidth: '750px', mx: 'auto' }}
                    >
                        {strings.sol_int_problem_title}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {problems.map((problem, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 5,
                                    height: '100%',
                                    borderRadius: '24px',
                                    bgcolor: problem.bgColor,
                                    border: '1px solid',
                                    borderColor: 'rgba(0,0,0,0.02)',
                                }}
                            >
                                <Box sx={{ mb: 3 }}>{problem.icon}</Box>
                                <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 1.5, color: '#0F172A' }}>
                                    {problem.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                    {problem.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
