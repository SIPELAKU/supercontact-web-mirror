// lib/utils/contactDuplicate.ts
//
// POST /contacts duplicate handling (API v1.158.0, BE-1.3), shared by Add
// Contact and the Omnichannel new-contact form:
//   201                       -> a new contact
//   200 + duplicate.merged    -> same name + email, nothing clashed: the old
//                                contact's empty fields were filled in
//   409 DUPLICATE_CONTACT     -> the user must choose; nothing was saved
// The answer to a 409 is the SAME body re-sent with `duplicate_resolution`.

export type DuplicateReason = "same_name_email" | "same_email_different_name" | "same_phone";

export interface DuplicateConflict {
  // A contact column, or `custom_fields.<key>`.
  field: string;
  existing: unknown;
  incoming: unknown;
  // Names for customer_type_id / region_id, whose values are ids.
  existing_label?: string | null;
  incoming_label?: string | null;
}

export interface DuplicateContactDetails {
  reason: DuplicateReason;
  existing_contact: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    source?: string | null;
    created_at?: string | null;
  };
  conflicts: DuplicateConflict[];
}

export type DuplicateChoice = "existing" | "incoming";

// The API also takes `{ create_new: true }`; the web never sends it (no
// duplicate contacts, user decision 2026-11-04).
export type DuplicateResolution = { contact_id: string; keep: Record<string, DuplicateChoice> };

export type CreateContactResult =
  | { kind: "created" | "merged"; contact: Record<string, unknown> }
  | { kind: "duplicate"; duplicate: DuplicateContactDetails }
  | { kind: "error"; status: number; message: string; details?: unknown };

/** Sorts a POST /contacts answer into what the form does next. */
export function readCreateContactResponse(status: number, json: any): CreateContactResult {
  if (status === 409 && json?.error?.code === "DUPLICATE_CONTACT" && json.error.details?.existing_contact) {
    const details = json.error.details;
    return {
      kind: "duplicate",
      duplicate: {
        reason: details.reason,
        existing_contact: details.existing_contact,
        conflicts: Array.isArray(details.conflicts) ? details.conflicts : [],
      },
    };
  }
  if (status >= 200 && status < 300 && json?.success !== false && json?.data) {
    return { kind: json.data.duplicate?.merged ? "merged" : "created", contact: json.data };
  }
  return {
    kind: "error",
    status,
    message: status === 401 ? "UNAUTHORIZED" : json?.error?.message || json?.message || "Failed to add contact",
    details: json?.error?.details,
  };
}

/** Conflicting fields the user has not chosen for yet (Merge stays disabled). */
export function missingDuplicateChoices(
  conflicts: DuplicateConflict[],
  keep: Record<string, DuplicateChoice>,
): string[] {
  return conflicts.map((c) => c.field).filter((field) => !keep[field]);
}

export function duplicateReasonText(reason: DuplicateReason): string {
  switch (reason) {
    case "same_name_email":
      return "A contact with the same name and email already exists, with different details.";
    case "same_email_different_name":
      return "A contact with this email already exists under another name.";
    case "same_phone":
      return "A contact with this phone number already exists.";
    default:
      return "A matching contact already exists.";
  }
}

const FIELD_LABELS: Record<string, string> = {
  name: "Name",
  email: "Email",
  phone_number: "Phone Number",
  company: "Company",
  position: "Position",
  address: "Address",
  customer_type_id: "Tipe Pelanggan",
  region_id: "Wilayah",
  crm_company_id: "CRM Company",
};

export function duplicateFieldLabel(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const key = field.startsWith("custom_fields.") ? field.slice("custom_fields.".length) : field;
  const words = key.replace(/_/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : field;
}

/** One side of a conflict as text: the label for an id, else the value. */
export function duplicateValueText(conflict: DuplicateConflict, side: DuplicateChoice): string {
  const label = side === "existing" ? conflict.existing_label : conflict.incoming_label;
  if (label) return label;
  const value = conflict[side];
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
