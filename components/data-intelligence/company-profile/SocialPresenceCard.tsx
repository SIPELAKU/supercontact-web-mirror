"use client";

import { useEffect, useRef, useState } from "react";
import {
    AtSign,
    CheckCircle2,
    ClipboardPaste,
    ExternalLink,
    Facebook,
    Instagram,
    Linkedin,
    type LucideIcon,
    Music2,
    Pencil,
    RefreshCw,
    Search,
    Trash2,
    Twitter,
    X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { CompanyProfile360, SocialLinksValues } from "@/lib/types/company-intelligence";
import {
    buildCompanySearchTarget,
    classifyPastedUrl,
    PLATFORM_TO_FIELD,
    SocialLinkField,
} from "@/lib/data/social-search-links";
import { updateSocialLinks } from "@/lib/api/company-intelligence";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface SocialPresenceCardProps {
    profile: CompanyProfile360;
    // The refresh needs a cache row to enrich - false when a saved company's
    // cache link is severed (no cacheId to POST against).
    canRefresh: boolean;
    isRefreshing: boolean;
    onRefresh: () => void;
    // Search Assist needs the same cache row to PATCH links onto - null hides
    // every search/paste/edit affordance and restores the read-only card.
    cacheId: string | null;
    // Fired with the full canonical link set after every successful PATCH so
    // the parent can sync its profile state (single source of truth).
    onLinksSaved: (values: SocialLinksValues) => void;
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

const FIELD_LABELS: Record<SocialLinkField, string> = {
    instagram_url: "Instagram",
    facebook_url: "Facebook",
    linkedin_url: "LinkedIn",
    tiktok_url: "TikTok",
    x_url: "X",
    threads_url: "Threads",
};

interface PlatformDescriptor {
    // Matches the enricher's platform key in raw_data.social_profiles for
    // the enriched platforms; also keys PLATFORM_TO_FIELD for Search Assist.
    key: string;
    label: string;
    icon: LucideIcon;
    url: string | null;
}

/**
 * "Social Presence" card for the Company 360 Overview tab.
 *
 * Read side: every stored social handle as an outbound link, plus
 * follower/verified metrics where a Fase E enrichment has run.
 *
 * Search Assist (needs cacheId): rows without a stored link get a "Search"
 * button that opens the platform's own search - prefilled with the company
 * name + kabupaten - in a popup the user drives with their own logged-in
 * account (the wa.me pattern: no API, no bot). Closing the popup is detected
 * by polling `popup.closed` (all a cross-origin window exposes) and marks the
 * row as awaiting a paste; the profile URL the user found is pasted back -
 * manually or via the clipboard button - and PATCHed to the API, which
 * canonicalizes it. A paste that clearly belongs to a different platform is
 * auto-routed to that platform's empty row instead of being rejected.
 *
 * With a cacheId the card always renders all six platforms (an empty row IS
 * the affordance); without one it falls back to showing only rows that have
 * a URL or metrics, and disappears when there is nothing to show.
 */
export default function SocialPresenceCard({
    profile,
    canRefresh,
    isRefreshing,
    onRefresh,
    cacheId,
    onLinksSaved,
}: SocialPresenceCardProps) {
    const { getToken } = useAuth();
    const [editingField, setEditingField] = useState<SocialLinkField | null>(null);
    const [draft, setDraft] = useState("");
    const [savingField, setSavingField] = useState<SocialLinkField | null>(null);
    // Set when the search popup for this field has been closed - the visual
    // "search done, paste your find" marker the popup flow leaves behind.
    const [awaitingPasteField, setAwaitingPasteField] = useState<SocialLinkField | null>(null);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    const platforms: PlatformDescriptor[] = [
        { key: "instagram", label: "Instagram", icon: Instagram, url: profile.instagramUrl },
        { key: "facebook", label: "Facebook", icon: Facebook, url: profile.facebookUrl },
        { key: "linkedin", label: "LinkedIn", icon: Linkedin, url: profile.linkedinUrl },
        { key: "x", label: "X", icon: Twitter, url: profile.xUrl },
        { key: "tiktok", label: "TikTok", icon: Music2, url: profile.tiktokUrl },
        { key: "threads", label: "Threads", icon: AtSign, url: profile.threadsUrl },
    ];
    const urlByField = Object.fromEntries(
        platforms.map((platform) => [PLATFORM_TO_FIELD[platform.key], platform.url])
    ) as Record<SocialLinkField, string | null>;
    const entries = cacheId
        ? platforms
        : platforms.filter((platform) => platform.url || profile.socialProfiles?.[platform.key]);

    if (entries.length === 0) return null;

    const startEdit = (field: SocialLinkField) => {
        setEditingField(field);
        setDraft(urlByField[field] ?? "");
    };

    const stopEdit = () => {
        setEditingField(null);
        setDraft("");
        setAwaitingPasteField(null);
    };

    const openSearch = (field: SocialLinkField, fallback = false) => {
        const target = buildCompanySearchTarget(field, profile.name, profile.kabupaten);
        const url = fallback && target.fallbackUrl ? target.fallbackUrl : target.searchUrl;
        // A named popup so repeated clicks reuse one window instead of
        // stacking them. The paste row opens immediately - the user can come
        // back and paste whenever they're done.
        const popup = window.open(url, "smartsales-social-search", "popup=yes,width=1100,height=800");
        startEdit(field);
        if (!popup) {
            // Popup blocked: the paste row is already open, just tell the
            // user to allow popups or open the search from the row's link.
            notify.info("Popup blocked", {
                description: "Allow popups for this site, or open the search in a new tab and paste the profile URL back here.",
            });
            return;
        }
        if (pollRef.current) clearInterval(pollRef.current);
        // `closed` is the only cross-origin-readable signal a popup has - the
        // page can never see which profile the user landed on (that would
        // need the F7 browser extension), so closing marks the row instead.
        pollRef.current = setInterval(() => {
            if (popup.closed) {
                if (pollRef.current) clearInterval(pollRef.current);
                pollRef.current = null;
                setAwaitingPasteField(field);
                inputRef.current?.focus();
            }
        }, 1000);
    };

    const saveLink = async (field: SocialLinkField, value: string | null, routedFrom?: SocialLinkField) => {
        if (!cacheId) return;
        setSavingField(field);
        try {
            const token = await getToken();
            const values = await updateSocialLinks(token, cacheId, { [field]: value });
            onLinksSaved(values);
            stopEdit();
            if (value === null) {
                notify.success(`${FIELD_LABELS[field]} link removed`);
            } else if (routedFrom) {
                notify.success(`Detected a ${FIELD_LABELS[field]} link`, {
                    description: `Saved to the ${FIELD_LABELS[field]} row (canonicalized: ${values[field]}).`,
                });
            } else {
                notify.success(`${FIELD_LABELS[field]} link saved`, {
                    description: values[field] ?? undefined,
                });
            }
        } catch (err: any) {
            notify.error("Could not save link", { description: handleError(err, "Save Social Link") });
        } finally {
            setSavingField(null);
        }
    };

    const handleSaveDraft = async (field: SocialLinkField) => {
        const value = draft.trim();
        if (!value) {
            notify.warning("Nothing to save", { description: "Paste the profile URL first." });
            return;
        }
        const classified = classifyPastedUrl(value);
        if (classified?.isLinkedInIndividual) {
            // Same rule the API enforces, caught before the request: personal
            // profiles are personal data (UU PDP) and are never stored.
            notify.error("Individual LinkedIn profiles are not stored", {
                description:
                    "Paste the company page (linkedin.com/company/...) instead - personal /in/ profiles are never saved.",
            });
            return;
        }
        if (classified && classified.field !== field) {
            if (!urlByField[classified.field]) {
                // Smart-paste routing: the paste is clearly another platform's
                // profile and that row is empty - save it where it belongs.
                await saveLink(classified.field, value, field);
                return;
            }
            notify.error(`That looks like a ${FIELD_LABELS[classified.field]} link`, {
                description: `${FIELD_LABELS[classified.field]} already has a link - edit that row to replace it.`,
            });
            return;
        }
        await saveLink(field, value);
    };

    const handlePasteFromClipboard = async () => {
        // Must be called from the click handler - reading the clipboard needs
        // a user gesture (and may still ask the browser's permission once).
        try {
            const text = await navigator.clipboard.readText();
            if (!text.trim()) {
                notify.info("Clipboard is empty", {
                    description: "Copy the profile URL from the search window first.",
                });
                return;
            }
            setDraft(text.trim());
            inputRef.current?.focus();
        } catch {
            notify.info("Clipboard not available", {
                description: "Paste the URL into the field manually (Ctrl+V).",
            });
        }
    };

    const searchHintNeeded = cacheId && platforms.some((platform) => !platform.url);

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
                    const field = PLATFORM_TO_FIELD[platform.key];
                    const isEditing = cacheId != null && editingField === field;
                    const searchTarget =
                        cacheId && !platform.url
                            ? buildCompanySearchTarget(field, profile.name, profile.kabupaten)
                            : null;
                    return (
                        <div key={platform.key} className="flex min-w-0 flex-col gap-1.5">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                                    <span className="flex min-w-0 items-center gap-1.5 text-gray-500">
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
                                {cacheId && !isEditing && (
                                    <span className="ml-auto flex shrink-0 items-center gap-1">
                                        {!platform.url && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => openSearch(field)}
                                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-[#5479EE] hover:text-[#5479EE]"
                                                    title={`Search ${platform.label} for "${profile.name}" in a popup`}
                                                >
                                                    <Search size={12} />
                                                    Search
                                                </button>
                                                {searchTarget?.fallbackUrl && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openSearch(field, true)}
                                                        className="text-xs text-gray-400 hover:text-[#5479EE] hover:underline"
                                                        title="Instagram's own search is weak - search it via Google instead"
                                                    >
                                                        {searchTarget.fallbackLabel}
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => startEdit(field)}
                                            className="rounded-md p-1 text-gray-400 hover:bg-gray-50 hover:text-[#5479EE]"
                                            title={platform.url ? `Edit ${platform.label} link` : `Paste ${platform.label} link`}
                                        >
                                            {platform.url ? <Pencil size={13} /> : <ClipboardPaste size={13} />}
                                        </button>
                                    </span>
                                )}
                            </div>
                            {isEditing && (
                                <div className="flex flex-col gap-1.5 rounded-lg bg-gray-50 p-2.5">
                                    {awaitingPasteField === field && (
                                        <p className="text-xs font-medium text-[#5479EE]">
                                            Search window closed - paste the profile URL you found below.
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="min-w-[220px] flex-1">
                                            <AppInput
                                                isBgWhite
                                                fullWidth
                                                size="small"
                                                inputRef={inputRef}
                                                value={draft}
                                                onChange={(e) => setDraft(e.target.value)}
                                                placeholder={`https://... (${platform.label} profile URL)`}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSaveDraft(field);
                                                    if (e.key === "Escape") stopEdit();
                                                }}
                                            />
                                        </div>
                                        <AppButton
                                            variantStyle="outline"
                                            color="gray"
                                            size="small"
                                            startIcon={<ClipboardPaste size={14} />}
                                            onClick={handlePasteFromClipboard}
                                        >
                                            Paste
                                        </AppButton>
                                        <AppButton
                                            variantStyle="primary"
                                            size="small"
                                            onClick={() => handleSaveDraft(field)}
                                            isLoading={savingField != null}
                                        >
                                            Save
                                        </AppButton>
                                        {platform.url && (
                                            <button
                                                type="button"
                                                onClick={() => saveLink(field, null)}
                                                disabled={savingField != null}
                                                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                title={`Remove ${platform.label} link`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={stopEdit}
                                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                            title="Cancel"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {searchHintNeeded && (
                <p className="mt-4 text-xs text-gray-400">
                    Search opens the platform&apos;s own search in a popup, prefilled with this
                    company&apos;s name - find the profile with your own account, then paste its URL
                    back here to save it.
                </p>
            )}
        </div>
    );
}
