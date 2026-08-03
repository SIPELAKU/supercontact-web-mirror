export interface TicketCategory {
    id: string;
    company_id: string;
    name: string;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface TicketMacro {
    id: string;
    company_id: string;
    name: string;
    body_template: string;
    field_changes: Record<string, any>;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface TicketTag {
    id: string;
    name: string;
    created_at: string;
}

export type TicketCustomFieldType = "text" | "number" | "date" | "boolean" | "select";

export interface TicketCustomFieldDefinition {
    id: string;
    company_id: string;
    field_key: string;
    label: string;
    field_type: TicketCustomFieldType;
    select_options: string[] | null;
    is_required: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface WeekdayHours {
    start: string;
    end: string;
    closed: boolean;
}

export const WEEKDAY_LABELS: Record<string, string> = {
    "1": "Monday",
    "2": "Tuesday",
    "3": "Wednesday",
    "4": "Thursday",
    "5": "Friday",
    "6": "Saturday",
    "7": "Sunday",
};

export const DEFAULT_WEEKLY_HOURS: Record<string, WeekdayHours> = {
    "1": { start: "09:00", end: "17:00", closed: false },
    "2": { start: "09:00", end: "17:00", closed: false },
    "3": { start: "09:00", end: "17:00", closed: false },
    "4": { start: "09:00", end: "17:00", closed: false },
    "5": { start: "09:00", end: "17:00", closed: false },
    "6": { start: "09:00", end: "17:00", closed: true },
    "7": { start: "09:00", end: "17:00", closed: true },
};

export interface BusinessHoursCalendar {
    id: string;
    company_id: string;
    name: string;
    timezone: string;
    weekly_hours: Record<string, WeekdayHours>;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export type TicketSlaPriority = "High" | "Medium" | "Low";

export interface TicketSlaPolicy {
    id: string;
    company_id: string;
    name: string;
    priority: TicketSlaPriority | null;
    category_id: string | null;
    first_response_target_minutes: number;
    resolution_target_minutes: number;
    business_hours_calendar_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
