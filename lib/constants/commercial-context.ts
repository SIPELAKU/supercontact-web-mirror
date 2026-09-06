// lib/constants/commercial-context.ts
//
// The vocabulary the commercial-context screens share (Phase 3): channel
// types, region levels, statuses, and the segment criteria whitelist.
//
// SEGMENT_FIELD_OPS MIRRORS THE API CONSTANT OF THE SAME NAME EXACTLY
// (`app/schemas/customer_segment_schema.py`, spec D2). A clause naming a field
// outside this list, or pairing a field with an operator this table does not
// allow, is refused server-side with a 400 carrying the clause index - it is
// never a silently-false clause (spec A8). The builder therefore offers only
// the pairs below, and this file is the one place to change when the API's
// table changes.
//
// The two label maps are deliberate `Record<>` tripwires: adding a member to
// `SalesChannelType` or `RegionLevel` is an `npx tsc --noEmit` error until its
// label lands here.

import type {
  CommercialStatus,
  RegionLevel,
  SalesChannelType,
  SegmentBaseField,
  SegmentClauseOperator,
} from "@/lib/types/CommercialContext";

export const CUSTOMER_TYPE_CODE_MAX_LENGTH = 32;
export const SEGMENT_CODE_MAX_LENGTH = 32;
export const SALES_CHANNEL_CODE_MAX_LENGTH = 32;
export const REGION_CODE_MAX_LENGTH = 32;
export const COMMERCIAL_NAME_MAX_LENGTH = 100;
/** `regions.name` is String(120) - it matches `crm_companies.kabupaten`. */
export const REGION_NAME_MAX_LENGTH = 120;

/** The API's shared code rule: letter or digit first, then letters/digits/_ . - */
export const COMMERCIAL_CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,31}$/;

/** Spec A8: an AND of 1..10 clauses. */
export const MAX_SEGMENT_CLAUSES = 10;
/** Spec C1. The manager refuses a create past it before the server does. */
export const MAX_SEGMENTS_PER_COMPANY = 50;
/** root = depth 0; a node at depth 4 cannot have children (spec A19). */
export const MAX_REGION_DEPTH_INDEX = 4;

export const COMMERCIAL_STATUS_LABELS: Record<CommercialStatus, string> = {
  active: "Aktif",
  archived: "Diarsipkan",
};

export const COMMERCIAL_STATUS_OPTIONS: { value: CommercialStatus; label: string }[] = (
  Object.keys(COMMERCIAL_STATUS_LABELS) as CommercialStatus[]
).map((value) => ({ value, label: COMMERCIAL_STATUS_LABELS[value] }));

// ── Sales channels ────────────────────────────────────────────────────────

export const SALES_CHANNEL_TYPE_LABELS: Record<SalesChannelType, string> = {
  whatsapp: "WhatsApp",
  web_widget: "Web Widget",
  email: "Email",
  marketplace: "Marketplace",
  reseller: "Reseller",
  field_sales: "Sales lapangan",
  direct: "Langsung",
};

export const SALES_CHANNEL_TYPE_OPTIONS: { value: SalesChannelType; label: string }[] = (
  Object.keys(SALES_CHANNEL_TYPE_LABELS) as SalesChannelType[]
).map((value) => ({ value, label: SALES_CHANNEL_TYPE_LABELS[value] }));

/**
 * The three sales channel types an omnichannel account can serve. The sales
 * `channel_type` vocabulary and the omnichannel `ChannelType` one overlap in
 * exactly these values, so a `marketplace` / `reseller` / `field_sales` /
 * `direct` channel refuses ANY link and an account of type `sms` /
 * `messenger` / `instagram` is refused because no sales type accepts it
 * (spec A25). The server answers 400 on `omnichannel_account_id`; the picker
 * disables itself with the reason below rather than letting a user find out.
 */
export const LINKABLE_SALES_CHANNEL_TYPES: readonly SalesChannelType[] = [
  "whatsapp",
  "web_widget",
  "email",
] as const;

export function canLinkOmnichannelAccount(channelType: SalesChannelType): boolean {
  return LINKABLE_SALES_CHANNEL_TYPES.includes(channelType);
}

/** The disabled control's reason string, never a silent no-op. */
export function omnichannelLinkDisabledReason(channelType: SalesChannelType): string | null {
  if (canLinkOmnichannelAccount(channelType)) return null;
  return `Kanal ${SALES_CHANNEL_TYPE_LABELS[channelType]} tidak bisa ditautkan ke akun omnichannel - hanya WhatsApp, Web Widget dan Email yang punya padanan akun.`;
}

// ── Regions ───────────────────────────────────────────────────────────────

