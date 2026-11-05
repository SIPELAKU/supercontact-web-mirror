// lib/utils/contactImportRules.ts
//
// What a Contact import row must look like, checked in the browser before
// anything is sent (FE-6), and the downloadable template built from the same
// rules (FE-7), so the guide can never say something the check does not do.
//
// Copied from the API (v1.163.3), which stays the final judge:
// - `ContactBulkRequest` in app/schemas/contact_schema.py (lengths, email);
// - `normalize_phone_number_unchecked` in app/utils/number.py (phone);
// - `identity_key` in app/utils/contact_identity.py (who is the same person).
// Values arrive here already trimmed by the import modal.

import type { ImportFileRules } from "./importFileDuplicates";

export type ImportRow = Record<string, string | undefined>;

export interface RowIssue {
  field: string;
  message: string;
}

export interface ImportFieldRule {
  // Key in the request body, as mapped in the import modal.
  field: string;
  // Column header in the template; the modal maps it automatically.
  column: string;
  // Guide text: whether the column must be filled.
  required: string;
  // Guide text: what a valid value looks like.
  format: string;
  // The problem with a filled-in value, or null. Empty values never reach it.
  check?: (value: string) => string | null;
}

// Python's len() counts characters, not UTF-16 units as String#length does.
const length = (value: string) => Array.from(value).length;

const lengthBetween = (label: string, min: number, max: number) => (value: string) =>
  length(value) < min || length(value) > max ? `${label} must be ${min}–${max} characters` : null;

