"use client";

// components/product/ProductUnitsTab.tsx
//
// Per-product unit conversions (COMMERCIAL Phase 5, spec I4 / A6 / A12 / A15).
//
// `factor_to_base` MEANS BASE UNITS PER ROW UNIT, at four decimals:
//
//     1 karton = 12 pcs   ->  the karton row carries factor_to_base = 12.0000
//
// on a product whose OWN unit is pcs. The direction is printed as a sentence
// beside every row for the same reason the exchange-rate screen does it: the
// inverse (0.0833) is a plausible thing to type and would silently price a
// carton at a twelfth of a piece.
//
// TWO WARNINGS THIS SCREEN OWES THE TENANT
//
//  1. REPRESENTABILITY (E7 / D3). `quotation_items.quantity` is Numeric(12,2).
//     A factor that makes ONE line-unit produce a base quantity that cannot be
//     stored at 2dp means every line in that unit is silently rounded. The API
//     answers `base_quantity_representable: false` and this screen says so AT
//     ENTRY TIME, not at save time on the quotation three weeks later.
//
//  2. THE A15 GRANDFATHER. A price row may exist for a unit that is neither the
//     product's own nor an active conversion here - authored before the rule,
//     by a price editor that offered every active tenant unit. Those rows are
//     never refused and still resolve, and `GET /price-lists/{id}/prices` marks
//     them `unit_conversion_missing: true`. This tab surfaces the same warning
//     with a ONE-CLICK fix, so it is a click and not a mystery - and the click
//     is REACTIVATE when the conversion exists but was switched off (the usual
//     way this warning appears, since A27 deactivates rather than deletes and
//     only ACTIVE conversions resolve), ADD only when there is no row at all.
//     Offering "add" for a deactivated row would 400 every time: the API's
//     pre-check counts inactive rows too.
//
// A conversion is DEACTIVATED, never deleted (A27): a stored quotation line
// keeps its `unit_factor_used` snapshot and the row still explains it.

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { AlertTriangle, Pencil, Plus, Power, Ruler, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { formatQuantity } from "@/lib/helper/currency";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
  addProductUnit,
  listProductUnits,
  removeProductUnit,
  updateProductUnit,
} from "@/lib/api/products";
import { useActiveUnits } from "@/lib/hooks/useUnits";
import type { Product } from "@/lib/store/product";
import type { ProductUnitConversion } from "@/lib/types/Products";

/** `product_units.factor_to_base` is Numeric(12,4) (A6). */
const FACTOR_DECIMALS = 4;

interface Draft {
  unitId: string;
  factor: string;
}

const EMPTY_DRAFT: Draft = { unitId: "", factor: "" };

/**
 * "1 Karton = 12 Pcs". Exported so the row, the live preview under the form and
 * a future caller cannot spell the direction three different ways.
 */
export function conversionSentence(
  unitName: string | null | undefined,
  factor: string | number | null | undefined,
  baseUnitName: string | null | undefined
): string {
  const unit = (unitName ?? "satuan").trim() || "satuan";
  const base = (baseUnitName ?? "satuan dasar").trim() || "satuan dasar";
  return `1 ${unit} = ${formatQuantity(factor)} ${base}`;
}

