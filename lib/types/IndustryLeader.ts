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
};

export const FINANCIAL_STATUS_OPTIONS: FinancialStatus[] = [
    "Profitabel",
    "Series A",
    "Series B",
    "Series C",
    "IPO",
];
