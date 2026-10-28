// What the Company Profile identity card shows next to (or instead of) the
// logo, and how it links the website.

// Legal forms that say nothing about the company: "PT Solvera Global" -> "SG".
const LEGAL_FORMS = new Set(["PT", "CV", "TBK", "UD", "PD", "FIRMA"]);

/** Up to two initials for the monogram shown when there is no logo. */
export function companyInitials(name: string | null | undefined): string {
  const words = (name ?? "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const meaningful = words.filter((w) => !LEGAL_FORMS.has(w.toUpperCase()));
  const picked = (meaningful.length ? meaningful : words).slice(0, 2);
  return picked.map((w) => w[0].toUpperCase()).join("") || "?";
}

/** A link that works even when the website was saved without its scheme. */
export function websiteHref(website: string): string {
  const trimmed = website.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** The website as people read it: no scheme, no "www.", no trailing slash. */
export function websiteLabel(website: string): string {
  return website.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/+$/, "");
}
