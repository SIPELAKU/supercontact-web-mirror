// lib/utils/widgetHeader.ts
//
// Who the widget header shows: the bot until an agent takes the chat, then the
// company. Keep this file free of imports: it ships inside the widget bundle.

export interface HeaderIdentity {
  name: string;
  /** A photo or logo; null shows `initials`, or the bot icon when that is null too. */
  avatarUrl: string | null;
  initials: string | null;
}

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const letters = words.length === 1 ? words[0].slice(0, 1) : words[0].slice(0, 1) + words[words.length - 1].slice(0, 1);
  return letters.toUpperCase();
}

export function headerIdentity({
  agentConnected,
  companyName,
  companyLogoUrl,
  botName,
  botAvatarUrl,
  title,
}: {
  agentConnected: boolean;
  companyName?: string | null;
  companyLogoUrl?: string | null;
  botName?: string | null;
  botAvatarUrl?: string | null;
  title?: string | null;
}): HeaderIdentity {
  const company = (companyName ?? "").trim();
  // An older API sends no company: the header stays the bot's.
  if (agentConnected && company) {
    const logo = (companyLogoUrl ?? "").trim();
    return { name: company, avatarUrl: logo || null, initials: logo ? null : initialsOf(company) };
  }
  const avatar = (botAvatarUrl ?? "").trim();
  return { name: (botName ?? "").trim() || (title ?? "").trim(), avatarUrl: avatar || null, initials: null };
}
