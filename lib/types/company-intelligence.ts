export interface CompanySocialInfo {
    category: string | null;
    follower_count: number | null;
    is_verified: boolean | null;
    page_url: string;
    checked_at: string;
}

// One platform's follower/verified snapshot, written by Fase E's
// POST /company-intelligence/{cache_id}/enrich-social-profiles under
// raw_data.social_profiles (platform keys: instagram/facebook/threads/x).
// Deliberately loose - the JSONB blob is enricher-owned and additive, so
// every field is optional and unknown platforms are just extra keys.
export interface SocialProfileMetrics {
    followers?: number;
    verified?: boolean | null;
    bio?: string;
    checked_at?: string;
}

export type SocialProfilesMap = Record<string, SocialProfileMetrics>;

// ===== POST /company-intelligence/{cache_id}/enrich-social-profiles =====

// Per-platform outcome of one refresh run. followers/verified only arrive on
// "ok" (verified stays null where the platform API exposes no verification
// signal, e.g. IG Business Discovery).
export interface SocialProfileEnrichResultItem {
    platform: string;
    status: "ok" | "not_configured" | "no_handle" | "failed" | string;
    followers?: number | null;
    verified?: boolean | null;
}

export interface SocialProfilesEnrichResponse {
    results: SocialProfileEnrichResultItem[];
}

export interface CompanyIntelligenceSearchPayload {
    industries: string[];
    locations: string[];
    // Free-text kabupaten/kota (no fixed list, unlike `locations`). Filters
    // already-stored rows AND narrows the live Google Maps query to that
    // place instead of just the province - this is what makes "search per
    // kabupaten, one at a time" actually reach new companies via Maps.
    kabupaten?: string[];
    // Omitted (not just absent bounds) unless the user has moved the range
    // slider off its default - the backend excludes any candidate with no
    // employee_count when either bound is present, which would otherwise
    // silently zero out every freshly-discovered result (Maps/SerpAPI never
    // fill headcount) on a plain, untouched Discover search.
    employee_min?: number;
    employee_max?: number;
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
    // Fase D social columns (fill-only, populated by the website crawler
    // and future enrichers).
    linkedin_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
    threads_url?: string | null;
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
    // Fase 1 widened cache columns (all nullable server-side) - the API's
    // profile response extends CompanyIntelligenceItem, so these come back
    // here too.
    address_line?: string | null;
    kabupaten?: string | null;
    kecamatan?: string | null;
    postal_code?: string | null;
    nib?: string | null;
    npwp?: string | null;
    kbli_codes?: string[] | null;
    legal_form?: string | null;
    founded_year?: number | null;
    // Social profile columns (Fase 1 trio + Fase D additions).
    instagram_url?: string | null;
    facebook_url?: string | null;
    whatsapp_number?: string | null;
    linkedin_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
    threads_url?: string | null;
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
    // Social profile URLs - cache-only columns, read through from the linked
    // cache row while company_intelligence_id is set; all null otherwise.
    instagram_url?: string | null;
    facebook_url?: string | null;
    whatsapp_number?: string | null;
    linkedin_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
    threads_url?: string | null;
    // CrmCompany carries no phone, so only the email verification pair exists here.
    email_verification_status?: string | null;
    email_verified_at?: string | null;
    // Phase 1: tenant-defined attributes (entity_type `crm_company`), strict.
    custom_fields?: Record<string, unknown>;
    // Phase 3 commercial reference columns (spec D7). Optional so a leg that
    // has not been deployed yet still parses.
    customer_type_id?: string | null;
    region_id?: string | null;
    customer_type?: { id: string; code: string; name: string } | null;
    region?: { id: string; code: string; name: string; level: string } | null;
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
    // Fase 1 legal/registry columns, camelCased - present on both underlying
    // resources (cache row and CrmCompany copy), rendered by LegalRegistryCard.
    addressLine: string | null;
    kabupaten: string | null;
    kecamatan: string | null;
    postalCode: string | null;
    nib: string | null;
    npwp: string | null;
    kbliCodes: string[] | null;
    legalForm: string | null;
    foundedYear: number | null;
    // Provider source (google_maps/serpapi/groq/manual/...) for attribution -
    // read from field_provenance where available, falling back to the
    // row-level source for search results (which always have one).
    providerSource: string | null;
    confidenceTier: string | null;
    fieldProvenance: TargetCompanyDetailResponse["field_provenance"];
    keyPeople: Array<{ id?: string; name: string; role?: string }>;
    subsidiaries: any[];
    social: CompanySocialInfo | null;
    // Social profile URLs, camelCased - cache-only columns (Fase 1 trio +
    // Fase D additions, crawler/manual-filled), read through the linked
    // cache row on the saved path. Rendered by SocialPresenceCard.
    instagramUrl: string | null;
    facebookUrl: string | null;
    whatsappNumber: string | null;
    linkedinUrl: string | null;
    tiktokUrl: string | null;
    xUrl: string | null;
    threadsUrl: string | null;
    // Fase E per-platform metrics from raw_data.social_profiles - null when
    // never enriched, and always null on the saved path (whose detail
    // response carries no raw_data). "Refresh social data" still works there
    // via the linked cacheId and merges its results into this map in state.
    socialProfiles: SocialProfilesMap | null;
    emailVerificationStatus: string | null;
    emailVerifiedAt: string | null;
    phoneVerificationStatus: string | null;
    phoneLineType: string | null;
    phoneVerifiedAt: string | null;
    // Phase 3 commercial reference columns (spec I5). Stored on the CrmCompany
    // row only, so a still-only-cached search result carries nulls, and the
    // editable card is mounted only for `source === "saved"`.
    customerTypeId: string | null;
    customerTypeName: string | null;
    regionId: string | null;
    regionName: string | null;
    // Phase 1 custom fields - stored on the CrmCompany row only, so a
    // still-only-cached search result carries an empty map.
    customFields: Record<string, unknown>;
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
    // Source label written on the cache rows this job creates ("bulk_import"
    // for the endpoint; loader CLIs pass e.g. "pse_komdigi"/"kemenperin").
    source: string;
    // True only for CLI --shared platform-seeding jobs — drives the Import
    // Center's "Platform seed" badge. Tenant endpoints never list those
    // today, so this is False everywhere the UI can currently see.
    is_shared_seed: boolean;
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

// GET /company-intelligence/bulk — the Import Center's job table page.
export interface CompanyImportJobListResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    items: CompanyImportJobResponse[];
}

