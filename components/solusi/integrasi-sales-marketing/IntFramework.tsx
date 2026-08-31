"use client";

import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import SearchIcon from '@mui/icons-material/Search';
import RuleIcon from '@mui/icons-material/Rule';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TuneIcon from '@mui/icons-material/Tune';

export default function IntFramework() {
    useLanguage();

    const steps = [
        { title: strings.sol_int_fw_step1_title, desc: strings.sol_int_fw_step1_desc, icon: <SearchIcon /> },
        { title: strings.sol_int_fw_step2_title, desc: strings.sol_int_fw_step2_desc, icon: <RuleIcon /> },
        { title: strings.sol_int_fw_step3_title, desc: strings.sol_int_fw_step3_desc, icon: <AutoAwesomeIcon /> },
        { title: strings.sol_int_fw_step4_title, desc: strings.sol_int_fw_step4_desc, icon: <MonitorHeartIcon /> },
        { title: strings.sol_int_fw_step5_title, desc: strings.sol_int_fw_step5_desc, icon: <TuneIcon /> },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="overline" sx={{ color: 'var(--brand-deep)', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_fw_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', maxWidth: '800px', mx: 'auto' }}>
                        {strings.sol_int_fw_title}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {steps.map((step, index) => (
                        <Grid item xs={12} sm={6} md={2.4} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3.5,
                                    height: '100%',
                                    borderRadius: '20px',
                                    border: '1px solid #E2E8F0',
                                    position: 'relative',
                                    '&:hover': { borderColor: '#597CFF' },
                                    transition: 'border-color 0.2s',
                                }}
                            >
                                <Typography
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 16,
                                        fontWeight: 800,
                                        fontSize: '1.75rem',
                                        color: 'var(--surface-tint)',
                                    }}
                                >
                                    0{index + 1}
                                </Typography>
                                <Box sx={{ color: 'var(--brand-deep)', mb: 2 }}>{step.icon}</Box>
                                <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.6, fontSize: '0.85rem' }}>
                                    {step.desc}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
