// Search Assist deep-links (the wa.me pattern): the app never calls a social
// platform's API here - it hands the user a prefilled search URL to open in
// their own logged-in browser session, and accepts the profile URL they paste
// back (PATCH /company-intelligence/{cacheId}/social-links). Every platform
// interaction stays a personal browser action, which is exactly why there is
// no bot/scraper in this module.

export type SocialLinkField =
    | "instagram_url"
    | "facebook_url"
    | "linkedin_url"
    | "tiktok_url"
    | "x_url"
    | "threads_url";

// SocialPresenceCard's platform keys -> PATCH payload fields.
export const PLATFORM_TO_FIELD: Record<string, SocialLinkField> = {
    instagram: "instagram_url",
    facebook: "facebook_url",
    linkedin: "linkedin_url",
    tiktok: "tiktok_url",
    x: "x_url",
    threads: "threads_url",
};

export interface SocialSearchTarget {
    searchUrl: string;
    // Secondary route for platforms whose native keyword search is weak
    // (Instagram web search barely surfaces business accounts).
    fallbackUrl?: string;
    fallbackLabel?: string;
}

/**
 * Platform search page prefilled with "name + kabupaten". The kabupaten is
 * included because Indonesian SMEs very often disambiguate themselves by city
 * in their profile name/bio; the user can always edit the query in-platform.
 */
export function buildCompanySearchTarget(
    field: SocialLinkField,
    name: string,
    kabupaten?: string | null
): SocialSearchTarget {
    const query = [name, kabupaten].filter(Boolean).join(" ").trim();
    const q = encodeURIComponent(query);
    switch (field) {
        case "instagram_url":
            return {
                searchUrl: `https://www.instagram.com/explore/search/keyword/?q=${q}`,
                fallbackUrl: `https://www.google.com/search?q=${encodeURIComponent(`site:instagram.com ${query}`)}`,
                fallbackLabel: "via Google",
            };
        case "facebook_url":
            return { searchUrl: `https://www.facebook.com/search/pages?q=${q}` };
        case "linkedin_url":
            return {
                searchUrl: `https://www.linkedin.com/search/results/companies/?keywords=${q}`,
            };
        case "tiktok_url":
            return { searchUrl: `https://www.tiktok.com/search?q=${q}` };
        case "x_url":
            return { searchUrl: `https://x.com/search?q=${q}&f=user` };
        case "threads_url":
            return { searchUrl: `https://www.threads.com/search?q=${q}` };
    }
}

/**
 * LinkedIn *people* search for the People page. Search-assist only: individual
 * profile URLs are never pasted back or stored anywhere (UU PDP - personal
 * data), so there is deliberately no save flow attached to this URL.
 */
export function buildLinkedInPeopleSearchUrl(personName: string, companyName?: string | null): string {
    const query = [personName, companyName].filter(Boolean).join(" ").trim();
    return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`;
}

export interface PastedUrlClassification {
    field: SocialLinkField;
    // A LinkedIn /in/... individual profile - refused client-side with the
    // same explanation the API would give, before any request is made.
    isLinkedInIndividual: boolean;
}

// Routing only - the API is the source of truth for validation (reserved
// segments, canonicalization). This just answers "which platform's row does
// this paste belong to?" so a paste on the wrong row can be redirected.
const HOST_TO_FIELD: Array<[string, SocialLinkField]> = [
    ["instagram.com", "instagram_url"],
    ["facebook.com", "facebook_url"],
    ["fb.com", "facebook_url"],
    ["linkedin.com", "linkedin_url"],
    ["tiktok.com", "tiktok_url"],
    ["x.com", "x_url"],
    ["twitter.com", "x_url"],
    ["threads.com", "threads_url"],
    ["threads.net", "threads_url"],
];

export function classifyPastedUrl(raw: string): PastedUrlClassification | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    let host: string;
    let path: string;
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
        host = url.hostname.toLowerCase();
        path = url.pathname;
    } catch {
        return null;
    }
    for (const [root, field] of HOST_TO_FIELD) {
        if (host === root || host.endsWith(`.${root}`)) {
            return {
                field,
                isLinkedInIndividual:
                    field === "linkedin_url" && /^\/+in(\/|$)/.test(path),
            };
        }
    }
    return null;
}
