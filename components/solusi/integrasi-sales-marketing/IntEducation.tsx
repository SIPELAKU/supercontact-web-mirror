"use client";

import { Box, Container, Typography, Grid, Paper, Stack } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CalculateIcon from '@mui/icons-material/Calculate';

export default function IntEducation() {
    useLanguage();

    const checks = [
        strings.sol_int_edu_check1,
        strings.sol_int_edu_check2,
        strings.sol_int_edu_check3,
        strings.sol_int_edu_check4,
        strings.sol_int_edu_check5,
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F8FAFC' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="overline" sx={{ color: '#597CFF', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_edu_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A', maxWidth: '750px', mx: 'auto', mb: 3 }}>
                        {strings.sol_int_edu_title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#475569', maxWidth: '700px', mx: 'auto', lineHeight: 1.7 }}>
                        {strings.sol_int_edu_intro}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={7}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '24px', bgcolor: 'white', border: '1px solid #E2E8F0', height: '100%' }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 3, color: '#0F172A' }}>
                                {strings.sol_int_edu_checklist_title}
                            </Typography>
                            <Stack spacing={2.5}>
                                {checks.map((check, i) => (
                                    <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                                        <CheckCircleIcon sx={{ fontSize: 22, color: '#22C55E', mt: 0.2, flexShrink: 0 }} />
                                        <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7 }}>
                                            {check}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={5}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 3, md: 5 },
                                borderRadius: '24px',
                                bgcolor: '#0F172A',
                                color: 'white',
                                height: '100%',
                            }}
                        >
                            <CalculateIcon sx={{ fontSize: 32, color: '#7692FF', mb: 2 }} />
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
                                {strings.sol_int_edu_calc_title}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.75, mb: 3, lineHeight: 1.7 }}>
                                {strings.sol_int_edu_calc_desc}
                            </Typography>
                            <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.08)', mb: 2.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.8 }}>
                                    {strings.sol_int_edu_calc_formula}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ opacity: 0.6, lineHeight: 1.7, display: 'block' }}>
                                {strings.sol_int_edu_calc_example}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
