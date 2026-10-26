// lib/types/person-intelligence.ts
// Mirrors app/schemas/person_intelligence.py exactly (field names, optionality).
// Decimal fields (credits_reserved, credits_used, balance, reserved, available)
// arrive as JSON strings, same as every other Decimal-backed field in this app.

export interface PersonSearchRequest {
    name?: string;
    company_domain?: string;
    title_contains?: string;
    limit?: number;
    offset?: number;
}

export interface PersonSearchResultItem {
    id: string;
    full_name: string;
    title: string | null;
    organization_name: string | null;
    linkedin_url: string | null;
    primary_email: string | null;
    updated_at: string;
}

export interface PersonSearchResponse {
    total: number;
    items: PersonSearchResultItem[];
}

// The one-click "enrich everything" bundle this feature ships with — see
// EnrichPersonDialog. The backend still accepts a narrower `fields` list;
// nothing here stops a future UI from offering per-field selection again.
export const ENRICH_ALL_FIELDS = ["email", "phone"] as const;
// Mirrors app/services/person_enrichment_pricing.py's _FIELD_COST exactly
// (email=1, phone=2) — shown to the user before they spend it, so this
// must never drift from the backend's real pricing table. If that table
// changes, update this constant in the same PR.
export const ENRICH_ALL_COST = 3;

export interface PersonEnrichmentJobCreateRequest {
    full_name: string;
    company_name?: string;
    company_domain?: string;
    linkedin_url?: string;
    title?: string;
    location?: string;
    fields: string[];
    idempotency_key?: string;
}

export interface PersonEnrichmentJobResponse {
    job_id: string;
    status: string;
    credits_reserved: string;
}

export interface PersonEnrichmentJobStatusResponse {
    job_id: string;
    status: string;
    person_id: string | null;
    credits_used: string;
    error_code: string | null;
    error_message: string | null;
}

export interface EnrichmentCreditBalanceResponse {
    balance: string;
    reserved: string;
    available: string;
    // True in LOCAL/DEV only (app/services/enrichment_credit_service.py) —
    // `available` can be negative there since enforcement is bypassed but
    // the ledger still runs for real. Show "Unlimited", not the raw number.
    unlimited: boolean;
}

export interface PersonEmailDetail {
    email: string;
    is_primary: boolean;
    verification_status: string;
    confidence: number;
    source: string | null;
}

export interface PersonPhoneDetail {
    phone: string;
    is_primary: boolean;
    verification_status: string;
    confidence: number;
    source: string | null;
    line_type: string | null;
}

export interface PersonEmploymentDetail {
    organization_id: string;
    organization_name: string;
    title: string | null;
    start_date: string | null;
    end_date: string | null;
    is_current: boolean;
    source: string | null;
}

export interface PersonProvenanceEntry {
    field: string;
    value: string | null;
    source: string | null;
    confidence: number | null;
    collected_at: string | null;
}

export interface PersonLastEnrichment {
    completed_at: string;
    credits_used: string;
}

export interface PersonDetailResponse {
    id: string;
    full_name: string;
    title: string | null;
    organization_id: string | null;
    organization_name: string | null;
    organization_domain: string | null;
    linkedin_url: string | null;
    updated_at: string;
    emails: PersonEmailDetail[];
    phones: PersonPhoneDetail[];
    employment: PersonEmploymentDetail[];
    provenance: PersonProvenanceEntry[];
    last_enrichment: PersonLastEnrichment | null;
}
