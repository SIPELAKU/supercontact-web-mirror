"use client";

import { Play, Pause, Volume2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface VoiceMessageBubbleProps {
    src: string;
    isMe: boolean;
}

export default function VoiceMessageBubble({ src, isMe }: VoiceMessageBubbleProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;

            const setAudioData = () => {
                setDuration(audio.duration);
            };

            const setAudioTime = () => {
                setCurrentTime(audio.currentTime);
            };

            const handleEnded = () => {
                setIsPlaying(false);
                setCurrentTime(0);
            };

            // Events
            audio.addEventListener("loadedmetadata", setAudioData);
            audio.addEventListener("timeupdate", setAudioTime);
            audio.addEventListener("ended", handleEnded);

            // Cleanup
            return () => {
                audio.removeEventListener("loadedmetadata", setAudioData);
                audio.removeEventListener("timeupdate", setAudioTime);
                audio.removeEventListener("ended", handleEnded);
            };
        }
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    // Simulate waveform bars (could be real if using Web Audio API, but CSS animation is often enough for UI mockups)
    const bars = Array.from({ length: 15 }, (_, i) => i);

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-[18px] shadow-sm min-w-[280px] select-none ${isMe
                ? "bg-indigo-600 text-white rounded-br-none"
                : "bg-white text-gray-700 rounded-bl-none border border-gray-100"
            }`}>
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause Button */}
            <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${isMe ? "bg-white text-indigo-600" : "bg-indigo-600 text-white"
                    }`}
            >
                {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
            </button>

            {/* Waveform Visualization */}
            <div className="flex items-center gap-[3px] h-8 flex-1">
                {bars.map((i) => {
                    // Create pseudo-random heights that animate when playing
                    const height = Math.max(20, Math.random() * 100);
                    // For static "design match", we can use fixed pattern or simplied random
                    // Let's us a static pattern that looks like a voice message
                    const staticHeights = [40, 60, 45, 80, 50, 90, 30, 70, 45, 60, 80, 55, 40, 60, 35];
                    const h = staticHeights[i] || 40;

                    return (
                        <div
                            key={i}
                            className={`w-[3px] rounded-full transition-all duration-300 ${isMe ? "bg-indigo-300" : "bg-gray-300"
                                } ${isPlaying ? "animate-pulse" : ""}`}
                            style={{
                                height: `${h}%`,
                                opacity: currentTime / duration > (i / bars.length) ? 1 : 0.6 // pseudo-progress
                            }}
                        />
                    );
                })}
            </div>

            {/* Timer & Speaker */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10 ml-1">
                <span className="text-xs font-medium tabular-nums opacity-90">
                    {formatTime(duration ? (isPlaying ? currentTime : duration) : 0)}
                </span>
                <Volume2 className={`w-4 h-4 opacity-80 ${isPlaying ? "animate-pulse" : ""}`} />
            </div>
        </div>
    );
}
