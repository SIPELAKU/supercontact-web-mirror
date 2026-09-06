// lib/utils/contactTags.ts
//
// Pure helpers for the contact-tag editor and manager (Phase 3, spec A0.1).
// Nothing here calls the network; `lib/api/contact-tags.ts` does that.
//
// The one rule that drives most of this file: a tag name is unique per tenant
// CASE-INSENSITIVELY (`UNIQUE (company_id, lower(name))`). Create-on-type must
// therefore look for an existing "VIP" before it posts "vip", or the server
// answers 409 and the user is told a tag they can plainly see does not exist.
// `normalizeTagName` is the ONE definition of "the same tag" the browser uses,
// and it matches the server's `lower(trim(name))`.

import type { ContactTag, ContactTagBrief } from "@/lib/types/ContactTag";

/** `contact_tags.name` is String(50). */
export const CONTACT_TAG_NAME_MAX_LENGTH = 50;

/** `contact_tags.color` is String(7): `#rrggbb`, or NULL for "no colour". */
export const CONTACT_TAG_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/**
 * The palette the colour picker offers. Deliberately a small closed set rather
 * than a native colour wheel: a tag colour is read as a CHIP against white and
 * against the dark theme, and an arbitrary #f7f7f7 is invisible in one of them.
 * Every entry below has been checked for a readable foreground through
 * `tagTextColor`.
 */
export const CONTACT_TAG_COLORS: readonly string[] = [
  "#ef4444", // merah
  "#f97316", // oranye
  "#eab308", // kuning
  "#22c55e", // hijau
  "#14b8a6", // toska
  "#3b82f6", // biru
  "#6366f1", // indigo
  "#a855f7", // ungu
  "#ec4899", // merah muda
  "#64748b", // abu
] as const;

/** Trim + collapse inner whitespace; what the input sends to the server. */
export function cleanTagName(name: string): string {
  return String(name ?? "").trim().replace(/\s+/g, " ");
}

/**
 * The tenant-unique key of a tag name - `lower(trim(name))`, the same value
 * the functional unique index computes. "  VIP  " and "vip" collapse to one.
 */
export function normalizeTagName(name: string): string {
  return cleanTagName(name).toLocaleLowerCase("id-ID");
}

/** `#ABC123` -> `#abc123`; anything that is not `#rrggbb` -> null (= no colour). */
export function normalizeTagColor(color: string | null | undefined): string | null {
  const text = String(color ?? "").trim();
  if (!text) return null;
  return CONTACT_TAG_COLOR_PATTERN.test(text) ? text.toLowerCase() : null;
}

export function isValidTagColor(color: string | null | undefined): boolean {
  if (color === null || color === undefined || color === "") return true; // "no colour" is valid
  return CONTACT_TAG_COLOR_PATTERN.test(String(color).trim());
}

/**
 * Black or white text over the tag colour, by W3C relative luminance. A chip
 * whose label cannot be read is a chip that says nothing, and the palette is
 * open to whatever an older row already stores, so this is computed rather
 * than tabulated.
 */
export function tagTextColor(color: string | null | undefined): string {
  const hex = normalizeTagColor(color);
  if (!hex) return "#0d121b";
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
  return luminance > 0.45 ? "#0d121b" : "#ffffff";
}

/** The neutral chip when a tag carries no colour - the shipped contact-detail look. */
export const CONTACT_TAG_NEUTRAL_BG = "#e7ebf3";

export interface TagChipStyle {
  backgroundColor: string;
  color: string;
}

export function tagChipStyle(color: string | null | undefined): TagChipStyle {
  const hex = normalizeTagColor(color);
  return {
    backgroundColor: hex ?? CONTACT_TAG_NEUTRAL_BG,
    color: tagTextColor(hex),
  };
}

/**
 * The existing tag whose name matches `name` case-insensitively, or null.
 * This is what makes create-on-type reuse a row instead of racing the unique
 * index; an ARCHIVED tag still matches, because the index does not care that
 * `is_active` is false and posting the name again would 409.
 */
export function findTagByName<T extends { name: string }>(
  tags: readonly T[] | null | undefined,
  name: string
): T | null {
  const key = normalizeTagName(name);
  if (!key) return null;
  return (tags ?? []).find((tag) => normalizeTagName(tag.name) === key) ?? null;
}

