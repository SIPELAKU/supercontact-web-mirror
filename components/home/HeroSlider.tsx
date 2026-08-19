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
// Each slide reuses the destination page's own hero visual so the slide
// looks exactly like the page it links to.
import { CrmSalesHeroVisual } from '../crm-sales/CrmSalesHero';
import { CrmServicesHeroVisual } from '../crm-services/CrmServicesHero';
import { OmniHeroVisual } from '../public-omnichannel/OmniHero';
import { TicketHeroVisual } from '../ticket-public/TicketHero';
import { FinanceHeroVisual } from '../solution-finance/FinanceHero';
import { TravelHeroVisual } from '../solution-travel/TravelHero';
import { HotelHeroVisual } from '../solution-hotel/HotelHero';
import { LogisticsHeroVisual } from '../solution-logistics/LogisticsHero';
import { FmcgHeroVisual } from '../solution-fmcg/FmcgHero';
import { RetailHeroVisual } from '../solution-retail/RetailHero';
import { OutsourcingHeroVisual } from '../solution-outsourcing/OutsourcingHero';
import { ITSaaSHeroVisual } from '../solution-it-saas/ITSaaSHero';
import { SalesHeroVisual } from '../solusi/sales/SalesHero';
import { CSHeroVisual } from '../solusi/customer-service/CSHero';
import { MarketingHeroVisual } from '../solusi/marketing/MarketingHero';
import { HRHeroVisual } from '../solusi/human-resource/HRHero';
import { OpHeroVisual } from '../solusi/operasional/OpHero';
import { IntHeroVisual } from '../solusi/integrasi-sales-marketing/IntHero';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 50;

