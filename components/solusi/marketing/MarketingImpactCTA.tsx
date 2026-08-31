"use client";

import { Box, Container, Typography, Grid, Stack, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from '@/lib/analytics/events';
import Link from 'next/link';

export default function MarketingImpactCTA() {
    useLanguage();

    const impacts = [
        {
            value: strings.sol_mkt_impact1_val,
            label: strings.sol_mkt_impact1_desc
        },
        {
            value: strings.sol_mkt_impact2_val,
            label: strings.sol_mkt_impact2_desc
        },
        {
            value: strings.sol_mkt_impact3_val,
            label: strings.sol_mkt_impact3_desc
        },
        {
            value: strings.sol_mkt_impact4_val,
            label: strings.sol_mkt_impact4_desc
        }
    ];

    return (
        <Box>
            {/* Impact Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'var(--surface-tint)' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        sx={{
                            textAlign: 'center',
                            fontWeight: 800,
                            mb: 8,
                            fontSize: { xs: '1.75rem', md: '2.25rem' }
                        }}
                    >
                        {strings.sol_mkt_impact_title}
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        {impacts.map((impact, index) => (
                            <Grid item xs={6} md={3} key={index}>
                                <Stack spacing={1} alignItems="center" sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            color: 'var(--brand-deep)',
                                            fontSize: { xs: '1.75rem', md: '2.5rem' },
                                            lineHeight: 1.2,
                                            wordBreak: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        {impact.value}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#475569',
                                            maxWidth: '200px'
                                        }}
                                    >
                                        {impact.label}
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
                        {strings.sol_mkt_cta_title}
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
                        {strings.sol_mkt_cta_desc}
                    </Typography>
                    <Button
                        variant="contained"
                        component={Link}
                        href="/register"
                        onClick={() => trackCtaClick('solusi/marketing', 'impact_cta')}
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
                        {strings.sol_mkt_cta_btn}
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
