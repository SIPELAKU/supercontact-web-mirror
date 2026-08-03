export type TicketAutomationTriggerType = "on_create" | "on_update";

export type TicketConditionOp = "eq" | "neq" | "in" | "changed_to" | "changed_from";

export interface TicketConditionClause {
    field: string;
    op: TicketConditionOp;
    value: any;
}

export interface TicketAutomationAction {
    type: "assign" | "tag" | "notify" | "change_status";
    assigned_agent_id?: string;
    tags?: string[];
    title?: string;
    description?: string;
    status?: string;
}

export interface TicketAutomationRule {
    id: string;
    company_id: string;
    name: string;
    is_enabled: boolean;
    priority: number;
    trigger_type: TicketAutomationTriggerType;
    conditions: { all?: TicketConditionClause[] };
    actions: TicketAutomationAction[];
    created_at: string;
    updated_at: string;
}
