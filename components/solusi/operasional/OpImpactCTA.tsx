"use client";

import { Box, Container, Typography, Grid, Stack, Button, Paper } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import Link from 'next/link';
import { trackCtaClick } from '@/lib/analytics/events';

export default function OpImpactCTA() {
    useLanguage();

    const stats = [
        { val: strings.sol_op_impact1_val, desc: strings.sol_op_impact1_desc },
        { val: strings.sol_op_impact2_val, desc: strings.sol_op_impact2_desc },
        { val: strings.sol_op_impact3_val, desc: strings.sol_op_impact3_desc },
        { val: strings.sol_op_impact4_val, desc: strings.sol_op_impact4_desc }
    ];

    return (
        <Box>
            {/* Impact Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--surface-tint)' }}>
                <Container maxWidth="xl">
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            mb: 8,
                            fontSize: { xs: '1.75rem', md: '2.25rem' }
                        }}
                    >
                        {strings.sol_op_impact_title}
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {stats.map((stat, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            color: 'var(--brand-deep)',
                                            fontSize: { xs: '2.5rem', md: '3.5rem' }
                                        }}
                                    >
                                        {stat.val}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#475569',
                                            maxWidth: '180px'
                                        }}
                                    >
                                        {stat.desc}
                                    </Typography>
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box
                sx={{
                    py: { xs: 8, md: 15 },
                    background: 'var(--gradient-brand)',
                    textAlign: 'center',
                    color: 'white'
                }}
            >
                <Container maxWidth="md">
                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 800,
                            mb: 4,
                            fontSize: { xs: '2.25rem', md: '3.5rem' }
                        }}
                    >
                        {strings.sol_op_cta_title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.125rem',
                            opacity: 0.9,
                            mb: 6,
                            lineHeight: 1.6,
                            maxWidth: '700px',
                            mx: 'auto'
                        }}
                    >
                        {strings.sol_op_cta_desc}
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        href="/register"
                        onClick={() => trackCtaClick('solusi/operasional', 'impact_cta')}
                        sx={{
                            bgcolor: 'white',
                            color: 'var(--brand-deep)',
                            fontWeight: 700,
                            px: 6,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.125rem',
                            '&:hover': { bgcolor: '#f0f0f0' }
                        }}
                    >
                        {strings.sol_op_cta_btn}
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
