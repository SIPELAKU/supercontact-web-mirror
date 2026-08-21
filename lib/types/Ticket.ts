import { TicketCategory, TicketTag } from "./TicketSettings";

export type TicketPriority = "Urgent" | "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "Pending" | "On-hold" | "In Progress" | "Solved" | "Closed";
export type TicketType = "Question" | "Incident" | "Problem" | "Task";

export interface Agent {
    id: string;
    fullname: string;
    email: string;
}

export interface TicketAttachment {
    id: string;
    ticket_id: string;
    comment_id?: string | null;
    filename: string;
    content_type?: string | null;
    size_bytes?: number | null;
    media_url: string;
    created_at: string;
    uploaded_by?: Agent | null;
}

export interface TicketSlaSummary {
    policy_id?: string | null;
    policy_name?: string | null;
    first_response_due_at?: string | null;
    first_response_met_at?: string | null;
    first_response_breached: boolean;
    resolution_due_at?: string | null;
    resolution_met_at?: string | null;
    resolution_breached: boolean;
}

export interface LinkedTicketSummary {
    id: string;
    ticket_code: string;
    subject: string;
    status: TicketStatus;
}

// Phase 5 / Inc 3: typed link vocabulary. Each link is stored inverse-mirrored
// on the backend, so a ticket's own row already carries its perspective's type
// (e.g. the "blocks" side sees "blocks", the other side sees "blocked_by").
export type TicketLinkType =
    | "related"
    | "duplicate"
    | "blocks"
    | "blocked_by"
    | "parent_of"
    | "child_of";

// Human labels used both when creating a link (picker) and when rendering an
// existing one (panel), e.g. "Blocks #123", "Blocked by #45", "Related to #9".
export const TICKET_LINK_TYPE_LABELS: Record<TicketLinkType, string> = {
    related: "Related to",
    duplicate: "Duplicate of",
    blocks: "Blocks",
    blocked_by: "Blocked by",
    parent_of: "Parent of",
    child_of: "Child of",
};

// Options offered in the link-type picker (this ticket's own perspective).
export const TICKET_LINK_TYPE_OPTIONS: { value: TicketLinkType; label: string }[] = [
    { value: "related", label: "Related to" },
    { value: "duplicate", label: "Duplicate of" },
    { value: "blocks", label: "Blocks" },
    { value: "blocked_by", label: "Blocked by" },
    { value: "parent_of", label: "Parent of" },
    { value: "child_of", label: "Child of" },
];

export interface TicketLink {
    id: string;
    link_type: TicketLinkType;
    created_at: string;
    other_ticket: LinkedTicketSummary;
}

export interface TicketComment {
    id: string;
    ticket_id: string;
    author?: Agent | null;
    body: string;
    is_internal_note: boolean;
    created_at: string;
    updated_at: string;
    attachments: TicketAttachment[];
    source_message_id?: string | null;
    delivery_status?: string | null;
    is_customer_reply?: boolean;
}

export interface Ticket {
    id: string;
    ticket_code?: string;
    subject: string;
    description: string;
    customer_name: string;
    customer_email: string;
    priority: TicketPriority;
    status: TicketStatus;
    type?: TicketType | null;
    assigned_agent_id?: string;
    assigned_agent?: Agent;
    created_by?: Agent;
    category_id?: string | null;
    category?: TicketCategory | null;
    tags?: TicketTag[];
    custom_fields?: Record<string, any>;
    attachments?: TicketAttachment[];
    sla?: TicketSlaSummary | null;
    merged_into_ticket_id?: string | null;
    source_conversation_id?: string | null;
    // Phase 5 / Inc 7: optional ticket form this ticket was created with.
    form_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreateTicketDTO {
    subject: string;
    description: string;
    customer_name: string;
    customer_email: string;
    priority: TicketPriority;
    status: TicketStatus;
    type?: TicketType | null;
    assigned_agent_id?: string;
    category_id?: string | null;
    tags?: string[];
    custom_fields?: Record<string, any>;
    form_id?: string | null;
}

export interface UpdateTicketDTO {
    subject?: string;
    description?: string;
    customer_name?: string;
    customer_email?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    type?: TicketType | null;
    assigned_agent_id?: string;
    category_id?: string | null;
    tags?: string[];
    custom_fields?: Record<string, any>;
    form_id?: string | null;
}

export interface TicketResponse {
    data: {
        tickets: Ticket[];
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    success: boolean;
    message: string;
}

export interface SingleTicketResponse {
    data: Ticket;
    success: boolean;
    message: string;
}
