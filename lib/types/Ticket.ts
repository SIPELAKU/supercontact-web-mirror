export type TicketPriority = "High" | "Medium" | "Low";
export type TicketStatus = "Open" | "In Progress" | "Closed";

export interface Ticket {
    id: string;
    subject: string;
    description: string;
    customer_name: string;
    customer_email: string;
    priority: TicketPriority;
    status: TicketStatus;
    assigned_agent_id?: string;
    assigned_agent_name?: string; // Optional for UI display if backend joins it
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
