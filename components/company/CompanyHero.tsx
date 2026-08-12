'use client';

import React from 'react';
import { Box, Typography, Button, Container, Stack } from '@mui/material';
import Link from 'next/link';
import { strings } from '@/lib/utils/strings';
import { trackCtaClick } from '@/lib/analytics/events';

const CompanyHero = () => {
    return (
        <Box sx={{
            background: 'linear-gradient(180deg, #4264D0 0%, #2A408E 100%)',
            color: 'white',
            height: { xs: 'auto', md: '583px' },
            minHeight: { xs: '450px', md: '583px' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            py: { xs: 8, sm: 8, md: 4, lg: 6 }
        }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    component="h1"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                        mb: 3,
                        fontSize: { xs: '2rem', md: '40px' },
                        lineHeight: 1.2
                    }}
                >
                    {strings.company_hero_title}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 400,
                        maxWidth: '740px',
                        mx: 'auto',
                        mb: 5,
                        opacity: 0.9,
                        lineHeight: 1.8,
                        fontSize: { xs: '1rem', md: '20px' }
                    }}
                >
                    {strings.company_hero_desc}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                        component={Link}
                        href="/register"
                        onClick={() => trackCtaClick('company', 'hero_cta')}
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: 'white',
                            color: '#4264D0',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 5,
                            py: 1.8,
                            '&:hover': {
                                bgcolor: '#f8f9fa'
                            }
                        }}
                    >
                        {strings.company_hero_btn1}
                    </Button>
                    <Button
                        component={Link}
                        href="/solusi/integrasi-sales-marketing"
                        variant="outlined"
                        size="large"
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 5,
                            py: 1.8,
                            borderWidth: '2px',
                            '&:hover': {
                                borderColor: 'white',
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: '2px'
                            }
                        }}
                    >
                        {strings.company_hero_btn2}
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
};

export default CompanyHero;
