export type IndustryLeaderCompany = {
    id: string;
    name: string;
    location: string;
    employees: number;
    revenue: string;
    financialStatus: FinancialStatus;
    industries: string[];
    source: string;
    confidenceTier?: string | null;
    matchPercentage?: number;
    description?: string;
    website?: string;
    email?: string;
    phone?: string;
};

export type FinancialStatus = "IPO" | "Profitabel" | "Series A" | "Series B" | "Series C";

export type FilterCriteria = {
    industries: string[];
    locations: string[];
    employeeRange: {
        min: number;
        max: number;
    };
    financialStatuses: FinancialStatus[];
    // Reachability + trust filters (B1) - mirrors the backend's
    // has_phone/has_domain/min_confidence/exclude_saved search params.
    hasPhone: boolean;
    hasDomain: boolean;
    minConfidence: string | null;
    excludeSaved: boolean;
};

export type LocationOption = {
    label: string;
    value: string;
};

export const DEFAULT_FILTER_CRITERIA: FilterCriteria = {
    industries: [],
    locations: [],
    employeeRange: {
        min: 200,
        max: 1000,
    },
    financialStatuses: [],
    hasPhone: false,
    hasDomain: false,
    minConfidence: null,
    excludeSaved: false,
};

export const FINANCIAL_STATUS_OPTIONS: FinancialStatus[] = [
    "Profitabel",
    "Series A",
    "Series B",
    "Series C",
    "IPO",
];
