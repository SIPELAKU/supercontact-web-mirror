"use client";

import { Box, Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Stack } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

export default function IntComparison() {
    useLanguage();

    const rows = [
        { label: strings.sol_int_comp_row1_label, manual: strings.sol_int_comp_row1_manual, smart: strings.sol_int_comp_row1_smart },
        { label: strings.sol_int_comp_row2_label, manual: strings.sol_int_comp_row2_manual, smart: strings.sol_int_comp_row2_smart },
        { label: strings.sol_int_comp_row3_label, manual: strings.sol_int_comp_row3_manual, smart: strings.sol_int_comp_row3_smart },
        { label: strings.sol_int_comp_row4_label, manual: strings.sol_int_comp_row4_manual, smart: strings.sol_int_comp_row4_smart },
        { label: strings.sol_int_comp_row5_label, manual: strings.sol_int_comp_row5_manual, smart: strings.sol_int_comp_row5_smart },
    ];

    return (
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white' }}>
            <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography variant="overline" sx={{ color: '#3854D6', fontWeight: 700, letterSpacing: 1.5, mb: 2, display: 'block' }}>
                        {strings.sol_int_comp_badge}
                    </Typography>
                    <Typography variant="h2" component="h2" sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, color: '#0F172A' }}>
                        {strings.sol_int_comp_title}
                    </Typography>
                </Box>

                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '20px', overflowX: 'auto', mb: 6 }}>
                    <Table sx={{ minWidth: 560 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}></TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#64748B' }}>{strings.sol_int_comp_col1}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#3854D6' }}>{strings.sol_int_comp_col2}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.map((row, i) => (
                                <TableRow key={i}>
                                    <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{row.label}</TableCell>
                                    <TableCell sx={{ color: '#64748B' }}>{row.manual}</TableCell>
                                    <TableCell sx={{ color: '#0F172A', fontWeight: 600 }}>{row.smart}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 3, textAlign: 'center', color: '#0F172A' }}>
                    {strings.sol_int_comp_fit_title}
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#F0FDF4', border: '1px solid #DCFCE7', height: '100%' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                <CheckCircleIcon sx={{ color: '#22C55E' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#166534' }}>
                                    {strings.sol_int_comp_fit_yes_title}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#166534', lineHeight: 1.7 }}>
                                {strings.sol_int_comp_fit_yes_desc}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3.5, borderRadius: '18px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', height: '100%' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                                <InfoIcon sx={{ color: '#64748B' }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#334155' }}>
                                    {strings.sol_int_comp_fit_no_title}
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.7 }}>
                                {strings.sol_int_comp_fit_no_desc}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
