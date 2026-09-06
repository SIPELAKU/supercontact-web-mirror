// lib/utils/variantMatrix.ts
//
// The pure half of the variant MATRIX editor (COMMERCIAL Phase 5, spec I4).
//
// A tenant types axes - "Warna: Merah, Biru" and "Ukuran: S, M, L" - and gets
// the six combinations as ROWS to price. Every combination is a FULL PRODUCT
// ROW (A2), one level deep, created in ONE bulk request (A9).
//
// WHY THIS FILE EXISTS SEPARATELY FROM THE COMPONENT
//
// `ProductVariantsTab` posts ONE bulk request and never a client-side loop,
// because the modal's SKU suggestion derives its counter from the CURRENTLY
// LOADED batch only (its own comment concedes the server's 409 is the real
// guard). A twelve-variant loop would collide on a duplicate SKU and
// half-create with no rollback.
//
// That makes the CARTESIAN PRODUCT, the SKU suggestion and the LOCAL DUPLICATE
// CHECK the three places a defect would be silent and expensive: a wrong
// product ships twelve wrong rows in one transaction, and a missed local
// duplicate is a 409 the seller cannot act on. They are pure functions here so
// they are tested directly, without a DOM.
//
// NOTHING in this file talks to the network, and nothing here is arithmetic on
// money: prices are carried as the user typed them and validated as strings.

/** One axis of the matrix: a name and its values, as typed. */
export interface VariantAxis {
  /** "Warna". Trimmed; a blank axis is ignored entirely. */
  name: string;
  /** ["Merah", "Biru"], already split from the comma-separated input. */
  values: string[];
}

/** One generated row, before the seller prices it. */
export interface VariantCombination {
  /** `{ Warna: "Merah", Ukuran: "S" }` - exactly the `variant_values` payload. */
  values: Record<string, string>;
  /** "Merah / S" - the row label and the default name suffix. */
  label: string;
  /** A stable identity for React keys and the duplicate check. */
  key: string;
}

/** The maximum a single bulk request may carry (spec D1: `max_length=50`). */
export const VARIANT_BULK_MAX = 50;
/** Mirrors the API's `PRODUCT_SKU_MAX_LENGTH`, so the form refuses before the server does. */
export const VARIANT_SKU_MAX_LENGTH = 64;

/**
 * Values from one comma-separated input, trimmed, blanks dropped, DUPLICATES
 * DROPPED CASE-INSENSITIVELY but keeping the first spelling the user typed.
 *
 * Case-insensitive because "Merah, merah" is one colour to a human and two rows
 * to a naive split - and those two rows would then differ only by case in
 * `variant_values`, which no screen could tell apart afterwards.
 */
export function parseAxisValues(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of (raw ?? "").split(",")) {
    const value = part.trim();
    if (!value) continue;
    const fold = value.toLocaleLowerCase("id-ID");
    if (seen.has(fold)) continue;
    seen.add(fold);
    out.push(value);
  }
  return out;
}

/** Axes worth expanding: a name AND at least one value. Order is preserved. */
export function usableAxes(axes: VariantAxis[]): VariantAxis[] {
  return (axes ?? [])
    .map((axis) => ({ name: (axis.name ?? "").trim(), values: axis.values ?? [] }))
    .filter((axis) => axis.name !== "" && axis.values.length > 0);
}

/**
 * The cartesian product of the axes, in a STABLE order: the LAST axis varies
 * fastest, so "Merah/S, Merah/M, Biru/S, Biru/M" reads down the screen the way
 * a person would write the list out by hand.
 *
 * Returns `[]` for no usable axis - never one empty combination, which would
 * post a variant with `variant_values: {}` and be refused by the schema's
 * `min_length=1`.
 */
export function buildVariantMatrix(axes: VariantAxis[]): VariantCombination[] {
  const usable = usableAxes(axes);
  if (usable.length === 0) return [];

  let rows: Record<string, string>[] = [{}];
  for (const axis of usable) {
    const next: Record<string, string>[] = [];
    for (const row of rows) {
      for (const value of axis.values) next.push({ ...row, [axis.name]: value });
    }
    rows = next;
  }

  return rows.map((values) => {
    const label = usable.map((axis) => values[axis.name]).join(" / ");
    return { values, label, key: label.toLocaleLowerCase("id-ID") };
  });
}

/** How many rows these axes would produce, without building them. */
export function variantMatrixSize(axes: VariantAxis[]): number {
  const usable = usableAxes(axes);
  if (usable.length === 0) return 0;
  return usable.reduce((total, axis) => total * axis.values.length, 1);
}

/**
 * A SKU suggestion: the parent's SKU, then each value as an uppercase slug.
 *
 * `PARENT-MERAH-S`. Diacritics are left alone deliberately - the API's SKU
 * rules are the server's, and quietly transliterating a tenant's characters
 * would change a code they may already print on a label. Only characters that
 * cannot live in a code at all (spaces, punctuation) become the separator.
 *
 * IT IS A SUGGESTION. The server's uniqueness index is the real guard (A9), and
 * the field stays editable - which is exactly why this never invents a counter.
 */
export function suggestVariantSku(
  parentSku: string,
  values: Record<string, string>
): string {
  const slug = (text: string) =>
    (text ?? "")
      .trim()
      .toLocaleUpperCase("id-ID")
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const head = slug(parentSku);
  const tail = Object.values(values ?? {}).map(slug).filter(Boolean);
  const joined = [head, ...tail].filter(Boolean).join("-");
  return joined.slice(0, VARIANT_SKU_MAX_LENGTH);
}

/** One row of the editor: a generated combination plus what the seller typed. */
export interface VariantDraftRow {
  key: string;
  label: string;
  values: Record<string, string>;
  sku: string;
  price: string;
  cost: string;
  /** Unticked rows are not created at all, so a 3x4 grid can ship 10 of 12. */
  selected: boolean;
}

