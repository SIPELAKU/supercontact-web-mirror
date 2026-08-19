'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Container, IconButton, Typography } from '@mui/material';
import Link from 'next/link';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import { trackCtaClick } from '@/lib/analytics/events';
import Hero from './Hero';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

// Slides 2-4 reuse the real produk-page hero copy (same strings keys) so the
// slider stays truthful to what each product page actually promises.
const productSlides = [
    {
        key: 'crm-sales',
        titleKey: 'crm_sales_hero_title',
        descKey: 'crm_sales_hero_desc',
        btnKey: 'hero_slide_crm_btn',
        href: '/produk/crm-sales',
        trackLabel: 'hero_slide_crm_sales',
    },
    {
        key: 'omnichannel',
        titleKey: 'omni_hero_title',
        descKey: 'omni_hero_desc',
        btnKey: 'hero_slide_omni_btn',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_omnichannel',
    },
    {
        key: 'ticket',
        titleKey: 'ticket_hero_title',
        descKey: 'ticket_hero_desc',
        btnKey: 'hero_slide_ticket_btn',
        href: '/produk/ticket',
        trackLabel: 'hero_slide_ticket',
    },
];

const SLIDE_COUNT = productSlides.length + 1;

const HeroSlider = () => {
    useLanguage();

    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const touchStartX = useRef<number | null>(null);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    // Autoplay: paused on hover/touch, disabled entirely for reduced motion.
    useEffect(() => {
        if (paused || reducedMotion) return;
        const timer = setInterval(() => {
            setActive((prev) => (prev + 1) % SLIDE_COUNT);
        }, AUTOPLAY_MS);
        return () => clearInterval(timer);
    }, [paused, reducedMotion]);

    const goTo = (index: number) => {
        setActive(((index % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setPaused(true);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current !== null) {
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
                goTo(delta < 0 ? active + 1 : active - 1);
            }
        }
        touchStartX.current = null;
        setPaused(false);
    };

    return (
        <Box
            component="section"
            role="region"
            aria-roledescription="carousel"
            aria-label={strings.hero_slider_label}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{ position: 'relative', width: '100%', overflow: 'hidden', backgroundColor: '#5479EE' }}
        >
            {/* Track: every slide stays in the DOM (crawlable); movement is a CSS transform. */}
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    transform: `translateX(-${active * 100}%)`,
                    transition: reducedMotion ? 'none' : 'transform 550ms ease-in-out',
                }}
            >
                {/* Slide 1: existing main hero (keeps the page's single h1) */}
                <Box
                    role="group"
                    aria-roledescription="slide"
                    aria-label={strings.formatString(strings.hero_slider_slide_of, 1, SLIDE_COUNT)}
                    sx={{ flex: '0 0 100%', minWidth: '100%' }}
                    {...(active !== 0 ? ({ inert: '' } as Record<string, unknown>) : {})}
                >
                    <Hero />
                </Box>

                {productSlides.map((slide, i) => {
                    const index = i + 1;
                    return (
                        <Box
                            key={slide.key}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={strings.formatString(strings.hero_slider_slide_of, index + 1, SLIDE_COUNT)}
                            sx={{
                                flex: '0 0 100%',
                                minWidth: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: '#5479EE',
                                color: 'white',
                            }}
                            {...(active !== index ? ({ inert: '' } as Record<string, unknown>) : {})}
                        >
                            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 0 } }}>
                                <Box
                                    sx={{
                                        maxWidth: { xs: '100%', md: '760px' },
                                        mx: 'auto',
                                        textAlign: 'center',
                                        py: { xs: 12, md: 10 },
                                        px: { xs: 1, md: 0 },
                                    }}
                                >
                                    {/* h2 so the page keeps exactly one h1 (slide 1's) */}
                                    <Typography
                                        variant="h1"
                                        component="h2"
                                        sx={{
                                            fontSize: { xs: '2.25rem', md: '40px' },
                                            fontWeight: 700,
                                            lineHeight: 1.2,
                                            mb: 3,
                                        }}
                                    >
                                        {strings[slide.titleKey]}
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        component="p"
                                        sx={{
                                            fontSize: { xs: '1rem', md: '20px' },
                                            fontWeight: 400,
                                            opacity: 0.9,
                                            mb: 5,
                                        }}
                                    >
                                        {strings[slide.descKey]}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                                        <Button
                                            component={Link}
                                            href="/register"
                                            variant="contained"
                                            size="large"
                                            onClick={() => trackCtaClick('home', `${slide.trackLabel}_register`)}
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
                                        <Button
                                            component={Link}
                                            href={slide.href}
                                            variant="outlined"
                                            size="large"
                                            onClick={() => trackCtaClick('home', `${slide.trackLabel}_learn_more`)}
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
                                            {strings[slide.btnKey]}
                                        </Button>
                                    </Box>
                                </Box>
                            </Container>
                        </Box>
                    );
                })}
            </Box>

            {/* Prev / next arrows */}
            <IconButton
                aria-label={strings.hero_slider_prev}
                onClick={() => goTo(active - 1)}
                sx={{
                    position: 'absolute',
                    left: { xs: 4, md: 16 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
            >
                <ChevronLeftIcon />
            </IconButton>
            <IconButton
                aria-label={strings.hero_slider_next}
                onClick={() => goTo(active + 1)}
                sx={{
                    position: 'absolute',
                    right: { xs: 4, md: 16 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
            >
                <ChevronRightIcon />
            </IconButton>

            {/* Dot indicators */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: 12, md: 20 },
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 1.25,
                    zIndex: 5,
                }}
            >
                {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
                    <Box
                        key={i}
                        component="button"
                        type="button"
                        aria-label={strings.formatString(strings.hero_slider_goto, i + 1)}
                        aria-current={active === i ? 'true' : undefined}
                        onClick={() => goTo(i)}
                        sx={{
                            width: active === i ? 24 : 10,
                            height: 10,
                            borderRadius: '999px',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            backgroundColor: active === i ? 'white' : 'rgba(255,255,255,0.45)',
                            transition: reducedMotion ? 'none' : 'all 250ms ease',
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default HeroSlider;
