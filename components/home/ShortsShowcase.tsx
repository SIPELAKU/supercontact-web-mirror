'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Container, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { strings } from '@/lib/utils/strings';
import { useLanguage } from '@/lib/context/LanguageContext';
import { BRAND_PRIMARY } from '@/lib/theme';
import {
    useYouTubeIframeApi,
    YTPlayer,
    YTPlayerStateChangeEvent,
} from '@/lib/hooks/useYouTubeIframeApi';

const VIDEO_IDS = [
    'D57Jqgm58HQ',
    'OK9cftg4fxg',
    'EnRD6Ii4IPg',
    'GBgyVgZ4qIE',
    'GMso1DnG6LA',
    'uTHpITB3fvY',
    'EFY2KBh2Bjo',
    'eO6jzPR4O1g',
    'LmtAFSqfS70',
    'BO86YHC7AVs',
];
const N = VIDEO_IDS.length;
// While the visitor hasn't engaged, cap each slide at 30s even if the video
// runs longer; once they unmute/navigate we only advance on ENDED, with a
// long stop-gap in case ENDED never fires (e.g. an ad or a stalled embed).
const IDLE_MAX_SLIDE_MS = 30_000;
const ENGAGED_MAX_SLIDE_MS = 90_000;
const SWIPE_THRESHOLD_PX = 50;
// The stationary center frame is enlarged relative to --frame-w; side frames
// shrink so the active video clearly dominates the row.
const CENTER_SCALE = 1.12;
const SIDE_SCALE = 0.8;

// oardefault.jpg is the portrait Shorts thumbnail but isn't guaranteed for
// every video; onError falls back once to the always-present hqdefault.jpg.
function Thumb({ id, index }: { id: string; index: number }) {
    const triedFallback = useRef(false);
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://i.ytimg.com/vi/${id}/oardefault.jpg`}
            alt={strings.formatString(strings.shorts_showcase_thumb_alt, index + 1) as string}
            loading="lazy"
            onError={(e) => {
                if (!triedFallback.current) {
                    triedFallback.current = true;
                    e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                }
            }}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            }}
        />
    );
}

function PhoneFrame({
    elevated = false,
    children,
}: {
    elevated?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                aspectRatio: '9 / 16',
                borderRadius: '36px',
                border: '6px solid #111',
                backgroundColor: '#000',
                overflow: 'hidden',
                boxShadow: elevated
                    ? `0 24px 60px ${BRAND_PRIMARY}59` // 59 hex ≈ 35% alpha
                    : '0 12px 30px rgba(0,0,0,0.18)',
            }}
        >
            {children}
            {/* Dynamic-island pill */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '38%',
                    height: 20,
                    borderRadius: '999px',
                    backgroundColor: '#111',
                    zIndex: 3,
                }}
            />
        </Box>
    );
}

