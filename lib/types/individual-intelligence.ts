export interface KeyPerson {
    id: string;
    name: string;
    role: string;
    group: string;
    lastupdate: string;
    avatar_url?: string; // Added for UI if available, though not in spec
}

export interface IndividualIntelligenceItem {
    id?: string;
    crm_company_id?: string;
    company_name: string;
    company_description: string;
    industry: string;
    location: string;
    description: string;
    key_people: KeyPerson[];
}

export interface IndividualIntelligenceResponse {
    success: boolean;
    data: {
        meta: {
            total: number;
            page: number;
            limit: number;
        };
        data: IndividualIntelligenceItem[];
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface SaveContactsPerson {
    crm_company_id: string;
    person_id?: string;
    name: string;
    role?: string;
}

export interface SaveContactsPayload {
    people: SaveContactsPerson[];
}

export interface SaveContactsResponse {
    success: boolean;
    data: {
        total: number;
        created_count: number;
        existing_count: number;
        contacts: {
            crm_company_id: string;
            created: boolean;
            contact_id: string;
            name: string;
            position: string;
            company: string;
        }[];
    };
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface IndividualIntelligenceParams {
    industry?: string;
    location?: string;
    search?: string;
    page?: number;
    limit?: number;
}
