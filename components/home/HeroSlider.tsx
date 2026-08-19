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
import {
    Client360Illustration,
    DataIntelligenceIllustration,
    EmailMarketingIllustration,
    IllustrationProps,
    OmnichannelIllustration,
    PipelineIllustration,
    SmartCaptureIllustration,
    TicketingIllustration,
    WhatsAppCampaignIllustration,
} from './slider-illustrations';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

// Feature slides 2-9. Copy claims stay within what the produk pages promise;
// features without a dedicated page link to the closest produk page or /price.
const featureSlides: Array<{
    key: string;
    badgeKey: string;
    titleKey: string;
    descKey: string;
    href: string;
    trackLabel: string;
    Illustration: React.ComponentType<IllustrationProps>;
}> = [
    {
        key: 'pipeline',
        badgeKey: 'hero_slide_pipeline_badge',
        titleKey: 'hero_slide_pipeline_title',
        descKey: 'hero_slide_pipeline_desc',
        href: '/produk/crm-sales',
        trackLabel: 'hero_slide_pipeline',
        Illustration: PipelineIllustration,
    },
    {
        key: 'smartcapture',
        badgeKey: 'hero_slide_capture_badge',
        titleKey: 'hero_slide_capture_title',
        descKey: 'hero_slide_capture_desc',
        href: '/produk/crm-sales',
        trackLabel: 'hero_slide_smartcapture',
        Illustration: SmartCaptureIllustration,
    },
    {
        key: 'client360',
        badgeKey: 'hero_slide_client360_badge',
        titleKey: 'hero_slide_client360_title',
        descKey: 'hero_slide_client360_desc',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_client360',
        Illustration: Client360Illustration,
    },
    {
        key: 'wa-campaign',
        badgeKey: 'hero_slide_wa_badge',
        titleKey: 'hero_slide_wa_title',
        descKey: 'hero_slide_wa_desc',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_wa_campaign',
        Illustration: WhatsAppCampaignIllustration,
    },
    {
        key: 'email-marketing',
        badgeKey: 'hero_slide_email_badge',
        titleKey: 'hero_slide_email_title',
        descKey: 'hero_slide_email_desc',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_email_marketing',
        Illustration: EmailMarketingIllustration,
    },
    {
        key: 'omnichannel',
        badgeKey: 'hero_slide_omni_badge',
        titleKey: 'hero_slide_omni_title',
        descKey: 'hero_slide_omni_desc',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_omnichannel',
        Illustration: OmnichannelIllustration,
    },
    {
        key: 'data-intelligence',
        badgeKey: 'hero_slide_dataintel_badge',
        titleKey: 'hero_slide_dataintel_title',
        descKey: 'hero_slide_dataintel_desc',
        href: '/price',
        trackLabel: 'hero_slide_data_intelligence',
        Illustration: DataIntelligenceIllustration,
    },
    {
        key: 'ticketing',
        badgeKey: 'hero_slide_ticketing_badge',
        titleKey: 'hero_slide_ticketing_title',
        descKey: 'hero_slide_ticketing_desc',
        href: '/produk/crm-services',
        trackLabel: 'hero_slide_ticketing',
        Illustration: TicketingIllustration,
    },
];

const SLIDE_COUNT = featureSlides.length + 1;

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

                {featureSlides.map((slide, i) => {
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
                            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', lg: 'row' },
                                        alignItems: 'center',
                                        gap: { xs: 3, lg: 8 },
                                        maxWidth: { xs: '600px', lg: '1120px' },
                                        mx: 'auto',
                                        pt: { xs: 8, md: 8 },
                                        pb: { xs: 10, md: 10 },
                                    }}
                                >
                                    {/* Illustration: above the text on mobile, right column on desktop */}
                                    <Box
                                        sx={{
                                            order: { xs: 1, lg: 2 },
                                            flex: { lg: '0 0 44%' },
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            '& .hero-slide-illustration': {
                                                display: 'block',
                                                width: { xs: 240, sm: 300, lg: '100%' },
                                                maxWidth: 460,
                                                height: 'auto',
                                            },
                                        }}
                                    >
                                        <slide.Illustration className="hero-slide-illustration" />
                                    </Box>

                                    <Box
                                        sx={{
                                            order: { xs: 2, lg: 1 },
                                            flex: { lg: 1 },
                                            textAlign: { xs: 'center', lg: 'left' },
                                        }}
                                    >
                                        {/* Feature-name eyebrow (mirrors the produk pages' hero badges) */}
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
                                                {strings[slide.badgeKey]}
                                            </Typography>
                                        </Box>
                                        {/* h2 so the page keeps exactly one h1 (slide 1's) */}
                                        <Typography
                                            variant="h1"
                                            component="h2"
                                            sx={{
                                                fontSize: { xs: '1.75rem', md: '2.25rem', lg: '40px' },
                                                fontWeight: 700,
                                                lineHeight: 1.2,
                                                mb: 2.5,
                                            }}
                                        >
                                            {strings[slide.titleKey]}
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
                                            {strings[slide.descKey]}
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
                                                {strings.hero_slide_learn_more}
                                            </Button>
                                        </Box>
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

            {/* Dot indicators (compact on mobile so all 9 stay tidy) */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: { xs: 12, md: 20 },
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: { xs: 0.75, md: 1.25 },
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
                            width: active === i ? { xs: 18, md: 24 } : { xs: 8, md: 10 },
                            height: { xs: 8, md: 10 },
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
