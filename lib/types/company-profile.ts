export interface CompanyProfileStatsItem {
  title: string;
  value: string | number;
  subtitle: string;
  growth?: {
    value: number;
    unit?: "%";
  };
}

export interface CompanyProfileData {
  name: string;
  description: string;
  tags: string[];
  founded: string;
  headquarters: string;
  employees: string;
  status: string;
  aiSummary: {
    description: string;
    tags: string[];
  };
  stats: CompanyProfileStatsItem[];
}

export interface CompanyProfileKeyPerson {
  id: string;
  name: string;
  title: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  location?: string;
  description?: string;
}

export interface CompanyProfileOrganizationStructure {
  departmentsCount: number;
}

export interface CompanyDocument {
  id: string;
  title: string;
  filename: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface CompanySignal {
  id: string;
  signal_title: string;
  description: string;
  time_posted: string;
  created_at: string;
  // UI helper for dot color which is not in API response
  dotColor?: "green" | "blue" | "orange";
}

export interface CompanySignalPayload {
  signal_title: string;
  description: string;
  time_posted: string;
}

/**
 * GET /companies (CompanyResponse). Only the general fields the settings
 * screen edits are typed; the rest of the row is passed through untouched.
 * Money/rate values are Decimal strings, as everywhere in the API.
 */
export interface CompanyGeneral {
  id: string;
  name: string;
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  contacts_cross_user_visibility?: boolean;
  // Quotation defaults (Phase 0). Snapshotted onto each quotation at create
  // and draft update; changing them affects only quotations made afterwards.
  default_currency: string;
  default_tax_rate: string;
  prices_include_tax: boolean;
  quotation_terms: string | null;
  quotation_payment_terms: string | null;
}

/**
 * PATCH /internal/company-profile/general (CompanyUpdateGeneral). `name` is
 * required by the API even when only the defaults change, so callers always
 * resend the current one; every other field is optional and left unchanged
 * when omitted.
 */
export interface CompanyGeneralUpdatePayload {
  name: string;
  email?: string | null;
  phone_number?: string | null;
  website?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  contacts_cross_user_visibility?: boolean;
  default_currency?: string;
  /** Percent, two decimals at most ("11.00"). Sent as a string to stay Decimal-safe. */
  default_tax_rate?: string;
  prices_include_tax?: boolean;
  quotation_terms?: string | null;
  quotation_payment_terms?: string | null;
}