export const REGION_LEVEL_LABELS: Record<RegionLevel, string> = {
  country: "Negara",
  province: "Provinsi",
  kabupaten: "Kabupaten/Kota",
  kecamatan: "Kecamatan",
  custom: "Wilayah khusus",
};

export const REGION_LEVEL_OPTIONS: { value: RegionLevel; label: string }[] = (
  Object.keys(REGION_LEVEL_LABELS) as RegionLevel[]
).map((value) => ({ value, label: REGION_LEVEL_LABELS[value] }));

/** The three levels `POST /regions/import-from-crm` scans by default. */
export const CRM_IMPORT_LEVELS: readonly RegionLevel[] = [
  "province",
  "kabupaten",
  "kecamatan",
] as const;

// ── Segment criteria ──────────────────────────────────────────────────────

export const SEGMENT_CUSTOM_FIELD_PREFIX = "custom_fields.";

export const SEGMENT_CLAUSE_OPERATOR_LABELS: Record<SegmentClauseOperator, string> = {
  eq: "adalah",
  in: "salah satu dari",
  gte: "minimal",
  lte: "maksimal",
  contains: "mengandung",
};

/**
 * The seven base fields, with what each one MEANS - the copy states spec A0.2
 * (`tags` reads the contact's OWN `contact_tags` names, case-insensitively;
 * `lead_status` still reads the SET of statuses across the contact's leads) and
 * spec A14 (an empty set makes every clause over it false, so a contact with no
 * tags and no leads never matches either).
 */
export interface SegmentFieldOption {
  value: SegmentBaseField;
  label: string;
  hint: string;
  /** A number input and Decimal comparison, not a picker. */
  numeric: boolean;
}

export const SEGMENT_FIELD_OPTIONS: SegmentFieldOption[] = [
  {
    value: "customer_type",
    label: "Tipe pelanggan",
    hint: "Tipe pelanggan kontak, lalu tipe perusahaan CRM-nya.",
    numeric: false,
  },
  {
    value: "tags",
    label: "Tag kontak",
    hint: "Tag yang menempel pada kontak ini (huruf besar/kecil dianggap sama). Kontak tanpa tag tidak pernah cocok.",
    numeric: false,
  },
  {
    value: "region",
    label: "Wilayah",
    hint: "Wilayah kontak (atau perusahaannya) beserta wilayah induknya.",
    numeric: false,
  },
  {
    value: "sales_channel",
    label: "Kanal penjualan",
    hint: "Kanal pada lead, atau kanal yang dipilih di quotation.",
    numeric: false,
  },
  {
    value: "lead_status",
    label: "Status lead",
    hint: "Kumpulan status lead milik kontak ini. Kontak tanpa lead tidak pernah cocok.",
    numeric: false,
  },
  {
    value: "accepted_quotations_count_365d",
    label: "Jumlah quotation diterima (365 hari)",
    hint: "Banyaknya quotation berstatus diterima dalam 365 hari terakhir.",
    numeric: true,
  },
  {
    value: "accepted_quotations_amount_365d",
    label: "Nilai quotation diterima (365 hari)",
    hint: "Total nilai quotation diterima dalam 365 hari terakhir.",
    numeric: true,
  },
];

export const SEGMENT_FIELD_LABELS: Record<SegmentBaseField, string> = Object.fromEntries(
  SEGMENT_FIELD_OPTIONS.map((option) => [option.value, option.label])
) as Record<SegmentBaseField, string>;

/**
 * Field -> the operators the API allows for it. Exhaustive over the seven base
 * fields; adding a `SegmentBaseField` member is a compile error until it lands
 * here too.
 */
export const SEGMENT_FIELD_OPS: Record<SegmentBaseField, readonly SegmentClauseOperator[]> = {
  customer_type: ["eq", "in"],
  tags: ["eq", "in", "contains"],
  region: ["eq", "in"],
  sales_channel: ["eq", "in"],
  lead_status: ["eq", "in"],
  accepted_quotations_count_365d: ["eq", "gte", "lte"],
  accepted_quotations_amount_365d: ["eq", "gte", "lte"],
};

/**
 * `custom_fields.<key>` keeps its own entry: a template-literal type cannot be
 * a key of an exhaustive `Record<SegmentBaseField, ...>`, and the API keeps it
 * as a separate entry under `SEGMENT_CUSTOM_FIELD_PREFIX` for the same reason.
 */
export const SEGMENT_CUSTOM_FIELD_OPS: readonly SegmentClauseOperator[] = [
  "eq",
  "in",
  "gte",
  "lte",
  "contains",
] as const;

/** Every operator the contract knows, in the order the selects show them. */
export const SEGMENT_CLAUSE_OPERATORS: readonly SegmentClauseOperator[] = [
  "eq",
  "in",
  "gte",
  "lte",
  "contains",
] as const;