// Slides 2-19: the hero (top section) of every /produk/* and /solusi/* page.
// Copy is NOT rewritten: titleKey/descKey reference the exact strings each
// destination page renders in its own hero (lib/utils/strings.ts).
// `industryKey` (solusi slides only) builds the "Solusi <Industri>" eyebrow
// from the same label the navigation menu uses.
const featureSlides: Array<{
    key: string;
    industryKey?: string; // absent => produk slide
    titleKey: string;
    descKey: string;
    href: string;
    trackLabel: string;
    Visual: React.ComponentType;
}> = [
    // ── Produk ──────────────────────────────────────────────────────────
    {
        key: 'crm-sales',
        titleKey: 'crm_sales_hero_title',
        descKey: 'crm_sales_hero_desc',
        href: '/produk/crm-sales',
        trackLabel: 'hero_slide_crm_sales',
        Visual: CrmSalesHeroVisual,
    },
    {
        key: 'crm-services',
        titleKey: 'crm_services_title',
        descKey: 'crm_services_desc',
        href: '/produk/crm-services',
        trackLabel: 'hero_slide_crm_services',
        Visual: CrmServicesHeroVisual,
    },
    {
        key: 'omnichannel',
        titleKey: 'omni_hero_title',
        descKey: 'omni_hero_desc',
        href: '/produk/omnichannel',
        trackLabel: 'hero_slide_omnichannel',
        Visual: OmniHeroVisual,
    },
    {
        key: 'ticket',
        titleKey: 'ticket_hero_title',
        descKey: 'ticket_hero_desc',
        href: '/produk/ticket',
        trackLabel: 'hero_slide_ticket',
        Visual: TicketHeroVisual,
    },
    // ── Solusi (industri) ───────────────────────────────────────────────
    {
        key: 'keuangan',
        industryKey: 'sol_ind_finance',
        titleKey: 'fin_hero_title',
        descKey: 'fin_hero_desc',
        href: '/solusi/keuangan',
        trackLabel: 'hero_slide_keuangan',
        Visual: FinanceHeroVisual,
    },
    {
        key: 'tour-travel',
        industryKey: 'sol_ind_travel',
        titleKey: 'travel_hero_title',
        descKey: 'travel_hero_desc',
        href: '/solusi/tour-travel',
        trackLabel: 'hero_slide_tour_travel',
        Visual: TravelHeroVisual,
    },
    {
        key: 'perhotelan',
        industryKey: 'sol_ind_hotel',
        titleKey: 'hotel_hero_title',
        descKey: 'hotel_hero_desc',
        href: '/solusi/perhotelan',
        trackLabel: 'hero_slide_perhotelan',
        Visual: HotelHeroVisual,
    },
    {
        key: 'logistik',
        industryKey: 'sol_ind_logistics',
        titleKey: 'logistics_hero_title',
        descKey: 'logistics_hero_desc',
        href: '/solusi/logistik',
        trackLabel: 'hero_slide_logistik',
        Visual: LogisticsHeroVisual,
    },
    {
        key: 'fmcg',
        industryKey: 'sol_ind_fmcg',
        titleKey: 'fmcg_hero_title',
        descKey: 'fmcg_hero_desc',
        href: '/solusi/fmcg',
        trackLabel: 'hero_slide_fmcg',
        Visual: FmcgHeroVisual,
    },
    {
        key: 'ritel',
        industryKey: 'sol_ind_retail',
        titleKey: 'retail_hero_title',
        descKey: 'retail_hero_desc',
        href: '/solusi/ritel',
        trackLabel: 'hero_slide_ritel',
        Visual: RetailHeroVisual,
    },
    {
        key: 'outsourcing',
        industryKey: 'sol_ind_outsourcing',
        titleKey: 'out_hero_title',
        descKey: 'out_hero_desc',
        href: '/solusi/outsourcing',
        trackLabel: 'hero_slide_outsourcing',
        Visual: OutsourcingHeroVisual,
    },
    {
        key: 'it-saas',
        industryKey: 'sol_ind_it',
        titleKey: 'it_hero_title',
        descKey: 'it_hero_desc',
        href: '/solusi/it-saas',
        trackLabel: 'hero_slide_it_saas',
        Visual: ITSaaSHeroVisual,
    },
    // ── Solusi (peran) ──────────────────────────────────────────────────
    {
        key: 'sales',
        industryKey: 'sol_role_sales',
        titleKey: 'sol_sales_hero_title',
        descKey: 'sol_sales_hero_desc',
        href: '/solusi/sales',
        trackLabel: 'hero_slide_sales',
        Visual: SalesHeroVisual,
    },
    {
        key: 'customer-service',
        industryKey: 'sol_role_cs',
        titleKey: 'sol_cs_hero_title',
        descKey: 'sol_cs_hero_desc',
        href: '/solusi/customer-service',
        trackLabel: 'hero_slide_customer_service',
        Visual: CSHeroVisual,
    },
    {
        key: 'marketing',
        industryKey: 'sol_role_marketing',
        titleKey: 'sol_mkt_hero_title',
        descKey: 'sol_mkt_hero_desc',
        href: '/solusi/marketing',
        trackLabel: 'hero_slide_marketing',
        Visual: MarketingHeroVisual,
    },
    {
        key: 'human-resource',
        industryKey: 'sol_role_hr',
        titleKey: 'sol_hr_hero_title',
        descKey: 'sol_hr_hero_desc',
        href: '/solusi/human-resource',
        trackLabel: 'hero_slide_human_resource',
        Visual: HRHeroVisual,
    },
    {
        key: 'operasional',
        industryKey: 'sol_role_ops',
        titleKey: 'sol_op_hero_title',
        descKey: 'sol_op_hero_desc',
        href: '/solusi/operasional',
        trackLabel: 'hero_slide_operasional',
        Visual: OpHeroVisual,
    },
    {
        key: 'integrasi-sales-marketing',
        industryKey: 'sol_role_intmkt',
        titleKey: 'sol_int_hero_title',
        descKey: 'sol_int_hero_desc',
        href: '/solusi/integrasi-sales-marketing',
        trackLabel: 'hero_slide_integrasi_sales_marketing',
        Visual: IntHeroVisual,
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
            // Single shared background for ALL slides; every slide wrapper below
            // is transparent so the section reads as one uniform surface.
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
                    const badge = slide.industryKey
                        ? strings.formatString(strings.hero_slide_badge_solusi, strings[slide.industryKey])
                        : strings.hero_slide_badge_produk;
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
                                        {/* The destination page's own headline, as h2 so the page keeps exactly one h1 (slide 1's) */}
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
                                        {/* The destination page's own subcopy, clamped to 3 lines for slide height */}
                                        <Typography
                                            variant="h6"
                                            component="p"
                                            sx={{
                                                fontSize: { xs: '0.95rem', md: '18px' },
                                                fontWeight: 400,
                                                opacity: 0.9,
                                                mb: 4,
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
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

                                    {/* The destination page's own hero visual (shared component) */}
                                    <Box
                                        sx={{
                                            flex: { lg: '0 0 46%' },
                                            width: '100%',
                                            maxWidth: { xs: 480, lg: 'none' },
                                            mx: { xs: 'auto', lg: 0 },
                                        }}
                                    >
                                        <slide.Visual />
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

            {/* Mobile: 19 dots overflow a 360px viewport, so show a "n / 19" counter instead */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: 0,
                    right: 0,
                    display: { xs: 'flex', md: 'none' },
                    justifyContent: 'center',
                    zIndex: 5,
                    pointerEvents: 'none',
                }}
            >
                <Typography
                    component="span"
                    sx={{
                        px: 1.5,
                        py: 0.25,
                        borderRadius: '999px',
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {active + 1} / {SLIDE_COUNT}
                </Typography>
            </Box>

            {/* Desktop: compact dot indicators (one per slide) */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 20,
                    left: 0,
                    right: 0,
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'center',
                    gap: 0.75,
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
                            width: active === i ? 18 : 8,
                            height: 8,
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
