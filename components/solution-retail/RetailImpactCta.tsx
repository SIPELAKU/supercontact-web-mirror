"use client";

import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";

export default function RetailImpactCta() {
    useLanguage();

    const metrics = [
        { val: strings.retail_impact1_val, desc: strings.retail_impact1_desc },
        { val: strings.retail_impact2_val, desc: strings.retail_impact2_desc },
        { val: strings.retail_impact3_val, desc: strings.retail_impact3_desc },
        { val: strings.retail_impact4_val, desc: strings.retail_impact4_desc }
    ];

    return (
        <Box sx={{ width: '100%' }}>
            {/* Impact Metrics Section */}
            <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#F0F4FF' }}>
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
                        {strings.retail_impact_title}
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        {metrics.map((m, i) => (
                            <Grid item xs={6} md={3} key={i}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h2"
                                        sx={{
                                            fontWeight: 800,
                                            color: '#597CFF',
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
                    bgcolor: '#597CFF',
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
                        {strings.retail_cta_title}
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
                        {strings.retail_cta_desc}
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: 'white',
                            color: '#597CFF',
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
                        {strings.retail_cta_btn}
                    </Button>
                </Container>
            </Box>
        </Box>
    );
}
