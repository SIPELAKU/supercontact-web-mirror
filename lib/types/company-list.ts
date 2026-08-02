import { CompanyIntelligenceSearchPayload } from "./company-intelligence";

export type CompanyListType = "static" | "dynamic";

export interface CompanyListItem {
    id: string;
    company_id: string;
    name: string;
    description: string | null;
    list_type: CompanyListType;
    filter_criteria: CompanyIntelligenceSearchPayload | null;
    member_count: number;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface CompanyListsResponse {
    meta: { total: number; page: number; limit: number };
    data: CompanyListItem[];
}

export interface CompanyListMemberItem {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    location: string | null;
    employee_count: number | null;
    revenue: number | null;
    financial_status: string | null;
}

export interface CompanyListMembersResponse {
    meta: { total: number; page: number; limit: number };
    data: CompanyListMemberItem[];
}

export interface CreateCompanyListPayload {
    name: string;
    description?: string;
    list_type: CompanyListType;
    filter_criteria?: CompanyIntelligenceSearchPayload;
}

export interface UpdateCompanyListPayload {
    name?: string;
    description?: string;
    filter_criteria?: CompanyIntelligenceSearchPayload;
}
