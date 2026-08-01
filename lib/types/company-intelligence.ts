export interface CompanyIntelligenceSearchPayload {
    industries: string[];
    locations: string[];
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
    status?: string;
    source: string;
    confidence_tier?: string | null;
    match_score: number;
    raw_data: any | null;
    organization_id: string | null;
    created_at: string;
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

export interface MyTopCompany {
    rank: number;
    company_id: string;
    name: string;
    revenue: number;
    employee_count: number;
    employee_range: string;
    market_position: string;
    description: string;
    location: string;
    enriched: boolean;
}

export interface MyTopCompaniesGroup {
    industry: string;
    leaders: MyTopCompany[];
}

export interface MyTopCompaniesResponse {
    success: boolean;
    data: {
        data: MyTopCompaniesGroup[];
    };
    error: string | null;
}
