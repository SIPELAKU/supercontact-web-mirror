// lib/utils/keyPeople.ts
//
// Settings › Company Profile › Key People: the company's active Admins and
// Managers, to look up and contact. Not a user-management page.

export const KEY_PEOPLE_PAGE_SIZE = 12;

/** "Rina Sari" -> "RS", "budi" -> "B"; for an avatar without a photo. */
export function personInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const letters = words.length === 1 ? words[0].slice(0, 1) : words[0].slice(0, 1) + words[words.length - 1].slice(0, 1);
  return letters.toUpperCase();
}

/** Pages for `total` people; at least one so the pager never shows "0". */
export function keyPeoplePageCount(total: number, limit: number = KEY_PEOPLE_PAGE_SIZE): number {
  if (!Number.isFinite(total) || total <= 0 || limit <= 0) return 1;
  return Math.ceil(total / limit);
}

/** A wa.me link for a phone number as people type it: "0812-3456 789" and
 *  "+62 812…" both become 62812…; null when there are too few digits. */
export function whatsappLink(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits.length >= 9 ? `https://wa.me/${digits}` : null;
}

const PRESENCE: Record<string, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-green-500" },
  away: { label: "Away", dot: "bg-yellow-400" },
  offline: { label: "Offline", dot: "bg-slate-300" },
};

/** The Workspace status of an agent; null for anyone else, who gets no dot. */
export function presenceBadge(presence?: string | null): { label: string; dot: string } | null {
  return PRESENCE[(presence ?? "").trim().toLowerCase()] ?? null;
}

/** "Sales · HO", or whichever of the two is known. */
export function departmentLine(department?: string, branch?: string): string {
  return [department, branch].map((part) => (part ?? "").trim()).filter(Boolean).join(" · ");
}
