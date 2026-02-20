export interface CompanyIntelligenceSearchPayload {
    industries: string[];
    locations: string[];
    employee_min: number;
    employee_max: number;
    financial_status: string[];
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
    description: string;
    industry: string;
    location: string;
    employee_count: number;
    revenue: string;
    financial_status: string;
    status?: string;
    source: string;
    match_score: number;
    raw_data: any | null;
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
    description: string;
    industry: string;
    location: string;
    employee_count: number;
    revenue: string;
    financial_status: string;
    source: string;
    match_score: number;
    raw_data: any | null;
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

export interface IndustryLeader {
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

export interface IndustryLeadersGroup {
    industry: string;
    leaders: IndustryLeader[];
}

export interface IndustryLeadersResponse {
    success: boolean;
    data: {
        data: IndustryLeadersGroup[];
    };
    error: string | null;
}
