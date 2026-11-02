// lib/utils/preChat.ts
//
// Rules for the embeddable widget's pre-chat form (widget/src/widget.ts,
// bundled on its own by esbuild): name + email are required before the first
// message, because /public/widget/start refuses a chat without them. Keep this
// file free of imports: it ships inside the widget bundle.

export const PRE_CHAT_NAME_MAX = 120;
export const PRE_CHAT_EMAIL_MAX = 254;

export interface PreChatErrors {
  name: boolean;
  email: boolean;
}

// Same rules as the backend: a name, and an email with one "@", a dot in the
// domain and no spaces.
export function isValidVisitorEmail(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > PRE_CHAT_EMAIL_MAX || /\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2 || !parts[0]) return false;
  const domain = parts[1];
  const dot = domain.indexOf(".");
  return dot > 0 && dot < domain.length - 1 && !domain.endsWith(".");
}

export function preChatErrors(name: string, email: string): PreChatErrors | null {
  const trimmed = name.trim();
  const errors = {
    name: !trimmed || trimmed.length > PRE_CHAT_NAME_MAX,
    email: !isValidVisitorEmail(email),
  };
  return errors.name || errors.email ? errors : null;
}

// Which field a refused /start points at: "Name is required" or
// "A valid email is required" (400). Any other failure is a send error.
export function startIdentityError(status: number | undefined, message: string | undefined): PreChatErrors | null {
  if (status !== 400) return null;
  const text = (message || "").toLowerCase();
  const errors = { name: text.includes("name"), email: text.includes("email") };
  return errors.name || errors.email ? errors : null;
}

// The first screen when the panel has no live chat: the form until the
// visitor has given their details, then the home screen (or the thread).
export function landingView(opts: {
  hasSession: boolean;
  hasVisitor: boolean;
  showHomeScreen: boolean;
}): "prechat" | "home" | "chat" {
  if (opts.hasSession) return "chat";
  if (!opts.hasVisitor) return "prechat";
  return opts.showHomeScreen ? "home" : "chat";
}
