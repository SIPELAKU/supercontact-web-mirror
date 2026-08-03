export type SuppressionEntryType = "email" | "phone" | "domain" | "organization_id";

export interface SuppressionEntryItem {
    id: string;
    company_id: string;
    entry_type: SuppressionEntryType;
    reason: string | null;
    requested_by: string | null;
    created_at: string;
}

export interface SuppressionEntriesResponse {
    meta: { total: number; page: number; limit: number };
    data: SuppressionEntryItem[];
}

export interface CreateSuppressionEntryPayload {
    entry_type: SuppressionEntryType;
    value: string;
    reason?: string;
}

export type DsrRequestType = "access" | "deletion" | "correction";
export type DsrRequestStatus = "pending" | "in_progress" | "completed" | "rejected";

export interface DsrRequestItem {
    id: string;
    company_id: string;
    request_type: DsrRequestType;
    subject_name: string;
    subject_email_or_phone: string;
    details: string | null;
    status: DsrRequestStatus;
    requested_by: string | null;
    resolved_by: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface DsrRequestsResponse {
    meta: { total: number; page: number; limit: number };
    data: DsrRequestItem[];
}

export interface CreateDsrRequestPayload {
    request_type: DsrRequestType;
    subject_name: string;
    subject_email_or_phone: string;
    details?: string;
}
