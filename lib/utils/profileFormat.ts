// lib/utils/profileFormat.ts
//
// Shared by My Profile and the Key People profile page.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "Joined February 2026"; "Joined -" when the date is missing or unreadable. */
export function formatJoinedDate(value?: string | null): string {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Joined -";
  return `Joined ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** The clock where someone is, e.g. "14:05"; null for an unknown time zone. */
export function localTime(timezone: string | null | undefined, now: Date = new Date()): string | null {
  const zone = (timezone ?? "").trim();
  if (!zone) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: zone }).format(now);
  } catch {
    return null;
  }
}
