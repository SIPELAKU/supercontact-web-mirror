"use client";

import { Box, Container, Typography, Stack, Button } from "@mui/material";
import Link from "next/link";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from '@/lib/analytics/events';

export default function CompanyCTA() {
    useLanguage();

    return (
        <Box
            sx={{
                py: { xs: 8, md: 15 },
                background: 'var(--gradient-deep)',
                textAlign: 'center',
                color: 'white',
            }}
        >
            <Container maxWidth="md">
                <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
                    {strings.company_cta_title}
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.125rem', opacity: 0.9, mb: 5, lineHeight: 1.6, maxWidth: '650px', mx: 'auto' }}>
                    {strings.company_cta_desc}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                    <Button
                        component={Link}
                        href="/register"
                        variant="contained"
                        onClick={() => trackCtaClick('company', 'final_cta')}
                        sx={{
                            bgcolor: 'white',
                            color: '#4264D0',
                            fontWeight: 700,
                            px: 6,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.125rem',
                            '&:hover': { bgcolor: '#f0f0f0' },
                        }}
                    >
                        {strings.company_cta_btn}
                    </Button>
                    <Button
                        component={Link}
                        href="/price"
                        variant="outlined"
                        sx={{
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            fontWeight: 700,
                            px: 6,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1.125rem',
                            borderWidth: '2px',
                            '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', borderWidth: '2px' },
                        }}
                    >
                        {strings.company_cta_btn2}
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}
