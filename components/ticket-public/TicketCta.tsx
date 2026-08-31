"use client";

import { Box, Container, Typography, Button } from "@mui/material";
import { useLanguage } from "@/lib/context/LanguageContext";
import { strings } from "@/lib/utils/strings";
import Link from 'next/link';
import { trackCtaClick } from '@/lib/analytics/events';

export default function TicketCta() {
    useLanguage();

    return (
        <Box
            sx={{
                bgcolor: 'var(--brand-deep)', // Standard blue
                py: { xs: 8, md: 12 },
                position: 'relative',
                overflow: 'hidden'
            }}
        >
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
                    {strings.ticket_cta_title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '1.125rem',
                        mb: 5,
                        maxWidth: '90%',
                        mx: 'auto',
                        lineHeight: 1.6
                    }}
                >
                    {strings.ticket_cta_desc}
                </Typography>

                <Button
                    variant="contained"
                    component={Link}
                    href="/register"
                    onClick={() => trackCtaClick('produk/ticket', 'impact_cta')}
                    sx={{
                        bgcolor: 'white',
                        color: 'var(--brand-deep)',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                        }
                    }}
                >
                    {strings.ticket_cta_btn}
                </Button>
            </Container>
        </Box>
    );
}