/** Seeds one draft row from a combination, with the suggested SKU filled in. */
export function draftRowFrom(
  combination: VariantCombination,
  parentSku: string,
  parentPrice: string
): VariantDraftRow {
  return {
    key: combination.key,
    label: combination.label,
    values: combination.values,
    sku: suggestVariantSku(parentSku, combination.values),
    // Seeded from the PARENT's price so a tenant whose variants cost the same
    // types nothing; a variant that diverges is one field away.
    price: parentPrice ?? "",
    cost: "",
    selected: true,
  };
}

/**
 * Re-seed the rows for a new matrix while KEEPING what the seller already typed
 * for combinations that survive the change.
 *
 * Adding "L" to a size axis must not wipe the twelve prices already entered.
 * The match is on `key` (the lower-cased label), which is stable across a
 * re-expansion because `buildVariantMatrix` builds it the same way every time.
 */
export function reseedDraftRows(
  combinations: VariantCombination[],
  previous: VariantDraftRow[],
  parentSku: string,
  parentPrice: string
): VariantDraftRow[] {
  const byKey = new Map(previous.map((row) => [row.key, row]));
  return combinations.map((combination) => {
    const kept = byKey.get(combination.key);
    if (!kept) return draftRowFrom(combination, parentSku, parentPrice);
    // The label and values come from the NEW combination: an axis renamed from
    // "Warna" to "Colour" must not keep posting the old key.
    return { ...kept, label: combination.label, values: combination.values };
  });
}

export interface VariantDraftProblem {
  /** The row's key, or `"_"` for a problem with the batch as a whole. */
  key: string;
  field: "sku" | "price" | "cost" | "_";
  message: string;
}

/**
 * Everything the form can refuse BEFORE the request, in Indonesian.
 *
 * The point is not to duplicate the server's validation - it is to catch what
 * would otherwise come back as ONE 409 for a batch of twelve, with nothing to
 * say which row caused it. A local duplicate SKU is exactly that case: the
 * bulk create is a single transaction (A9), so one collision loses all twelve.
 */
export function validateVariantDraft(rows: VariantDraftRow[]): VariantDraftProblem[] {
  const problems: VariantDraftProblem[] = [];
  const selected = (rows ?? []).filter((row) => row.selected);

  if (selected.length === 0) {
    problems.push({ key: "_", field: "_", message: "Pilih minimal satu varian" });
    return problems;
  }
  if (selected.length > VARIANT_BULK_MAX) {
    problems.push({
      key: "_",
      field: "_",
      message: `Maksimal ${VARIANT_BULK_MAX} varian sekali kirim - kurangi pilihan atau kirim bertahap`,
    });
  }

  // SKUs are compared case-INSENSITIVELY on purpose: the tenant reads them as
  // the same code, and the server's own duplicate answer would arrive as one
  // 409 for the whole transaction with no row named.
  const seen = new Map<string, string>();
  for (const row of selected) {
    const sku = row.sku.trim();
    if (!sku) {
      problems.push({ key: row.key, field: "sku", message: "SKU wajib diisi" });
    } else if (sku.length > VARIANT_SKU_MAX_LENGTH) {
      problems.push({
        key: row.key,
        field: "sku",
        message: `Maksimal ${VARIANT_SKU_MAX_LENGTH} karakter`,
      });
    } else {
      const fold = sku.toLocaleUpperCase("id-ID");
      const owner = seen.get(fold);
      if (owner) {
        problems.push({
          key: row.key,
          field: "sku",
          message: `SKU sama dengan varian "${owner}"`,
        });
      } else {
        seen.set(fold, row.label);
      }
    }

    const price = Number(row.price);
    if (row.price.trim() === "" || !Number.isFinite(price)) {
      problems.push({ key: row.key, field: "price", message: "Harga wajib diisi" });
    } else if (price < 1) {
      // Mirrors the schema's `ge=1`, which exists because a zero-price
      // catalogue row is indistinguishable from a mistake.
      problems.push({ key: row.key, field: "price", message: "Harga minimal 1" });
    }

    if (row.cost.trim() !== "") {
      const cost = Number(row.cost);
      if (!Number.isFinite(cost) || cost < 0) {
        problems.push({ key: row.key, field: "cost", message: "HPP tidak boleh negatif" });
      }
    }
  }
  return problems;
}

/** The selected rows as `ProductVariantCreateRequest` objects (spec D1). */
export function variantCreatePayload(rows: VariantDraftRow[]): {
  sku: string;
  price: number;
  variant_values: Record<string, string>;
  cost?: number | null;
}[] {
  return (rows ?? [])
    .filter((row) => row.selected)
    .map((row) => {
      const payload: {
        sku: string;
        price: number;
        variant_values: Record<string, string>;
        cost?: number | null;
      } = {
        sku: row.sku.trim(),
        price: Number(row.price),
        variant_values: row.values,
      };
      // A BLANK cost is omitted, not sent as 0: null means "no cost recorded"
      // and 0 means "this costs nothing", and the margin column reads them
      // completely differently (Phase 4, ItemRow.marginPercent).
      if (row.cost.trim() !== "") payload.cost = Number(row.cost);
      return payload;
    });
}

/** `{ Warna: "Merah" }` -> `"Warna: Merah"`, for the read-only chip rows (I8). */
export function variantValueChips(
  values: Record<string, unknown> | null | undefined
): { key: string; label: string }[] {
  if (!values || typeof values !== "object" || Array.isArray(values)) return [];
  return Object.entries(values)
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(([key, value]) => ({ key, label: `${key}: ${String(value)}` }));
}