// pydantic's EmailStr is email-validator 2.3.0 without the DNS check. One
// rejected email fails the WHOLE request (422), so its syntax rules are
// copied here (BE-7, 2026-11-05); quoted local parts and [ip] domains, which
// it allows in theory, are refused here, which only makes the web stricter.
// The domain limit (253) can never be hit within this one.
const EMAIL_MAX_LENGTH = 254;
const EMAIL_LABEL_MAX_LENGTH = 63;
// RFC 5322 atext, plus non-ASCII letters, numbers, punctuation, symbols and
// marks (internationalized addresses); never control or format characters
// (\p{C}), which email-validator calls unsafe. Spaces are refused by \s first.
const EMAIL_LOCAL_PART =
  /^(?:[\w!#$%&'*+\-/=?^`{|}~]|[^\x00-\x7F\p{C}])+(\.(?:[\w!#$%&'*+\-/=?^`{|}~]|[^\x00-\x7F\p{C}])+)*$/u;
// A hostname label: letters, digits and inner hyphens. Beyond ASCII only
// letters and (not first) combining marks, so "tÃ¶kÃ¶" (with ¶, a paragraph
// sign) is refused like the API does. Non-ASCII digits are refused too: the
// API takes some (fullwidth) and not others (Arabic), and refusing a rare
// address here only marks the row invalid, while letting through one the
// API refuses fails the whole part.
const EMAIL_DOMAIN_LABEL = /^[a-z0-9\p{L}]([a-z0-9\-\p{L}\p{M}]*[a-z0-9\p{L}\p{M}])?$/iu;
// Domains with no public mail, refused whatever comes before them.
const EMAIL_SPECIAL_USE_DOMAINS = ["arpa", "invalid", "local", "localhost", "onion", "test"];

/** Whether the API's EmailStr would take this address (value already trimmed). */
export function isImportEmail(value: string): boolean {
  if (/\s/.test(value) || length(value) > EMAIL_MAX_LENGTH) return false;
  // An empty local part or a second @ fails the patterns below.
  const at = value.indexOf("@");
  if (at < 0) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  // A combining mark first would join whatever comes before the address.
  if (!EMAIL_LOCAL_PART.test(local) || /^\p{M}/u.test(local)) return false;

  // At least one dot; every label a hostname label.
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!labels.every((label) => length(label) <= EMAIL_LABEL_MAX_LENGTH && EMAIL_DOMAIN_LABEL.test(label))) return false;
  // Every top-level domain ends with a letter (so no "a@1.2.3.4").
  const tld = labels[labels.length - 1].toLowerCase();
  if (/[0-9-]$/.test(tld)) return false;
  return !EMAIL_SPECIAL_USE_DOMAINS.includes(tld);
}

export function normalizeImportEmail(email: string | undefined): string {
  return String(email ?? "").trim().toLowerCase();
}

/**
 * The phone number as the API stores and compares it, e.g. "0812-3456 7890"
 * -> "+6281234567890". Throws the API's reason when it would reject it.
 */
export function normalizeImportPhone(phone: string): string {
  const value = phone.trim();
  if (!value) throw new Error("phone number cannot be empty");
  if (/[^0-9 +\-()]/.test(value)) {
    throw new Error("only digits, spaces, '+', '-' and parentheses are allowed");
  }
  if ((value.match(/\+/g) ?? []).length > 1 || (value.includes("+") && !value.startsWith("+"))) {
    throw new Error("only one '+', at the start");
  }
  if ((value.match(/\(/g) ?? []).length !== (value.match(/\)/g) ?? []).length) {
    throw new Error("unbalanced parentheses");
  }

  let compact = value.replace(/[ \-()]/g, "");
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (compact.startsWith("+")) {
    if (!/^\d+$/.test(compact.slice(1))) throw new Error("digits are required after '+'");
    return compact;
  }
  if (!/^\d+$/.test(compact)) throw new Error("digits only");
  // Indonesia is the default region.
  if (compact.startsWith("0") && compact.length > 1) return `+62${compact.slice(1)}`;
  return `+${compact}`;
}

export const CONTACT_IMPORT_RULES: ImportFieldRule[] = [
  {
    field: "name",
    column: "Name",
    required: "Yes",
    format: "3–255 characters",
    check: lengthBetween("Name", 3, 255),
  },
  {
    field: "email",
    column: "Email",
    required: "Email or Phone Number",
    format: "An email address, e.g. budi@example.com",
    check: (value) => (isImportEmail(value) ? null : "Invalid email"),
  },
  {
    field: "phone_number",
    column: "Phone Number",
    required: "Email or Phone Number",
    format: "Digits, spaces, '+', '-' and parentheses, at most 30 characters. 0812… is read as +62812…",
    check: (value) => {
      if (length(value) > 30) return "Invalid phone number: at most 30 characters";
      try {
        normalizeImportPhone(value);
        return null;
      } catch (error) {
        return `Invalid phone number: ${(error as Error).message}`;
      }
    },
  },
  {
    field: "company",
    column: "Company",
    required: "No",
    format: "3–255 characters",
    check: lengthBetween("Company", 3, 255),
  },
  {
    field: "position",
    column: "Position",
    required: "No",
    format: "At most 255 characters",
    check: (value) => (length(value) > 255 ? "Position is too long" : null),
  },
  {
    field: "address",
    column: "Address",
    required: "No",
    format: "At least 6 characters",
    check: (value) => (length(value) < 6 ? "Address must be at least 6 characters" : null),
  },
];

// Rules for the whole row, shown under the columns in the template guide.
export const CONTACT_IMPORT_ROW_NOTES = [
  "Fill in Email or Phone Number (at least one). Rows with neither are skipped.",
  "Rows with the same email or phone number are the same contact.",
  "Other columns can be mapped to custom fields.",
];

const filled = (row: ImportRow, field: string) => Boolean(row[field]?.trim());

/**
 * A row with neither email nor phone number is skipped without a warning
 * (user decision 2026-11-05): it cannot be matched to anyone. Counted, not
 * listed as invalid. Rows with only one of the two are fine.
 */
export function hasContactInfo(row: ImportRow): boolean {
  return filled(row, "email") || filled(row, "phone_number");
}

/** Every rule the row breaks; empty = the row can be imported. */
export function validateContactImportRow(row: ImportRow): RowIssue[] {
  const issues: RowIssue[] = [];
  for (const rule of CONTACT_IMPORT_RULES) {
    const value = row[rule.field]?.trim() ?? "";
    if (!value) {
      if (rule.required === "Yes") issues.push({ field: rule.field, message: `${rule.column} is required` });
      continue;
    }
    const problem = rule.check?.(value);
    if (problem) issues.push({ field: rule.field, message: problem });
  }
  return issues;
}

/**
 * The keys that make two rows the same person: the normalized email and the
 * normalized phone number, each when filled in.
 */
export function contactIdentity(row: ImportRow): string[] {
  const keys: string[] = [];
  const email = normalizeImportEmail(row.email);
  if (email) keys.push(`email:${email}`);
  const phone = row.phone_number?.trim();
  if (phone) keys.push(`phone:${comparablePhone(phone)}`);
  return keys;
}

/**
 * A value as two duplicate rows compare it: email ignoring case, phone number
 * ignoring its format, anything else exactly. So "ANDI@x.com" and
 * "andi@x.com" in one group need no choice.
 */
export function contactCompareValue(field: string, value: string): string {
  if (field === "email") return normalizeImportEmail(value);
  if (field === "phone_number") return comparablePhone(value);
  return value.trim();
}

// Like the API's normalize_phone: falls back to the raw value it cannot read.
function comparablePhone(phone: string): string {
  try {
    return normalizeImportPhone(phone);
  } catch {
    return phone.trim();
  }
}

/**
 * The contact field a file column most likely holds, from its header in
 * English or Indonesian; null = leave the column unmapped.
 */
export function suggestContactField(header: string): string | null {
  const h = header.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  if ((h.includes("name") || h.includes("nama")) && !h.includes("email") && !h.includes("last") && !h.includes("first") && !h.includes("company")) return "name";
  if (h.includes("phone") || h.includes("telepon") || h.includes("hp") || h.includes("nomor") || h.includes("telp")) return "phone_number";
  if (h.includes("email") || h.includes("mail") || h.includes("surel")) return "email";
  if (h.includes("position") || h.includes("jabatan") || h.includes("title")) return "position";
  if (h.includes("company") || h.includes("perusahaan") || h.includes("organization")) return "company";
  if (h.includes("address") || h.includes("alamat")) return "address";

  return null;
}

/** The Contact rules in the shape the file check (importFileDuplicates) takes. */
export const CONTACT_FILE_RULES: ImportFileRules<ImportRow> = {
  isImportable: hasContactInfo,
  validate: validateContactImportRow,
  identityOf: contactIdentity,
  compareValue: contactCompareValue,
};

// FE-7: the downloadable template. Its sample rows must pass the check above
// (a test keeps them honest).
export const CONTACT_IMPORT_TEMPLATE = {
  fileName: "contacts_import_template.xlsx",
  sheetName: "Contacts",
  rules: CONTACT_IMPORT_RULES,
  notes: CONTACT_IMPORT_ROW_NOTES,
  samples: [
    {
      name: "Budi Santoso",
      email: "budi.santoso@example.com",
      phone_number: "081234567890",
      company: "PT Maju Jaya",
      position: "Purchasing Manager",
      address: "Jl. Sudirman No. 1, Jakarta",
    },
    {
      name: "Siti Rahma",
      email: "siti.rahma@example.com",
      phone_number: "",
      company: "CV Sentosa",
      position: "Owner",
      address: "",
    },
    {
      name: "Andi Wijaya",
      email: "",
      phone_number: "+62 813-5555-0101",
      company: "",
      position: "",
      address: "Jl. Diponegoro 45, Bandung",
    },
  ] satisfies ImportRow[],
};
