"use client";

import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from '@/lib/analytics/events';
import Link from 'next/link';

export default function FmcgImpactCta() {
    useLanguage();

    const metrics = [
        { val: strings.fmcg_impact1_val, desc: strings.fmcg_impact1_desc },
        { val: strings.fmcg_impact2_val, desc: strings.fmcg_impact2_desc },
        { val: strings.fmcg_impact3_val, desc: strings.fmcg_impact3_desc },
        { val: strings.fmcg_impact4_val, desc: strings.fmcg_impact4_desc }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {/* Impact Metrics Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--surface-tint)' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h4"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            mb: 8,
                            color: '#111827',
                            fontSize: { xs: '1.75rem', md: '2.25rem' }
                        }}
                    >
                        {strings.fmcg_impact_title}
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        {metrics.map((m, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            color: 'var(--brand-deep)',
                                            mb: 1.5,
                                            fontSize: { xs: '2rem', md: '3.5rem' }
                                        }}
                                    >
                                        {m.val}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#64748B',
                                            fontWeight: 600,
                                            fontSize: { xs: '0.8rem', md: '0.95rem' },
                                            lineHeight: 1.4,
                                            px: { md: 2 }
                                        }}
                                    >
                                        {m.desc}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Final CTA Section - Full Width Blue Banner */}
            <Box
                sx={{
                    bgcolor: 'var(--brand-deep)',
                    py: { xs: 8, md: 12 },
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 3,
                            fontSize: { xs: '1.75rem', md: '3rem' }
                        }}
                    >
                        {strings.fmcg_cta_title}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '1rem', md: '1.125rem' },
                            mb: 6,
                            maxWidth: '850px',
                            mx: 'auto',
                            opacity: 0.9,
                            lineHeight: 1.6
                        }}
                    >
                        {strings.fmcg_cta_desc}
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        href="/register"
                        onClick={() => trackCtaClick('solusi/fmcg', 'impact_cta')}
                        sx={{
                            bgcolor: 'white',
                            color: 'var(--brand-deep)',
                            fontWeight: 700,
                            px: 5,
                            py: 1.8,
                            borderRadius: '12px',
                            fontSize: '1.1rem',
                            textTransform: 'none',
                            boxShadow: '0 10px 20px -5px rgba(0,0,0,0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {strings.fmcg_cta_btn}
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