export default function ProductUnitsTab({
  product,
  /**
   * Price rows whose unit is neither the product's own nor an active
   * conversion (A15). Passed in by the detail client, which scans the tenant's
   * active price lists for this product ONLY while this tab is open - so a
   * product nobody opens this tab on spends no request on a warning most
   * products will never show.
   */
  missingConversionUnitIds = [],
  onChanged,
}: {
  product: Product;
  missingConversionUnitIds?: string[];
  onChanged?: () => void;
}) {
  const { getToken } = useAuth();
  const { confirm, confirmationPopup } = useConfirmationPopup();

  const [mutationSeq, setMutationSeq] = useState(0);
  const bump = () => {
    setMutationSeq((n) => n + 1);
    onChanged?.();
  };

  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<ProductUnitConversion | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["product-units", product.id, mutationSeq],
    queryFn: async () => listProductUnits(await getToken(), product.id),
  });
  const rows = data?.items ?? [];
  const baseUnit = data?.base_unit ?? product.unit ?? null;
  const baseUnitName = baseUnit?.name ?? null;

  const { data: unitsData } = useActiveUnits();
  const allUnits = useMemo(() => unitsData?.units ?? [], [unitsData]);

  const takenUnitIds = useMemo(
    () => new Set(rows.map((row) => row.unit_id).concat(product.unit_id ? [product.unit_id] : [])),
    [rows, product.unit_id]
  );
  const unitOptions = useMemo(
    () =>
      allUnits
        // The product's OWN unit is implicit with factor 1 and is never a row
        // here; offering it would let a tenant author "1 pcs = 3 pcs".
        .filter((unit) => !takenUnitIds.has(unit.id) || unit.id === draft.unitId)
        .map((unit) => ({ value: unit.id, label: unit.name })),
    [allUnits, takenUnitIds, draft.unitId]
  );

  /**
   * A15: units a price row uses that have no ACTIVE conversion here.
   *
   * The row is carried, not just the id, because the usual way this warning
   * appears is a conversion that was DEACTIVATED here (A27 deactivates, never
   * deletes - and `map_factors_by_product_unit` only resolves active rows, so
   * the price row is flagged the moment the conversion is switched off). For
   * such a unit "add the conversion" is not the fix and cannot be: `POST
   * /products/{id}/units` pre-checks with a lookup that DELIBERATELY includes
   * inactive rows and answers 400 "Konversi untuk satuan ini sudah ada". The
   * fix is to switch the existing row back on, which is what the row-action
   * menu already does - so the banner offers the SAME action, one click, on the
   * screen that owns the warning.
   */
  const missing = useMemo(() => {
    const active = new Set(rows.filter((row) => row.is_active).map((row) => row.unit_id));
    const byUnit = new Map(rows.map((row) => [row.unit_id, row]));
    return (missingConversionUnitIds ?? [])
      .filter((unitId) => unitId && unitId !== product.unit_id && !active.has(unitId))
      .map((unitId) => ({
        unitId,
        name:
          byUnit.get(unitId)?.unit?.name ??
          allUnits.find((unit) => unit.id === unitId)?.name ??
          unitId,
        // The DEACTIVATED conversion for this unit, when there is one.
        existing: byUnit.get(unitId) ?? null,
      }));
  }, [missingConversionUnitIds, rows, product.unit_id, allUnits]);

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
  };

  const beginAdd = (unitId = "") => {
    setEditing(null);
    setAdding(true);
    setDraft({ unitId, factor: "" });
    setFieldErrors({});
  };

  const beginEdit = (row: ProductUnitConversion) => {
    setAdding(false);
    setEditing(row);
    setDraft({ unitId: row.unit_id, factor: row.factor_to_base ?? "" });
    setFieldErrors({});
  };

  const handleSave = async () => {
    const problems: Record<string, string> = {};
    const factor = Number(draft.factor);
    if (!editing && !draft.unitId) problems.unit_id = "Pilih satuan";
    if (draft.factor.trim() === "" || !Number.isFinite(factor) || factor <= 0) {
      problems.factor_to_base = "Faktor wajib diisi dan lebih dari 0";
    }
    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (editing) {
        await updateProductUnit(token, product.id, editing.id, { factor_to_base: factor });
        notify.success("Konversi satuan diubah", {
          description:
            "Berlaku untuk quotation berikutnya. Baris quotation tersimpan menyimpan faktor yang dipakainya.",
        });
      } else {
        await addProductUnit(token, product.id, { unit_id: draft.unitId, factor_to_base: factor });
        const unitName = allUnits.find((unit) => unit.id === draft.unitId)?.name ?? null;
        notify.success("Konversi satuan ditambahkan", {
          description: conversionSentence(unitName, factor, baseUnitName),
        });
      }
      resetForm();
      bump();
    } catch (error: any) {
      const fe = extractFieldErrors(error);
      const known = Object.keys(fe).filter((key) => key !== "_");
      if (known.length > 0) setFieldErrors(fe);
      if (known.length === 0 || fe._) {
        notify.error("Gagal menyimpan konversi satuan", { description: fe._ ?? error?.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = (row: ProductUnitConversion) => {
    confirm({
      variant: "warning",
      title: "Nonaktifkan konversi satuan",
      description: `${conversionSentence(row.unit?.name, row.factor_to_base, baseUnitName)} tidak akan bisa dipilih lagi di baris quotation baru. Quotation yang sudah tersimpan tidak berubah - barisnya menyimpan faktor yang dipakai.`,
      confirmText: "Nonaktifkan",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await removeProductUnit(await getToken(), product.id, row.id);
          notify.success("Konversi satuan dinonaktifkan");
          bump();
        } catch (error: any) {
          notify.error("Gagal menonaktifkan", { description: error?.message });
        }
      },
    });
  };

  const handleReactivate = async (row: ProductUnitConversion) => {
    try {
      await updateProductUnit(await getToken(), product.id, row.id, { is_active: true });
      notify.success("Konversi satuan diaktifkan kembali");
      bump();
    } catch (error: any) {
      notify.error("Gagal mengaktifkan", { description: error?.message });
    }
  };

  const columns = useMemo<MRT_ColumnDef<ProductUnitConversion>[]>(
    () => [
      {
        id: "unit",
        accessorFn: (row) =>
          conversionSentence(row.unit?.name, row.factor_to_base, baseUnitName),
        header: "Konversi",
        size: 280,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">
              {conversionSentence(row.original.unit?.name, row.original.factor_to_base, baseUnitName)}
            </span>
            {/* E7's honesty flag, on the row itself: false means a quantity of
                1 in this unit already cannot be stored at 2dp. */}
            {row.original.base_quantity_representable === false && (
              <span className="text-xs text-amber-700">
                Kuantitas 1 {row.original.unit?.name ?? "satuan"} tidak bisa disimpan tepat di 2
                desimal - jumlahnya akan dibulatkan
              </span>
            )}
          </div>
        ),
      },
      {
        id: "factor_to_base",
        accessorFn: (row) => row.factor_to_base,
        header: `Faktor ke ${baseUnitName ?? "satuan dasar"}`,
        size: 180,
        enableSorting: false,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "is_active",
        accessorFn: (row) => (row.is_active ? "Aktif" : "Nonaktif"),
        header: "Status",
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Chip
            label={row.original.is_active ? "Aktif" : "Nonaktif"}
            color={row.original.is_active ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    [baseUnitName]
  );

  // No `unit_id` on the product means there is no base to convert TO, and the
  // tab says so instead of rendering a form that could never be saved (I4).
  if (!product.unit_id) {
    return (
      <EmptyState
        icon={Ruler}
        title="Produk ini belum punya satuan"
        description="Konversi satuan menyatakan berapa satuan dasar produk ada di dalam satuan lain, jadi produk harus punya satuan dasarnya dulu. Pilih satuan di tab Detail (Ubah produk), lalu kembali ke sini."
      />
    );
  }

  const previewFactor = Number(draft.factor);
  const draftUnitName = allUnits.find((unit) => unit.id === draft.unitId)?.name ?? null;

  const editorRow = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium">Satuan</label>
          {editing ? (
            <AppInput
              isBgWhite
              value={editing.unit?.name ?? ""}
              disabled
              helperText="Satuan tidak bisa diganti - nonaktifkan barisnya dan tambah yang baru"
            />
          ) : (
            <AppSelect
              isBgWhite
              fullWidth
              value={draft.unitId}
              options={unitOptions}
              onChange={(e) => setDraft({ ...draft, unitId: String(e.target.value) })}
              error={!!fieldErrors.unit_id}
              helperText={
                fieldErrors.unit_id ??
                `Satuan lain yang dipakai untuk menjual produk ini selain ${baseUnitName ?? "satuan dasarnya"}`
              }
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">
            Berapa {baseUnitName ?? "satuan dasar"} dalam 1 {draftUnitName ?? "satuan"}
          </label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.factor}
            onChange={(e) => setDraft({ ...draft, factor: e.target.value })}
            inputProps={{ min: 0, step: 10 ** -FACTOR_DECIMALS }}
            error={!!fieldErrors.factor_to_base}
            helperText={
              fieldErrors.factor_to_base ??
              `Maksimal ${FACTOR_DECIMALS} desimal. Contoh: 1 Karton = 12 Pcs ditulis 12`
            }
          />
        </div>
      </div>

      {/* The sentence the row will read, live, BEFORE the save - the cheapest
          guard there is against entering the inverse. */}
      {draft.factor.trim() !== "" && Number.isFinite(previewFactor) && previewFactor > 0 && (
        <p className="text-sm">
          Akan tersimpan sebagai:{" "}
          <b>{conversionSentence(draftUnitName, previewFactor, baseUnitName)}</b>
        </p>
      )}

      <div className="flex gap-2">
        <AppButton onClick={handleSave} disabled={saving} isLoading={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          Simpan
        </AppButton>
        <AppButton variantStyle="outline" onClick={resetForm} aria-label="Batal">
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {confirmationPopup}

      <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
        <p className="font-medium">
          Satuan dasar produk ini: <b>{baseUnitName ?? "-"}</b>. Faktor selalu ditulis sebagai
          &ldquo;berapa {baseUnitName ?? "satuan dasar"} di dalam SATU satuan lain&rdquo;.
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>
            Contoh: 1 Karton = 12 Pcs ditulis sebagai satuan <b>Karton</b>, faktor <b>12</b> -
            bukan 0,0833.
          </li>
          <li>
            Minimal kuantitas promosi dan tier daftar harga tetap dihitung dalam satuan dasar, jadi
            angkanya tidak berubah gara-gara penjual memilih Karton.
          </li>
          <li>
            Kuantitas quotation disimpan di dua desimal. Faktor yang membuat 1 satuan tidak muat di
            dua desimal ditandai di barisnya.
          </li>
        </ul>
      </div>

      {/* A15's grandfathered price rows: the warning AND the one-click fix. */}
      {missing.length > 0 && (
        <div className="flex gap-3 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 p-4 text-sm dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-medium">
              Ada baris harga yang memakai satuan tanpa konversi aktif di sini.
            </p>
            <p className="mt-1 text-muted-foreground">
              Baris harga itu tetap berlaku dan tidak ditolak, tetapi baris quotation baru tidak
              bisa memakai satuan tersebut sampai konversinya ada dan aktif.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {missing.map(({ unitId, name, existing }) =>
                existing ? (
                  // The conversion still EXISTS, switched off. Adding it again
                  // is a 400 by design; reactivating it is the fix.
                  <AppButton
                    key={unitId}
                    size="small"
                    variantStyle="outline"
                    onClick={() => void handleReactivate(existing)}
                  >
                    <Power className="mr-1.5 h-3.5 w-3.5" />
                    Aktifkan kembali konversi {name}
                  </AppButton>
                ) : (
                  <AppButton
                    key={unitId}
                    size="small"
                    variantStyle="outline"
                    onClick={() => beginAdd(unitId)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Tambah konversi {name}
                  </AppButton>
                )
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!adding && !editing && (
          <AppButton onClick={() => beginAdd()}>
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah konversi
          </AppButton>
        )}
      </div>

      {(adding || editing) && editorRow}

      <SuperTable<ProductUnitConversion>
        tableId="product-units-table"
        urlKey=""
        entityLabel="konversi satuan"
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Konversi satuan gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={data?.total}
        resetPageKey={mutationSeq}
        rowActions={[
          {
            id: "edit",
            label: "Ubah faktor",
            icon: <Pencil size={16} />,
            onClick: (row) => beginEdit(row),
          },
          {
            id: "reactivate",
            label: "Aktifkan kembali",
            icon: <Power size={16} />,
            hidden: (row) => row.is_active,
            onClick: (row) => void handleReactivate(row),
          },
          {
            id: "deactivate",
            label: "Nonaktifkan",
            icon: <Power size={16} />,
            destructive: true,
            hidden: (row) => !row.is_active,
            onClick: (row) => handleDeactivate(row),
          },
        ]}
        renderEmptyState={() => (
          <EmptyState
            icon={Ruler}
            title="Belum ada konversi satuan"
            description={`Produk ini hanya bisa dijual dalam ${baseUnitName ?? "satuan dasarnya"}. Tambahkan konversi bila juga dijual per karton, lusin, atau satuan lain.`}
          />
        )}
        features={{
          pagination: false,
          globalFilter: false,
          sorting: false,
          columnFilters: false,
          urlSync: false,
          rowSelection: "none",
        }}
      />
    </div>
  );
}
