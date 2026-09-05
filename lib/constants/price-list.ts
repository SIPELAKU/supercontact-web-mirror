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
  PriceListCandidateLevel,
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

/**
 * All six kinds a price list can be assigned to (Phase 3). Exhaustive over
 * `AssignmentTargetType`, so widening that union is a compile error until the
 * label lands here - and `TARGET_TYPE_OPTIONS`, which drives both the editor's
 * kind select and the assignment table's filter, picks the new kinds up with
 * no further edit.
 */
export const TARGET_TYPE_LABELS: Record<AssignmentTargetType, string> = {
  contact: "Kontak",
  crm_company: "Perusahaan",
  customer_type: "Tipe Pelanggan",
  segment: "Segmen",
  sales_channel: "Kanal Penjualan",
  region: "Wilayah",
};

export const TARGET_TYPE_OPTIONS: { value: AssignmentTargetType; label: string }[] = (
  Object.keys(TARGET_TYPE_LABELS) as AssignmentTargetType[]
).map((value) => ({ value, label: TARGET_TYPE_LABELS[value] }));

/**
 * The seven levels of the resolution chain, in the order it walks them - what
 * the "Daftar harga yang berlaku" explainer prints beside each candidate.
 * `company_default` is the fall-through anchor and is not an assignment target.
 */
export const CANDIDATE_LEVEL_LABELS: Record<PriceListCandidateLevel, string> = {
  contact: "Kontak",
  crm_company: "Perusahaan",
  segment: "Segmen",
  customer_type: "Tipe pelanggan",
  sales_channel: "Kanal penjualan",
  region: "Wilayah",
  company_default: "Daftar harga bawaan",
};

/** Why a candidate was dropped, as the explainer says it. */
export const CANDIDATE_REASON_LABELS: Record<string, string> = {
  archived: "Daftar harga diarsipkan",
  currency_mismatch: "Mata uang tidak cocok",
  list_window: "Di luar masa berlaku daftar harga",
  assignment_window: "Di luar masa berlaku penetapan",
  duplicate: "Sudah dipakai di tingkat yang lebih spesifik",
};
