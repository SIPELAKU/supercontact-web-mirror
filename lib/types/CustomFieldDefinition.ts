// lib/types/CustomFieldDefinition.ts
//
// Generic custom-field definitions (Phase 1, spec D3). One table serves four
// entities; `entity_type` tells them apart. The visibility-condition shape is
// IDENTICAL to the ticket module's, so its types are re-exported rather than
// copied - the evaluator in lib/utils/ticketFieldVisibility.ts is reused too.

import type {
  TicketVisibilityClause,
  TicketVisibilityCondition,
  TicketVisibilityOp,
} from "@/lib/types/TicketSettings";

export type CustomFieldEntityType = "product" | "contact" | "crm_company" | "quotation";

/** `multi_select` is new in the generic table (value = list of option strings). */
export type CustomFieldType = "text" | "number" | "date" | "boolean" | "select" | "multi_select";

export type VisibilityOp = TicketVisibilityOp;
export type VisibilityClause = TicketVisibilityClause;
export type VisibilityCondition = TicketVisibilityCondition;

export interface CustomFieldDefinition {
  id: string;
  company_id: string;
  entity_type: CustomFieldEntityType;
  field_key: string;
  label: string;
  field_type: CustomFieldType;
  select_options: string[] | null;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  visibility_condition: VisibilityCondition | null;
  created_at: string;
  updated_at: string;
}

/**
 * The subset the pure helpers (validation, visibility, formatting) need. Lets
 * tests and callers build definitions without ids and timestamps.
 */
export type CustomFieldDefinitionLike = Pick<
  CustomFieldDefinition,
  "field_key" | "label" | "field_type" | "select_options" | "is_required"
> & {
  visibility_condition?: VisibilityCondition | null;
  is_active?: boolean;
  display_order?: number;
};

export interface CustomFieldDefinitionCreate {
  entity_type: CustomFieldEntityType;
  field_key: string;
  label: string;
  field_type: CustomFieldType;
  select_options?: string[] | null;
  is_required?: boolean;
  display_order?: number;
  visibility_condition?: VisibilityCondition | null;
}

/** `entity_type`, `field_key` and `field_type` are immutable (API `extra="forbid"`). */
export interface CustomFieldDefinitionUpdate {
  label?: string;
  select_options?: string[] | null;
  is_required?: boolean;
  is_active?: boolean;
  display_order?: number;
  visibility_condition?: VisibilityCondition | null;
}

export type CustomFieldDefinitionSortBy = "display_order" | "label" | "field_key" | "created_at";

export interface CustomFieldDefinitionListParams {
  entity_type?: CustomFieldEntityType | null;
  active_only?: boolean;
  search?: string;
  page?: number;
  /** The endpoint caps this at 100 (== MAX_ACTIVE_DEFINITIONS_PER_ENTITY). */
  limit?: number;
  sort_by?: CustomFieldDefinitionSortBy;
  sort_order?: "asc" | "desc";
  include_total?: boolean;
}

/** Paginated - NOT the ticket module's `{data:[...]}` wrapper. */
export interface CustomFieldDefinitionListResponse {
  total: number | null;
  page: number;
  limit: number;
  total_pages: number | null;
  definitions: CustomFieldDefinition[];
}

export interface DeleteCustomFieldDefinitionResponse {
  deleted: boolean;
  id: string;
}

/** Values as stored on the entity's JSONB column. The API types them as `Any`. */
export type CustomFieldValues = Record<string, unknown>;
