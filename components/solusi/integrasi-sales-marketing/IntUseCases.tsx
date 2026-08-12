"use client";

import { Box, Container, Typography, Grid, Paper, Stack, Divider } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

export default function IntUseCases() {
    useLanguage();

    const useCases = [
        {
            role: strings.sol_int_uc1_role,
            problem: strings.sol_int_uc1_problem,
            workflow: strings.sol_int_uc1_workflow,
            solution: strings.sol_int_uc1_solution,
            outcome: strings.sol_int_uc1_outcome,
            icon: <CampaignIcon sx={{ fontSize: 26 }} />,
        },
        {
            role: strings.sol_int_uc2_role,
            problem: strings.sol_int_uc2_problem,
            workflow: strings.sol_int_uc2_workflow,
            solution: strings.sol_int_uc2_solution,
            outcome: strings.sol_int_uc2_outcome,
            icon: <TrendingUpIcon sx={{ fontSize: 26 }} />,
        },
        {
            role: strings.sol_int_uc3_role,
            problem: strings.sol_int_uc3_problem,
            workflow: strings.sol_int_uc3_workflow,
            solution: strings.sol_int_uc3_solution,
            outcome: strings.sol_int_uc3_outcome,
            icon: <BusinessCenterIcon sx={{ fontSize: 26 }} />,
        },
    ];

    const rows: Array<{ label: string; key: 'problem' | 'workflow' | 'solution' | 'outcome' }> = [
        { label: strings.sol_int_uc_label_problem, key: 'problem' },
        { label: strings.sol_int_uc_label_workflow, key: 'workflow' },
        { label: strings.sol_int_uc_label_solution, key: 'solution' },
        { label: strings.sol_int_uc_label_outcome, key: 'outcome' },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_uc_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_int_uc_title}
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {useCases.map((uc, index) => (
                        <Grid item xs={12} md={4} key={index}>
                            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, height: '100%', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                                    <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: '#EEF2FF', color: '#3854D6', display: 'flex' }}>
                                        {uc.icon}
                                    </Box>
                                    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                        {uc.role}
                                    </Typography>
                                </Stack>
                                <Stack spacing={2} divider={<Divider flexItem sx={{ borderColor: '#F1F5F9' }} />}>
                                    {rows.map((row) => (
                                        <Box key={row.key}>
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94A3B8', letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                                {row.label}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                                                {uc[row.key]}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}
