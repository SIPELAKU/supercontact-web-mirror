export interface CompanySocialInfo {
    category: string | null;
    follower_count: number | null;
    is_verified: boolean | null;
    page_url: string;
    checked_at: string;
}

export interface CompanyIntelligenceSearchPayload {
    industries: string[];
    locations: string[];
    // Free-text kabupaten/kota (no fixed list, unlike `locations`). Filters
    // already-stored rows AND narrows the live Google Maps query to that
    // place instead of just the province - this is what makes "search per
    // kabupaten, one at a time" actually reach new companies via Maps.
    kabupaten?: string[];
    employee_min: number;
    employee_max: number;
    financial_status: string[];
    has_phone?: boolean;
    has_domain?: boolean;
    min_confidence?: string;
    exclude_saved?: boolean;
    limit: number;
    q?: string;
    page?: number;
}

export interface CompanyIntelligenceItem {
    id: string;
    external_id: string;
    name: string;
    ticker: string | null;
    domain: string | null;
    phone: string | null;
    email: string | null;
    description: string;
    industry: string | null;
    location: string;
    employee_count: number;
    revenue: number | null;
    financial_status: string;
    // Fase 1 widened cache columns (all nullable server-side).
    address_line?: string | null;
    kabupaten?: string | null;
    kecamatan?: string | null;
    postal_code?: string | null;
    nib?: string | null;
    npwp?: string | null;
    kbli_codes?: string[] | null;
    legal_form?: string | null;
    founded_year?: number | null;
    instagram_url?: string | null;
    facebook_url?: string | null;
    whatsapp_number?: string | null;
    status?: string;
    source: string;
    confidence_tier?: string | null;
    match_score: number;
    raw_data: any | null;
    organization_id: string | null;
    created_at: string;
    email_verification_status?: string | null;
    email_verified_at?: string | null;
    phone_verification_status?: string | null;
    phone_line_type?: string | null;
    phone_verified_at?: string | null;
}

export interface CompanyIntelligenceSearchResult {
    total: number;
    limit: number;
    results: CompanyIntelligenceItem[];
}

export interface CompanyIntelligenceProfileResponse {
    id: string;
    external_id: string;
    name: string;
    ticker: string | null;
    domain: string | null;
    phone: string | null;
    email: string | null;
    description: string;
    industry: string | null;
    location: string;
    employee_count: number;
    revenue: number | null;
    financial_status: string;
    source: string;
    confidence_tier?: string | null;
    match_score: number;
    raw_data: any | null;
    organization_id: string | null;
    created_at: string;
    email_verification_status?: string | null;
    email_verified_at?: string | null;
    phone_verification_status?: string | null;
    phone_line_type?: string | null;
    phone_verified_at?: string | null;
}

