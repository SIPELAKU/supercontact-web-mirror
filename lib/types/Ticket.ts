export type TicketPriority = "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In Progress" | "Closed";

export interface Agent {
    id: string;
    fullname: string;
    email: string;
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
}

export interface UpdateTicketDTO {
    subject?: string;
    description?: string;
    customer_name?: string;
    customer_email?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    assigned_agent_id?: string;
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