const ShortsShowcase = () => {
    useLanguage();

    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isNearViewport, setIsNearViewport] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [playerFaded, setPlayerFaded] = useState(true);

    const sectionRef = useRef<HTMLElement | null>(null);
    const hostContainerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const touchStartX = useRef<number | null>(null);
    // The YT.Player callbacks are wired once at creation, so mutable state
    // they read must live in refs (classic stale-closure guard).
    const activeIndexRef = useRef(0);
    const isMutedRef = useRef(true);
    const hasInteractedRef = useRef(false);
    const lastLoadedIndexRef = useRef<number | null>(null);

    const apiReady = useYouTubeIframeApi(isNearViewport);

    useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const armTimer = useCallback(() => {
        clearTimer();
        const ms = hasInteractedRef.current ? ENGAGED_MAX_SLIDE_MS : IDLE_MAX_SLIDE_MS;
        timerRef.current = setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % N);
        }, ms);
    }, [clearTimer]);

    const goTo = useCallback((index: number) => {
        setActiveIndex(((index % N) + N) % N);
    }, []);

    const goToUser = useCallback(
        (index: number) => {
            hasInteractedRef.current = true;
            goTo(index);
        },
        [goTo]
    );

    // Load the API only when the section approaches the viewport (one-shot).
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        if (typeof IntersectionObserver === 'undefined') {
            setIsNearViewport(true);
            setIsVisible(true);
            return;
        }
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsNearViewport(true);
                    obs.disconnect();
                }
            },
            { rootMargin: '300px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Track real visibility to pause playback offscreen.
    useEffect(() => {
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver === 'undefined') return;
        const obs = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.25 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Create the single persistent player (stationary center frame). The API
    // replaces the element it's handed, so mount it on a throwaway holder div
    // — that keeps strict-mode remounts clean after destroy().
    useEffect(() => {
        if (!apiReady || playerRef.current || !hostContainerRef.current) return;
        const YTns = window.YT;
        if (!YTns) return;

        const holder = document.createElement('div');
        holder.style.width = '100%';
        holder.style.height = '100%';
        hostContainerRef.current.appendChild(holder);

        lastLoadedIndexRef.current = activeIndexRef.current;
        const player = new YTns.Player(holder, {
            width: '100%',
            height: '100%',
            videoId: VIDEO_IDS[activeIndexRef.current],
            playerVars: {
                autoplay: 1,
                mute: 1,
                playsinline: 1,
                controls: 0,
                rel: 0,
                modestbranding: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: () => setIsPlayerReady(true),
                onStateChange: (e: YTPlayerStateChangeEvent) => {
                    if (e.data === YTns.PlayerState.PLAYING) {
                        setPlayerFaded(false);
                        // iOS Safari can silently re-mute after loadVideoById;
                        // enforce the user's choice, and if it sticks muted,
                        // surface the unmute overlay again rather than lie.
                        if (!isMutedRef.current) {
                            e.target.unMute();
                            if (e.target.isMuted()) {
                                isMutedRef.current = true;
                                setIsMuted(true);
                            }
                        }
                        armTimer();
                    } else if (e.data === YTns.PlayerState.ENDED) {
                        setActiveIndex((prev) => (prev + 1) % N);
                    }
                },
                // Deleted / embed-disabled video: skip it so the loop never stalls.
                onError: () => {
                    clearTimer();
                    timerRef.current = setTimeout(() => {
                        setActiveIndex((prev) => (prev + 1) % N);
                    }, 1000);
                },
            },
        });
        playerRef.current = player;

        return () => {
            clearTimer();
            try {
                player.destroy();
            } catch {
                // player may already be gone
            }
            holder.remove();
            playerRef.current = null;
            lastLoadedIndexRef.current = null;
            setIsPlayerReady(false);
            setPlayerFaded(true);
        };
    }, [apiReady, armTimer, clearTimer]);

    // Slide change → swap the stationary player's video (no iframe churn).
    useEffect(() => {
        activeIndexRef.current = activeIndex;
        const player = playerRef.current;
        if (!isPlayerReady || !player) return;
        if (lastLoadedIndexRef.current === activeIndex) return;
        lastLoadedIndexRef.current = activeIndex;
        clearTimer();
        setPlayerFaded(true);
        player.loadVideoById(VIDEO_IDS[activeIndex]);
        if (isMutedRef.current) player.mute();
        else player.unMute();
    }, [activeIndex, isPlayerReady, clearTimer]);

    // Pause when the section scrolls away or the tab is hidden; resume on return.
    useEffect(() => {
        const player = playerRef.current;
        if (!isPlayerReady || !player) return;
        const apply = () => {
            const hidden = document.visibilityState === 'hidden';
            try {
                if (hidden || !isVisible) {
                    clearTimer();
                    player.pauseVideo();
                } else {
                    player.playVideo(); // timer re-arms on the PLAYING event
                }
            } catch {
                // player not ready for commands yet
            }
        };
        apply();
        document.addEventListener('visibilitychange', apply);
        return () => document.removeEventListener('visibilitychange', apply);
    }, [isVisible, isPlayerReady, clearTimer]);

    const handleAudioToggle = () => {
        hasInteractedRef.current = true;
        const player = playerRef.current;
        if (!player || !isPlayerReady) return;
        if (isMuted) {
            player.unMute();
            player.playVideo();
            isMutedRef.current = false;
            setIsMuted(false);
        } else {
            player.mute();
            isMutedRef.current = true;
            setIsMuted(true);
        }
        armTimer();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current !== null) {
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
                goToUser(delta < 0 ? activeIndex + 1 : activeIndex - 1);
            }
        }
        touchStartX.current = null;
    };

    return (
        <Box
            component="section"
            ref={sectionRef}
            role="region"
            aria-roledescription="carousel"
            aria-label={strings.shorts_showcase_label}
            sx={{ py: { xs: 6, md: 10 }, overflow: 'hidden' }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
                <Box sx={{ maxWidth: { xs: '600px', lg: '1120px' }, mx: 'auto', textAlign: 'center' }}>
                    <Typography
                        variant="h2"
                        component="h2"
                        sx={{
                            fontSize: { xs: '1.75rem', md: '2.25rem', lg: '40px' },
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: 'text.primary',
                            mb: 2,
                        }}
                    >
                        {strings.shorts_showcase_title}
                    </Typography>
                    <Typography
                        component="p"
                        sx={{
                            fontSize: { xs: '0.95rem', md: '18px' },
                            color: 'text.secondary',
                            maxWidth: '640px',
                            mx: 'auto',
                        }}
                    >
                        {strings.shorts_showcase_subtitle}
                    </Typography>
                </Box>
            </Container>

            {/* Stage: full-bleed so side frames can peek beyond the 600px column on mobile */}
            <Box
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    mt: { xs: 4, md: 6 },
                    '--frame-w': { xs: 'min(60vw, 230px)', md: '250px', lg: '270px' },
                    // step > frame width on md+ → 3 fully separated frames;
                    // step < frame width on xs → center frame + peeking neighbors.
                    '--step': {
                        xs: 'calc(var(--frame-w) * 0.82)',
                        md: 'calc(var(--frame-w) + 40px)',
                    },
                    height: `calc(var(--frame-w) * 16 / 9 * ${CENTER_SCALE} + 48px)`,
                }}
            >
                {/* Sliding thumbnail track. Signed modular offset: the only slide
                    that "teleports" on wrap is offscreen before and after, with
                    transition disabled, so the loop never visually jumps. */}
                {VIDEO_IDS.map((id, i) => {
                    let rel = (((i - activeIndex) % N) + N) % N;
                    if (rel > N / 2) rel -= N;
                    const abs = Math.abs(rel);
                    const isCenter = rel === 0;
                    return (
                        <Box
                            key={id}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={strings.formatString(strings.shorts_showcase_slide_of, i + 1, N)}
                            {...(abs >= 2
                                ? ({ 'aria-hidden': true, inert: '' } as Record<string, unknown>)
                                : {})}
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                width: 'var(--frame-w)',
                                transform: `translate(-50%, -50%) translateX(calc(${rel} * var(--step))) scale(${isCenter ? CENTER_SCALE : SIDE_SCALE})`,
                                transition:
                                    abs <= 2 && !reducedMotion
                                        ? 'transform 550ms ease-in-out, opacity 550ms ease-in-out'
                                        : 'none',
                                // The center position is covered by the stationary
                                // player frame below, so only neighbors are shown.
                                opacity: abs === 1 ? 1 : 0,
                                filter: 'brightness(0.72)',
                                zIndex: 1,
                                pointerEvents: abs === 1 ? 'auto' : 'none',
                            }}
                        >
                            <PhoneFrame>
                                <Thumb id={id} index={i} />
                                {abs === 1 && (
                                    <Box
                                        component="button"
                                        type="button"
                                        aria-label={strings.formatString(strings.shorts_showcase_play_video, i + 1)}
                                        onClick={() => goToUser(i)}
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            zIndex: 4,
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0,
                                        }}
                                    />
                                )}
                            </PhoneFrame>
                        </Box>
                    );
                })}

                {/* Stationary center frame hosting the single persistent player.
                    Before JS/player load it just shows the poster, so SSR output
                    still renders a complete-looking section. */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) scale(${CENTER_SCALE})`,
                        width: 'var(--frame-w)',
                        zIndex: 2,
                    }}
                >
                    <PhoneFrame elevated>
                        <Thumb key={activeIndex} id={VIDEO_IDS[activeIndex]} index={activeIndex} />
                        <Box
                            ref={hostContainerRef}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 2,
                                opacity: playerFaded ? 0 : 1,
                                transition: reducedMotion ? 'none' : 'opacity 300ms ease',
                                '& iframe': {
                                    width: '100%',
                                    height: '100%',
                                    border: 0,
                                    display: 'block',
                                },
                            }}
                        />
                        {/* With controls:0 a click on the iframe would silently
                            toggle play/pause; this catcher implements the audio
                            UX instead (autoplay must start muted — browsers
                            block unmuted autoplay without a gesture). */}
                        <Box
                            component="button"
                            type="button"
                            onClick={handleAudioToggle}
                            aria-label={
                                isMuted ? strings.shorts_showcase_unmute : strings.shorts_showcase_mute
                            }
                            aria-pressed={!isMuted}
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 4,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: isMuted ? 'center' : 'flex-end',
                                p: 1.5,
                            }}
                        >
                            {isPlayerReady &&
                                (isMuted ? (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 0.75,
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '999px',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        <VolumeOffIcon sx={{ fontSize: 16 }} />
                                        {strings.shorts_showcase_unmute}
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: 30,
                                            height: 30,
                                            borderRadius: '50%',
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                        }}
                                    >
                                        <VolumeUpIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                ))}
                        </Box>
                    </PhoneFrame>
                </Box>

                {/* Prev / next arrows (desktop) */}
                <IconButton
                    aria-label={strings.shorts_showcase_prev}
                    onClick={() => goToUser(activeIndex - 1)}
                    sx={{
                        position: 'absolute',
                        left: { md: 24, lg: 48 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 3,
                        display: { xs: 'none', md: 'inline-flex' },
                        color: 'text.primary',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.14)' },
                    }}
                >
                    <ChevronLeftIcon />
                </IconButton>
                <IconButton
                    aria-label={strings.shorts_showcase_next}
                    onClick={() => goToUser(activeIndex + 1)}
                    sx={{
                        position: 'absolute',
                        right: { md: 24, lg: 48 },
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 3,
                        display: { xs: 'none', md: 'inline-flex' },
                        color: 'text.primary',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.14)' },
                    }}
                >
                    <ChevronRightIcon />
                </IconButton>

                {/* Mobile: "n / N" counter (dots would be cramped at 360px) */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: { xs: 'flex', md: 'none' },
                        justifyContent: 'center',
                        zIndex: 3,
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
                        {activeIndex + 1} / {N}
                    </Typography>
                </Box>
            </Box>

            {/* Desktop: dot indicators */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'center',
                    gap: 0.75,
                    mt: 3,
                }}
            >
                {VIDEO_IDS.map((id, i) => (
                    <Box
                        key={id}
                        component="button"
                        type="button"
                        aria-label={strings.formatString(strings.shorts_showcase_goto, i + 1)}
                        aria-current={activeIndex === i ? 'true' : undefined}
                        onClick={() => goToUser(i)}
                        sx={{
                            width: activeIndex === i ? 18 : 8,
                            height: 8,
                            borderRadius: '999px',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            backgroundColor: activeIndex === i ? BRAND_PRIMARY : 'rgba(0,0,0,0.2)',
                            transition: reducedMotion ? 'none' : 'all 250ms ease',
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default ShortsShowcase;