export interface SaveToCrmResponse {
    id: string;
    company_id: string;
    name: string;
    email: string;
    domain: string;
    website: string;
    industry: string;
    location: string;
    employee_count: number;
    revenue: number;
    financial_status: string;
    source: string;
    enrichment_status: string;
    enriched_at: string;
    company_intelligence_id: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface TargetCompanyDetailResponse {
    id: string;
    name: string;
    email: string | null;
    domain: string | null;
    website: string | null;
    industry: string | null;
    location: string | null;
    // Fase 1 widened CrmCompany subset (copied from the cache row on save).
    address_line?: string | null;
    kabupaten?: string | null;
    kecamatan?: string | null;
    postal_code?: string | null;
    nib?: string | null;
    npwp?: string | null;
    kbli_codes?: string[] | null;
    legal_form?: string | null;
    founded_year?: number | null;
    employee_range: string | null;
    employee_count: number | null;
    revenue: number | null;
    financial_status: string | null;
    status: string;
    enrichment_status: string | null;
    enriched_at: string | null;
    company_intelligence_id: string | null;
    description: string | null;
    source: string | null;
    organization_id: string | null;
    field_provenance: Record<string, { source?: string; collected_at?: string; method?: string; confidence?: string }> | null;
    key_people: any[];
    subsidiaries: any[];
    social: CompanySocialInfo | null;
    // CrmCompany carries no phone, so only the email verification pair exists here.
    email_verification_status?: string | null;
    email_verified_at?: string | null;
    created_at: string;
    updated_at: string;
}

// Normalized shape B2's CompanyProfile360Client consumes, regardless of
// whether the underlying data came from a saved CrmCompany or a still-only-
// cached search result - see lib/api/organization.ts.
export interface CompanyProfile360 {
    id: string;
    source: "saved" | "search";
    crmCompanyId?: string;
    cacheId?: string;
    // The shared cross-tenant Organization this record resolves to, if any -
    // null when this cache row/CrmCompany hasn't been linked/promoted yet.
    // Signals (B4) are keyed by this id, not by `id` above (which is a
    // cacheId or crmCompanyId, neither of which the Signal Engine writes to).
    organizationId: string | null;
    name: string;
    email: string | null;
    domain: string | null;
    phone: string | null;
    industry: string | null;
    location: string | null;
    employeeCount: number | null;
    revenue: number | null;
    financialStatus: string | null;
    description: string | null;
    // Provider source (google_maps/serpapi/groq/manual/...) for attribution -
    // read from field_provenance where available, falling back to the
    // row-level source for search results (which always have one).
    providerSource: string | null;
    confidenceTier: string | null;
    fieldProvenance: TargetCompanyDetailResponse["field_provenance"];
    keyPeople: Array<{ id?: string; name: string; role?: string }>;
    subsidiaries: any[];
    social: CompanySocialInfo | null;
    emailVerificationStatus: string | null;
    emailVerifiedAt: string | null;
    phoneVerificationStatus: string | null;
    phoneLineType: string | null;
    phoneVerifiedAt: string | null;
    createdAt: string;
}

export interface MyTargetCompaniesSummary {
    total_companies: number;
    new_this_week: number;
    active_recent: number;
    active_percentage: number;
}

export interface MyTargetCompaniesResponse {
    meta: {
        total: number;
        page: number;
        limit: number;
    };
    summary: MyTargetCompaniesSummary;
    data: CompanyIntelligenceItem[];
}

// ===== Bulk import (CSV parsed client-side, POSTed as JSON) =====

// One parsed spreadsheet row for POST /company-intelligence/bulk.
// Only `name` is required; the API silently drops values that fail its
// lenient validation (nib/npwp format, kbli code shape) instead of 400ing.
export interface CompanyImportRow {
    name: string;
    domain?: string;
    website?: string;
    email?: string;
    phone?: string;
    industry?: string;
    location?: string;
    kabupaten?: string;
    kecamatan?: string;
    postal_code?: string;
    address_line?: string;
    nib?: string;
    npwp?: string;
    // Accepts a list or a delimited string like "4663;4752".
    kbli_codes?: string | string[];
    legal_form?: string;
    founded_year?: number;
    employee_count?: number;
    financial_status?: string;
    description?: string;
}

export interface CompanyBulkImportPayload {
    file_name?: string;
    rows: CompanyImportRow[];
}

// 201 response of POST /company-intelligence/bulk. queued_rows = rows that
// survived enqueue-time dedup and became the job's payload; skipped_rows =
// dropped as duplicates (within the request or vs existing tenant-visible
// cache rows) before any background processing started.
export interface CompanyBulkImportResponse {
    total_rows: number;
    queued_rows: number;
    skipped_rows: number;
    // Null when every row deduped against existing data and no job was created.
    job_id: string | null;
}

// Job statuses are human-readable strings shared with the subscriber import
// machinery (contact_import_jobs table).
export type CompanyImportJobStatus =
    | "Queued for Processing"
    | "Processing"
    | "Queued for Rollback"
    | "Rollback Processing"
    | "Completed"
    | "Failed"
    | "Stopped"
    | "Rolled Back";

// GET /company-intelligence/bulk/{job_id} — same shape as the subscriber
// import job detail the UI polls (no websocket for import progress).
export interface CompanyImportJobResponse {
    id: string;
    target: string;
    status: CompanyImportJobStatus | string;
    file_name: string | null;
    current_batch: number;
    total_batches: number;
    total_rows: number;
    processed_rows: number;
    created_rows: number;
    skipped_rows: number;
    failed_rows: number;
    messages: string[];
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

