"use client";

import {
    AtSign,
    CheckCircle2,
    ExternalLink,
    Facebook,
    Instagram,
    Linkedin,
    type LucideIcon,
    Music2,
    RefreshCw,
    Twitter,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface SocialPresenceCardProps {
    profile: CompanyProfile360;
    // The refresh needs a cache row to enrich - false when a saved company's
    // cache link is severed (no cacheId to POST against).
    canRefresh: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
}

// Display names for the enricher's platform keys - shared with the parent's
// refresh-summary toast so both spell platforms the same way.
export const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    x: "X",
    tiktok: "TikTok",
    threads: "Threads",
};

interface PlatformDescriptor {
    // Matches the enricher's platform key in raw_data.social_profiles for
    // the four enriched platforms; linkedin/tiktok have no enricher (yet)
    // so their rows only ever show the link.
    key: string;
    label: string;
    icon: LucideIcon;
    url: string | null;
}

// "Social Presence" card for the Company 360 Overview tab: every stored
// social handle as an outbound link, plus follower/verified metrics where a
// Fase E enrichment has run. A row appears when the profile has the URL OR
// metrics for that platform (metrics-only covers a just-confirmed Threads
// lookup whose URL only lands on the next full profile load). The whole card
// disappears when there is nothing to show.
export default function SocialPresenceCard({
    profile,
    canRefresh,
    isRefreshing,
    onRefresh,
}: SocialPresenceCardProps) {
    const platforms: PlatformDescriptor[] = [
        { key: "instagram", label: "Instagram", icon: Instagram, url: profile.instagramUrl },
        { key: "facebook", label: "Facebook", icon: Facebook, url: profile.facebookUrl },
        { key: "linkedin", label: "LinkedIn", icon: Linkedin, url: profile.linkedinUrl },
        { key: "x", label: "X", icon: Twitter, url: profile.xUrl },
        { key: "tiktok", label: "TikTok", icon: Music2, url: profile.tiktokUrl },
        { key: "threads", label: "Threads", icon: AtSign, url: profile.threadsUrl },
    ];
    const entries = platforms.filter(
        (platform) => platform.url || profile.socialProfiles?.[platform.key]
    );

    if (entries.length === 0) return null;

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-xs font-bold uppercase text-gray-400">Social Presence</h4>
                {canRefresh && (
                    <AppButton
                        variantStyle="outline"
                        color="gray"
                        size="small"
                        startIcon={<RefreshCw size={14} />}
                        onClick={onRefresh}
                        isLoading={isRefreshing}
                    >
                        Refresh social data
                    </AppButton>
                )}
            </div>
            <div className="flex flex-col gap-3 text-sm">
                {entries.map((platform) => {
                    const Icon = platform.icon;
                    const metrics = profile.socialProfiles?.[platform.key];
                    return (
                        <div
                            key={platform.key}
                            className="flex min-w-0 flex-wrap items-center gap-2"
                        >
                            {platform.url ? (
                                <a
                                    href={platform.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    title={platform.url}
                                    className="flex min-w-0 items-center gap-1.5 text-gray-600 hover:text-[#5479EE] hover:underline"
                                >
                                    <Icon size={14} className="shrink-0 text-gray-400" />
                                    <span className="truncate font-medium">{platform.label}</span>
                                    <ExternalLink size={12} className="shrink-0 text-gray-400" />
                                </a>
                            ) : (
                                <span className="flex min-w-0 items-center gap-1.5 text-gray-600">
                                    <Icon size={14} className="shrink-0 text-gray-400" />
                                    <span className="truncate font-medium">{platform.label}</span>
                                </span>
                            )}
                            {metrics?.followers != null && (
                                <span
                                    className="shrink-0 text-gray-500"
                                    title={
                                        metrics.checked_at
                                            ? `Last checked ${new Date(metrics.checked_at).toLocaleString("id-ID")}`
                                            : undefined
                                    }
                                >
                                    {metrics.followers.toLocaleString("id-ID")} followers
                                </span>
                            )}
                            {metrics?.verified && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    <CheckCircle2 size={12} />
                                    Verified
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
