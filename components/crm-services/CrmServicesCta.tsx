"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import { trackCtaClick } from '@/lib/analytics/events';
import Link from 'next/link';

export default function CrmServicesCta() {
    useLanguage();

    return (
        <Box
            sx={{
                bgcolor: '#3854D6', // Standard blue
                py: { xs: 8, md: 12 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Decorative Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
                    backgroundSize: '40px 40px',
                    zIndex: 0
                }}
            />

            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <Typography
                    variant="h3"
                    component="h2"
                    sx={{
                        color: 'white',
                        fontWeight: 800,
                        mb: 3,
                        fontSize: { xs: '2rem', md: '2.5rem' }
                    }}
                >
                    {strings.crm_services_cta_title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1.125rem',
                        mb: 5,
                        maxWidth: '80%',
                        mx: 'auto'
                    }}
                >
                    {strings.crm_services_cta_desc}
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    href="/register"
                    onClick={() => trackCtaClick('produk/crm-services', 'impact_cta')}
                    sx={{
                        bgcolor: 'white',
                        color: '#3854D6',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }
                    }}
                >
                    {strings.crm_services_cta_btn}
                </Button>
            </Container>
        </Box>
    );
}