// GET /company-intelligence/bulk/{job_id}/companies — page of the cache rows
// one bulk-import job created (rolled-back rows disappear along with their
// bookkeeping rows; promoted-to-shared rows keep showing).
export interface CompanyImportJobCompaniesResponse {
    total: number;
    page: number;
    limit: number;
    items: CompanyIntelligenceItem[];
}

// PATCH /company-intelligence/bulk/{job_id} — status guards mirror the
// subscriber import machinery: stop only while queued/processing, continue
// only when Stopped, rollback when Stopped/Completed, replay when
// Failed/Rolled Back.
export type CompanyImportJobAction = "stop" | "continue" | "rollback" | "replay";

// ===== GET /company-intelligence/sources-status (Data Sources page) =====

export interface SourcesStatusProvider {
    key: string;
    label: string;
    // "provider" search/lookup clients v1; Fase E adds kind:"enricher" rows -
    // render this data-driven, never off a hardcoded list.
    kind: string;
    // Boolean only - the API never leaks key material into this response.
    configured: boolean;
    detail: string | null;
}

export interface SourcesStatusCacheBySource {
    source: string;
    count: number;
    last_created_at: string | null;
}

export interface SourcesStatusLoaderRun {
    source: string;
    last_completed_at: string | null;
    last_job_created_rows: number | null;
}

export interface SourcesStatusResponse {
    providers: SourcesStatusProvider[];
    cache_by_source: SourcesStatusCacheBySource[];
    kbli_map_count: number;
    loader_last_runs: SourcesStatusLoaderRun[];
}


// Search Assist paste-back - PATCH /company-intelligence/{cacheId}/social-links.
// Payload carries only the fields being changed (null clears a link); the
// response echoes all six stored values, already canonicalized by the API
// (twitter.com -> x.com, threads.net -> threads.com, share/query junk
// stripped, LinkedIn company pages only).
export interface SocialLinksUpdatePayload {
    instagram_url?: string | null;
    facebook_url?: string | null;
    linkedin_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
    threads_url?: string | null;
}

export interface SocialLinksValues {
    instagram_url: string | null;
    facebook_url: string | null;
    linkedin_url: string | null;
    tiktok_url: string | null;
    x_url: string | null;
    threads_url: string | null;
}