/** Is this name free? Optionally ignoring one row - the tag being renamed. */
export function isTagNameAvailable<T extends { id: string; name: string }>(
  tags: readonly T[] | null | undefined,
  name: string,
  ignoreId?: string | null
): boolean {
  const match = findTagByName(tags, name);
  return match === null || match.id === ignoreId;
}

/**
 * What the user typed, minus the tags already on the contact and minus every
 * blank - the suggestion list for the editor's autocomplete. Archived tags are
 * never offered (they stay on the contacts that already carry them).
 */
export function suggestTags(
  all: readonly ContactTag[] | null | undefined,
  selected: readonly ContactTagBrief[] | null | undefined,
  query: string
): ContactTag[] {
  const taken = new Set((selected ?? []).map((tag) => tag.id));
  const needle = normalizeTagName(query);
  return (all ?? [])
    .filter((tag) => tag.is_active && !taken.has(tag.id))
    .filter((tag) => (needle ? normalizeTagName(tag.name).includes(needle) : true));
}

/**
 * `PUT /contacts/{id}/tags` replaces the WHOLE set, so both add and remove are
 * expressed as "here is the new list". De-duplicated by id, order preserved -
 * the server stores links, not an ordered array, but a stable order keeps the
 * optimistic chip row from jumping while the request is in flight.
 */
export function tagIdsFor(tags: readonly ContactTagBrief[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of tags ?? []) {
    if (!tag?.id || seen.has(tag.id)) continue;
    seen.add(tag.id);
    out.push(tag.id);
  }
  return out;
}

export function addTag(
  selected: readonly ContactTagBrief[] | null | undefined,
  tag: ContactTagBrief
): ContactTagBrief[] {
  const current = [...(selected ?? [])];
  if (current.some((entry) => entry.id === tag.id)) return current;
  return [...current, { id: tag.id, name: tag.name, color: tag.color ?? null }];
}

export function removeTag(
  selected: readonly ContactTagBrief[] | null | undefined,
  tagId: string
): ContactTagBrief[] {
  return (selected ?? []).filter((tag) => tag.id !== tagId).map((tag) => ({ ...tag }));
}

/**
 * The sentence the rename dialog shows BEFORE it commits (spec A0.1: "Renaming
 * shows how many contacts are affected before it commits"). A rename is a
 * config act precisely because it lands on every contact at once, so the count
 * is stated, never implied - and "0" is said out loud rather than hidden,
 * because a tag nobody carries is safe to rename and the user should know it.
 */
export function describeRenameImpact(
  from: string,
  to: string,
  contactCount: number | null | undefined
): string {
  const count = typeof contactCount === "number" && contactCount > 0 ? contactCount : 0;
  const where =
    count === 0
      ? "Belum ada kontak yang memakai tag ini."
      : `${count} kontak memakai tag ini dan semuanya ikut berubah.`;
  return `"${cleanTagName(from)}" akan berubah menjadi "${cleanTagName(to)}". ${where}`;
}

/** The same count, phrased for the archive dialog. */
export function describeArchiveImpact(name: string, contactCount: number | null | undefined): string {
  const count = typeof contactCount === "number" && contactCount > 0 ? contactCount : 0;
  return count === 0
    ? `"${cleanTagName(name)}" belum dipakai kontak mana pun. Mengarsipkan hanya menyembunyikannya dari pilihan baru.`
    : `"${cleanTagName(name)}" masih menempel di ${count} kontak. Mengarsipkan tidak melepasnya dari kontak itu - tag hanya berhenti ditawarkan untuk kontak baru.`;
}

/**
 * Local validation before the POST/PATCH, so the common refusals are answered
 * without a round trip. Returns a field -> message map, empty when valid; the
 * keys match the API's `details.field` names so `extractFieldErrors` output
 * can be merged straight into the same state.
 */
export function validateTagDraft(
  draft: { name: string; color: string | null },
  existing: readonly ContactTag[] | null | undefined,
  ignoreId?: string | null
): Record<string, string> {
  const problems: Record<string, string> = {};
  const name = cleanTagName(draft.name);
  if (!name) problems.name = "Nama tag wajib diisi";
  else if (name.length > CONTACT_TAG_NAME_MAX_LENGTH)
    problems.name = `Maksimal ${CONTACT_TAG_NAME_MAX_LENGTH} karakter`;
  else if (!isTagNameAvailable(existing, name, ignoreId))
    problems.name = "Sudah ada tag dengan nama ini (huruf besar/kecil dianggap sama)";
  if (!isValidTagColor(draft.color)) problems.color = "Warna harus dalam format #rrggbb";
  return problems;
}
