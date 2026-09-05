// lib/constants/custom-field-entities.ts
//
// The four entities the generic custom-field table serves, and the built-in
// names a visibility clause may reference per entity. Mirrors the API's
// BUILTIN_CONDITION_FIELDS_BY_ENTITY exactly - a clause naming anything else
// is refused server-side with a 400.

import type { CustomFieldEntityType, CustomFieldType } from "@/lib/types/CustomFieldDefinition";

export const CUSTOM_FIELD_ENTITY_OPTIONS: { value: CustomFieldEntityType; label: string }[] = [
  { value: "product", label: "Produk" },
  { value: "contact", label: "Kontak" },
  { value: "crm_company", label: "Perusahaan (CRM)" },
  { value: "quotation", label: "Quotation" },
];

export const CUSTOM_FIELD_ENTITY_LABELS: Record<CustomFieldEntityType, string> = Object.fromEntries(
  CUSTOM_FIELD_ENTITY_OPTIONS.map((o) => [o.value, o.label])
) as Record<CustomFieldEntityType, string>;

export interface BuiltinConditionField {
  value: string;
  label: string;
  /** Known value set, so the clause builder can offer a picker instead of free text. */
  options: string[];
}

export const BUILTIN_CONDITION_FIELDS_BY_ENTITY: Record<CustomFieldEntityType, BuiltinConditionField[]> = {
  product: [
    {
      value: "product_type",
      label: "Tipe produk",
      options: ["goods", "service", "subscription", "bundle", "digital"],
    },
    { value: "status", label: "Status", options: ["active", "archived"] },
  ],
  quotation: [
    {
      value: "quotation_status",
      label: "Status quotation",
      options: ["draft", "pending_approval", "sent", "accepted", "rejected", "expired"],
    },
  ],
  // Phase 3: the two commercial reference columns. Mirrors the API's
  // BUILTIN_CONDITION_FIELDS_BY_ENTITY (spec E10) - this is the list a tenant
  // `field_key` may NOT shadow, so a custom "region_id" is refused rather than
  // quietly shadowing the real column. The value sets are per-tenant uuids, so
  // there is no closed option list to offer; a clause on them is free text.
  contact: [
    { value: "customer_type_id", label: "Tipe pelanggan", options: [] },
    { value: "region_id", label: "Wilayah", options: [] },
  ],
  crm_company: [
    { value: "customer_type_id", label: "Tipe pelanggan", options: [] },
    { value: "region_id", label: "Wilayah", options: [] },
  ],
};

/** Just the reserved names for an entity - what a field_key may NOT shadow. */
export function builtinNamesFor(entityType: CustomFieldEntityType): string[] {
  return (BUILTIN_CONDITION_FIELDS_BY_ENTITY[entityType] ?? []).map((f) => f.value);
}

export const FIELD_TYPE_OPTIONS: { value: CustomFieldType; label: string }[] = [
  { value: "text", label: "Teks" },
  { value: "number", label: "Angka" },
  { value: "date", label: "Tanggal" },
  { value: "boolean", label: "Ya/Tidak" },
  { value: "select", label: "Pilihan" },
  { value: "multi_select", label: "Multi-select" },
];

export const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = Object.fromEntries(
  FIELD_TYPE_OPTIONS.map((o) => [o.value, o.label])
) as Record<CustomFieldType, string>;

/** Same rule as the API: a lower-case slug, letter first, at most 60 chars. */
export const FIELD_KEY_PATTERN = /^[a-z][a-z0-9_]{0,59}$/;

export const MAX_ACTIVE_DEFINITIONS_PER_ENTITY = 100;

/** Types whose definition carries `select_options`. */
export function usesOptions(fieldType: CustomFieldType): boolean {
  return fieldType === "select" || fieldType === "multi_select";
}
