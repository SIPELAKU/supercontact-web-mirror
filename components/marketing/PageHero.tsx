'use client';

import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import { trackCtaClick, trackWhatsAppClick } from '@/lib/analytics/events';

// Optional secondary CTA rendered next to the standard "Coba Gratis" button,
// styled exactly like the homepage slider's outlined secondary button.
export interface PageHeroSecondaryCta {
    label: React.ReactNode;
    href: string;
    /** true => plain <a target="_blank"> (e.g. wa.me); false/absent => next/link */
    external?: boolean;
    icon?: React.ReactNode;
    /** trackCtaClick(trackSource, trackLabel) fired on click when provided */
    trackLabel?: string;
}

interface PageHeroProps {
    /** Eyebrow badge text: "Produk" or "Solusi <Industri>" (same strings the homepage slider uses) */
    badge: React.ReactNode;
    /** The page headline — rendered as the page's single <h1> */
    title: React.ReactNode;
    /** Subcopy below the headline */
    description: React.ReactNode;
    /** The page's own *HeroVisual (shared with the homepage slider) — right on desktop, below on mobile */
    visual: React.ReactNode;
    /** Page id for trackCtaClick, e.g. 'produk/crm-sales' */
    trackSource: string;
    secondaryCta?: PageHeroSecondaryCta;
    /** Rendered inside the Container ABOVE the hero row (e.g. breadcrumbs) */
    topSlot?: React.ReactNode;
    /** Page-specific extras (stat rows, trust badges, ...) kept BELOW the standardized hero block, same section */
    children?: React.ReactNode;
}

/**
 * Standard marketing page hero for every /produk/* and /solusi/* page.
 * Reproduces the homepage HeroSlider's slide design (components/home/HeroSlider.tsx)
 * as a standalone section: same var(--brand) background, container, spacing, badge pill,
 * typography scale, and CTA styling — but the headline is the page's <h1>
 * (on the slider it is an <h2> so the homepage keeps a single h1).
 */
export default function PageHero({
    badge,
    title,
    description,
    visual,
    trackSource,
    secondaryCta,
    topSlot,
    children,
}: PageHeroProps) {
    useLanguage();

    return (
        <Box
            component="section"
            sx={{
                width: '100%',
                overflow: 'hidden',
                backgroundColor: 'var(--brand)',
                color: 'white',
                // Clearance for the fixed white Navbar (MUI Toolbar: 56px xs / 64px sm+)
                pt: { xs: '56px', sm: '64px' },
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
                {topSlot}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', lg: 'row' },
                        alignItems: 'center',
                        gap: { xs: 5, lg: 8 },
                        maxWidth: { xs: '600px', lg: '1120px' },
                        mx: 'auto',
                        pt: { xs: 8, md: 8 },
                        pb: { xs: 10, md: 10 },
                    }}
                >
                    <Box
                        sx={{
                            flex: { lg: 1 },
                            textAlign: { xs: 'center', lg: 'left' },
                        }}
                    >
                        {/* Eyebrow: "Produk" / "Solusi <Industri>" */}
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 2,
                                py: 0.5,
                                mb: 2.5,
                                borderRadius: '999px',
                                border: '1px solid rgba(255,255,255,0.35)',
                                backgroundColor: 'rgba(255,255,255,0.12)',
                            }}
                        >
                            <Typography
                                component="span"
                                sx={{
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {badge}
                            </Typography>
                        </Box>
                        {/* Page headline: the single h1 of the page */}
                        <Typography
                            variant="h1"
                            component="h1"
                            sx={{
                                fontSize: { xs: '1.75rem', md: '2.25rem', lg: '40px' },
                                fontWeight: 700,
                                lineHeight: 1.2,
                                mb: 2.5,
                            }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h6"
                            component="p"
                            sx={{
                                fontSize: { xs: '0.95rem', md: '18px' },
                                fontWeight: 400,
                                opacity: 0.9,
                                mb: 4,
                            }}
                        >
                            {description}
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 2,
                                justifyContent: { xs: 'center', lg: 'flex-start' },
                            }}
                        >
                            <Button
                                component={Link}
                                href="/register"
                                variant="contained"
                                size="large"
                                onClick={() => trackCtaClick(trackSource, 'hero_cta')}
                                sx={{
                                    backgroundColor: 'white',
                                    color: 'primary.main',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: '50px',
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                }}
                            >
                                {strings.hero_cta_free}
                            </Button>
                            {secondaryCta && (
                                <Button
                                    {...(secondaryCta.external
                                        ? {
                                              component: 'a' as const,
                                              href: secondaryCta.href,
                                              target: '_blank',
                                              rel: 'noopener noreferrer',
                                          }
                                        : { component: Link, href: secondaryCta.href })}
                                    variant="outlined"
                                    size="large"
                                    startIcon={secondaryCta.icon}
                                    onClick={
                                        secondaryCta.trackLabel
                                            ? () =>
                                                  (secondaryCta.href.includes('wa.me')
                                                      ? trackWhatsAppClick
                                                      : trackCtaClick)(trackSource, secondaryCta.trackLabel as string)
                                            : undefined
                                    }
                                    sx={{
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.7)',
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '50px',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                        },
                                    }}
                                >
                                    {secondaryCta.label}
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* The page's own hero visual (shared with the homepage slider) */}
                    <Box
                        sx={{
                            flex: { lg: '0 0 46%' },
                            width: '100%',
                            maxWidth: { xs: 480, lg: 'none' },
                            mx: { xs: 'auto', lg: 0 },
                        }}
                    >
                        {visual}
                    </Box>
                </Box>
                {children}
            </Container>
        </Box>
    );
}
