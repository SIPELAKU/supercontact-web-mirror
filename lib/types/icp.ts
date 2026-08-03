import { CompanyIntelligenceSearchPayload } from "./company-intelligence";

export interface IcpAttributeStat {
    value: string | null;
    sample_size: number;
    distribution: Array<{ value: string; count: number }>;
}

export interface IcpEmployeeRangeStat {
    median: number | null;
    employee_min: number | null;
    employee_max: number | null;
    sample_size: number;
}

export interface IcpAttributeBreakdown {
    industry: IcpAttributeStat | null;
    location: IcpAttributeStat | null;
    employee_range: IcpEmployeeRangeStat | null;
    financial_status: IcpAttributeStat | null;
}

export interface IcpDeriveResult {
    draft_criteria: CompanyIntelligenceSearchPayload;
    attribute_breakdown: IcpAttributeBreakdown;
    sample_size: number;
    source_deal_ids: string[];
}

export interface IcpProfileItem {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    derived_criteria: CompanyIntelligenceSearchPayload;
    attribute_breakdown: IcpAttributeBreakdown;
    sample_size: number;
    source_deal_ids: string[];
    generated_list_id: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface IcpProfilesResponse {
    meta: { total: number; page: number; limit: number };
    data: IcpProfileItem[];
}

export interface IcpScoreComponent {
    dimension: string;
    label: string;
    matched: boolean;
    weight: number;
    contribution: number;
}

export interface IcpScoredCompanyItem {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    location: string | null;
    employee_count: number | null;
    revenue: number | null;
    financial_status: string | null;
    match_score: number | null;
    score_breakdown: IcpScoreComponent[];
}

export interface IcpLookalikesResponse {
    meta: { total: number; page: number; limit: number };
    data: IcpScoredCompanyItem[];
}

export interface DeriveIcpPayload {
    deal_ids?: string[];
}

export interface CreateIcpProfilePayload {
    name: string;
    description?: string;
    derived_criteria: CompanyIntelligenceSearchPayload;
    attribute_breakdown: IcpAttributeBreakdown;
    source_deal_ids: string[];
    sample_size: number;
    create_list?: boolean;
}

export interface ClosedWonDeal {
    id: string;
    companyLabel: string;
    contactName: string;
    productName: string;
    expectedCloseDate: string;
}
