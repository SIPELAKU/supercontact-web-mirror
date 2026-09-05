// lib/constants/price-list.ts
//
// The vocabulary the price-list screens share: rounding modes, statuses and
// assignment target types, as the user reads them.
//
// They live here rather than beside one of the screens so that the bulk dialog
// and the detail header do not have to import a whole table component to read
// four labels.

import type {
  AssignmentTargetType,
  PriceListRounding,
  PriceListStatus,
} from "@/lib/types/PriceList";

/** Applies to any price the LIST produces, never to the catalogue fallback. */
export const ROUNDING_LABELS: Record<PriceListRounding, string> = {
  none: "Tanpa pembulatan",
  unit: "Rupiah terdekat",
  hundred: "Ratusan terdekat",
  thousand: "Ribuan terdekat",
};

export const ROUNDING_OPTIONS: { value: PriceListRounding; label: string }[] = (
  Object.keys(ROUNDING_LABELS) as PriceListRounding[]
).map((value) => ({ value, label: ROUNDING_LABELS[value] }));

export const PRICE_LIST_STATUS_LABELS: Record<PriceListStatus, string> = {
  active: "Aktif",
  archived: "Diarsipkan",
};

export const PRICE_LIST_STATUS_OPTIONS: { value: PriceListStatus; label: string }[] = (
  Object.keys(PRICE_LIST_STATUS_LABELS) as PriceListStatus[]
).map((value) => ({ value, label: PRICE_LIST_STATUS_LABELS[value] }));

/** Phase 2 targets only; Phase 3 widens the server enum. */
export const TARGET_TYPE_LABELS: Record<AssignmentTargetType, string> = {
  contact: "Kontak",
  crm_company: "Perusahaan",
};

export const TARGET_TYPE_OPTIONS: { value: AssignmentTargetType; label: string }[] = (
  Object.keys(TARGET_TYPE_LABELS) as AssignmentTargetType[]
).map((value) => ({ value, label: TARGET_TYPE_LABELS[value] }));
