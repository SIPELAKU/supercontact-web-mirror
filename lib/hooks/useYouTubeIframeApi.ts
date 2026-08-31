'use client';

import { useEffect, useState } from 'react';

// Minimal ambient typings for the slice of the YouTube IFrame API we use,
// instead of pulling in the full @types/youtube package.
export interface YTPlayer {
    loadVideoById: (videoId: string) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    mute: () => void;
    unMute: () => void;
    isMuted: () => boolean;
    destroy: () => void;
}

export interface YTPlayerEvent {
    target: YTPlayer;
}

export interface YTPlayerStateChangeEvent {
    data: number;
    target: YTPlayer;
}

export interface YTNamespace {
    Player: new (
        element: HTMLElement,
        options: {
            videoId?: string;
            width?: string | number;
            height?: string | number;
            playerVars?: Record<string, string | number>;
            events?: {
                onReady?: (event: YTPlayerEvent) => void;
                onStateChange?: (event: YTPlayerStateChangeEvent) => void;
                onError?: (event: { data: number }) => void;
            };
        }
    ) => YTPlayer;
    PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
    };
}

declare global {
    interface Window {
        YT?: YTNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

const SCRIPT_ID = 'yt-iframe-api';

/**
 * Lazily injects https://www.youtube.com/iframe_api once `shouldLoad` turns
 * true (so the ~500KB player JS never loads for visitors who don't scroll to
 * a video section) and returns whether `window.YT.Player` is ready to use.
 */
export function useYouTubeIframeApi(shouldLoad: boolean): boolean {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!shouldLoad) return;
        if (window.YT?.Player) {
            setReady(true);
            return;
        }

        // Chain any handler another consumer registered instead of clobbering it.
        let cancelled = false;
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prev?.();
            if (!cancelled) setReady(true);
        };

        if (!document.getElementById(SCRIPT_ID)) {
            const script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);
        }

        return () => {
            cancelled = true;
        };
    }, [shouldLoad]);

    return ready;
}
