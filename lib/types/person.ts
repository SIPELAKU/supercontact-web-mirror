export interface PersonItem {
    id: string;
    organization_id: string;
    full_name: string;
    title: string | null;
    normalized_title: string | null;
    email: string | null;
    phone: string | null;
    linkedin_url: string | null;
    source: string | null;
    created_at: string;
}

export interface PersonListResponse {
    data: PersonItem[];
}

export interface SeniorityGroup {
    band: string;
    label: string;
    people: PersonItem[];
}

export interface SeniorityGroupedResponse {
    groups: SeniorityGroup[];
}
