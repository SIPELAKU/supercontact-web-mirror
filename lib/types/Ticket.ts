import { TicketCategory, TicketTag } from "./TicketSettings";

export type TicketPriority = "Urgent" | "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In Progress" | "Closed";

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

export interface TicketLink {
    id: string;
    link_type: string;
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
    assigned_agent_id?: string;
    category_id?: string | null;
    tags?: string[];
    custom_fields?: Record<string, any>;
}

export interface UpdateTicketDTO {
    subject?: string;
    description?: string;
    customer_name?: string;
    customer_email?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    assigned_agent_id?: string;
    category_id?: string | null;
    tags?: string[];
    custom_fields?: Record<string, any>;
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
