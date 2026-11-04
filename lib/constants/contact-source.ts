// lib/constants/contact-source.ts
//
// Single source of truth for a contact's `source` (API v1.158.0, BE-1.1): the
// table column, the toolbar filter and the detail page all read from here.
//
// `source` is the LATEST channel that brought the contact in, not its first
// origin: from IMP-9 a web-widget chat matched to an existing contact by email
// sets it to `web_widget` and stamps `source_updated_at`.

export const CONTACT_SOURCE_LABELS = {
  manual: "Manual",
  omnichannel: "Omnichannel",
  import: "Import",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  messenger: "Messenger",
  instagram: "Instagram",
  web_widget: "Web Widget",
  smart_capture: "Smart Capture",
  email_marketing: "Email Marketing",
  wa_marketing: "WA Marketing",
  crm_company: "Company",
  ticket: "Ticket",
} as const;

export type ContactSource = keyof typeof CONTACT_SOURCE_LABELS;

// Filter value the API reads as "contact without a source".
export const UNKNOWN_CONTACT_SOURCE = "unknown";
export const UNKNOWN_CONTACT_SOURCE_LABEL = "Unknown";

/** Filter options in API order, Unknown last. */
export const CONTACT_SOURCE_OPTIONS: { value: string; label: string }[] = [
  ...Object.entries(CONTACT_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
  { value: UNKNOWN_CONTACT_SOURCE, label: UNKNOWN_CONTACT_SOURCE_LABEL },
];

/** Label for a contact's source; null (older contacts) reads "Unknown". */
export function contactSourceLabel(source?: string | null): string {
  if (!source) return UNKNOWN_CONTACT_SOURCE_LABEL;
  return CONTACT_SOURCE_LABELS[source as ContactSource] ?? source;
}

/**
 * The `source` query value: comma-joined, OR-ed by the API. SuperTable hands a
 * multiselect over as an array, but its URL sync gives ONE picked value back
 * as a plain string, so both shapes are read. Undefined when nothing is picked.
 */
export function contactSourceQuery(raw: unknown): string | undefined {
  const values = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
  const picked = values.filter((v): v is string => typeof v === "string" && v.length > 0);
  return picked.length > 0 ? picked.join(",") : undefined;
}
