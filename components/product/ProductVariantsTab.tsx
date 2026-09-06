"use client";

// components/product/ProductVariantsTab.tsx
//
// The variant MATRIX editor (COMMERCIAL Phase 5, spec I4 / A2 / A8 / A9).
//
// A VARIANT IS A FULL PRODUCT ROW (A2): its own id, SKU, price, cost and image,
// ONE level deep, and it is the thing that gets quoted. This tab exists on
// `/sales/product/[id]` and not inside `AddProductModal` because all three
// Phase 5 child collections need an EXISTING product id, and the modal saves in
// ONE POST/PATCH - on CREATE there is no id to hang them off.
//
// IT POSTS ONE BULK REQUEST, NEVER A CLIENT-SIDE LOOP (A9).
//
// The modal's own SKU suggestion derives its counter from the CURRENTLY LOADED
// batch of rows only - its comment concedes the server's 409 is the real guard
// - so a twelve-variant client loop would collide on the first duplicate and
// half-create twelve rows with no rollback and nothing to roll back WITH. The
// server runs the whole batch in one transaction instead.
//
// THE BANNER SAYS THE RIGHT THING (corrected from the work-list, A8): a parent
// that has variants is NOT QUOTABLE and its variants are quoted instead. It
// does NOT say the parent "stopped being sellable", because no capability was
// changed - the refusal is an EXISTS check on its children and nothing else.
//
// The pure half - the cartesian product, the SKU suggestion, the local
// duplicate check - lives in `lib/utils/variantMatrix.ts` and is unit-tested
// there, because a defect in any of the three ships twelve wrong rows at once.

import { useEffect, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Info, Layers, Plus, Save, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Switch } from "@/components/ui/switch";
import { SuperTable, type MRT_ColumnDef } from "@/components/ui/super-table";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { formatMoney } from "@/lib/helper/currency";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { createVariants, listVariants } from "@/lib/api/products";
import type { Product } from "@/lib/store/product";
import {
  VARIANT_BULK_MAX,
  buildVariantMatrix,
  parseAxisValues,
  reseedDraftRows,
  validateVariantDraft,
  variantCreatePayload,
  variantMatrixSize,
  variantValueChips,
  type VariantAxis,
  type VariantDraftRow,
} from "@/lib/utils/variantMatrix";

/** Two axes cover almost every real catalogue; a third is one click away. */
const MAX_AXES = 3;

interface AxisInput {
  name: string;
  raw: string;
}

const EMPTY_AXES: AxisInput[] = [
  { name: "", raw: "" },
  { name: "", raw: "" },
];

export default function ProductVariantsTab({
  product,
  onChanged,
}: {
  product: Product;
  /** Bumped after a successful bulk create so the header's counts refresh. */
  onChanged?: () => void;
}) {
  const { getToken } = useAuth();
  const [mutationSeq, setMutationSeq] = useState(0);
  const [composing, setComposing] = useState(false);
  const [axes, setAxes] = useState<AxisInput[]>(EMPTY_AXES);
  const [rows, setRows] = useState<VariantDraftRow[]>([]);
  const [problems, setProblems] = useState<Record<string, Record<string, string>>>({});
  const [batchProblem, setBatchProblem] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["product-variants", product.id, mutationSeq],
    queryFn: async () => listVariants(await getToken(), product.id, { status: "all" }),
  });
  const variants: Product[] = data?.products ?? [];

  const parsedAxes = useMemo<VariantAxis[]>(
    () => axes.map((axis) => ({ name: axis.name, values: parseAxisValues(axis.raw) })),
    [axes]
  );
  const combinations = useMemo(() => buildVariantMatrix(parsedAxes), [parsedAxes]);
  const matrixSize = variantMatrixSize(parsedAxes);

  // Re-expanding on every keystroke must NOT wipe the prices already typed:
  // `reseedDraftRows` keeps whatever survives the change, by row key.
  useEffect(() => {
    setRows((previous) =>
      reseedDraftRows(combinations, previous, product.sku, String(product.price ?? ""))
    );
  }, [combinations, product.sku, product.price]);

  const resetComposer = () => {
    setComposing(false);
    setAxes(EMPTY_AXES);
    setRows([]);
    setProblems({});
    setBatchProblem(null);
  };

  const setRow = (key: string, patch: Partial<VariantDraftRow>) =>
    setRows((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const handleSave = async () => {
    const found = validateVariantDraft(rows);
    if (found.length > 0) {
      const byRow: Record<string, Record<string, string>> = {};
      let batch: string | null = null;
      for (const problem of found) {
        if (problem.key === "_") {
          batch = problem.message;
          continue;
        }
        byRow[problem.key] = { ...(byRow[problem.key] ?? {}), [problem.field]: problem.message };
      }
      setProblems(byRow);
      setBatchProblem(batch);
      return;
    }
    setProblems({});
    setBatchProblem(null);

    setSaving(true);
    try {
      const payload = variantCreatePayload(rows);
      const result = await createVariants(await getToken(), product.id, {
        variants: payload.map((row) => ({
          sku: row.sku,
          price: row.price,
          variant_values: row.variant_values,
          ...(row.cost === undefined ? {} : { cost: row.cost }),
        })),
      });
      notify.success(`${result.total} varian dibuat`, {
        description:
          "Varian inilah yang dipilih di quotation; produk induk tidak lagi bisa dipilih langsung.",
      });
      resetComposer();
      setMutationSeq((n) => n + 1);
      onChanged?.();
    } catch (error: any) {
      const fe = extractFieldErrors(error);
      // The server refuses the WHOLE batch (one transaction), so a field error
      // has no row to land under - it is shown as one message above the grid
      // rather than pretending to point at a line.
      setBatchProblem(fe._ ?? Object.values(fe)[0] ?? error?.message ?? "Gagal membuat varian");
      notify.error("Gagal membuat varian", {
        description: fe._ ?? error?.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<MRT_ColumnDef<Product>[]>(
    () => [
      {
        id: "variant_values",
        accessorFn: (row) =>
          variantValueChips(row.variant_values)
            .map((chip) => chip.label)
            .join(", ") || "-",
        header: "Varian",
        size: 220,
        enableSorting: false,
        Cell: ({ row }) => {
          const chips = variantValueChips(row.original.variant_values);
          if (chips.length === 0) return <span className="text-gray-400">-</span>;
          return (
            <div className="flex flex-wrap gap-1">
              {chips.map((chip) => (
                <Chip key={chip.key} label={chip.label} size="small" variant="outlined" />
              ))}
            </div>
          );
        },
      },
      { accessorKey: "sku", header: "SKU", size: 160, enableSorting: false },
      { accessorKey: "product_name", header: "Nama", size: 220, enableSorting: false },
      {
        id: "price",
        accessorFn: (row) => formatMoney(row.price),
        header: "Harga",
        size: 140,
        enableSorting: false,
        muiTableBodyCellProps: { align: "right" },
        muiTableHeadCellProps: { align: "right" },
      },
      {
        id: "status",
        accessorFn: (row) => (row.status === "active" ? "Aktif" : "Diarsipkan"),
        header: "Status",
        size: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Chip
            label={row.original.status === "active" ? "Aktif" : "Diarsipkan"}
            color={row.original.status === "active" ? "success" : "default"}
            size="small"
          />
        ),
      },
    ],
    []
  );

  const composer = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div>
        <p className="text-sm font-medium">Sumbu varian</p>
        <p className="text-xs text-muted-foreground">
          Tulis nilai dipisahkan koma. Semua kombinasinya dibuat sekaligus dalam satu permintaan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {axes.map((axis, index) => (
          <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <AppInput
              isBgWhite
              label={`Sumbu ${index + 1}`}
              placeholder="mis. Warna"
              value={axis.name}
              onChange={(e) =>
                setAxes((prev) =>
                  prev.map((row, i) => (i === index ? { ...row, name: e.target.value } : row))
                )
              }
            />
            <div className="sm:col-span-2">
              <AppInput
                isBgWhite
                label="Nilai"
                placeholder="Merah, Biru, Hijau"
                value={axis.raw}
                onChange={(e) =>
                  setAxes((prev) =>
                    prev.map((row, i) => (i === index ? { ...row, raw: e.target.value } : row))
                  )
                }
                helperText={`${parseAxisValues(axis.raw).length} nilai`}
              />
            </div>
          </div>
        ))}
      </div>

      {axes.length < MAX_AXES && (
        <div>
          <AppButton
            variantStyle="outline"
            onClick={() => setAxes((prev) => [...prev, { name: "", raw: "" }])}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah sumbu
          </AppButton>
        </div>
      )}

      {/* The inherited context, read-only (spec I4). A child MAY diverge later,
          and the note says so rather than implying the values are frozen. */}
      <div className="rounded-lg border bg-white p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Diwarisi dari produk induk</p>
        <p className="mt-1">
          Kategori: <b>{product.category?.name ?? "-"}</b> &middot; Satuan:{" "}
          <b>{product.unit?.name ?? "-"}</b> &middot; Tipe: <b>{product.product_type}</b>
        </p>
        <p className="mt-1">
          Varian dibuat dengan konteks ini. Setelah dibuat, tiap varian bisa diubah sendiri lewat
          halaman produknya - nilai di atas tidak dikunci.
        </p>
      </div>

      {batchProblem && (
        <p className="text-sm text-red-600" role="alert">
          {batchProblem}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Isi minimal satu sumbu beserta nilainya untuk melihat kombinasinya.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <p className="mb-2 text-xs text-muted-foreground">
            {matrixSize} kombinasi{" "}
            {matrixSize > VARIANT_BULK_MAX && (
              <b className="text-red-600">
                - maksimal {VARIANT_BULK_MAX} sekali kirim, hilangkan centang sebagian
              </b>
            )}
          </p>
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="w-10 px-2 py-2 font-medium">Buat</th>
                <th className="px-2 py-2 font-medium">Kombinasi</th>
                <th className="px-2 py-2 font-medium">SKU</th>
                <th className="px-2 py-2 font-medium">Harga</th>
                <th className="px-2 py-2 font-medium">HPP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowProblems = problems[row.key] ?? {};
                return (
                  <tr key={row.key} className="border-b border-gray-100">
                    <td className="px-2 py-2 align-top">
                      <Switch
                        checked={row.selected}
                        onCheckedChange={(checked) => setRow(row.key, { selected: checked })}
                      />
                    </td>
                    <td className="px-2 py-2 align-top font-medium">{row.label}</td>
                    <td className="px-2 py-2 align-top">
                      <AppInput
                        isBgWhite
                        aria-label={`SKU ${row.label}`}
                        value={row.sku}
                        onChange={(e) => setRow(row.key, { sku: e.target.value })}
                        error={!!rowProblems.sku}
                        helperText={rowProblems.sku}
                        disabled={!row.selected}
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <AppInput
                        isBgWhite
                        type="number"
                        aria-label={`Harga ${row.label}`}
                        value={row.price}
                        onChange={(e) => setRow(row.key, { price: e.target.value })}
                        inputProps={{ min: 1, step: 0.01 }}
                        error={!!rowProblems.price}
                        helperText={rowProblems.price}
                        disabled={!row.selected}
                      />
                    </td>
                    <td className="px-2 py-2 align-top">
                      <AppInput
                        isBgWhite
                        type="number"
                        aria-label={`HPP ${row.label}`}
                        value={row.cost}
                        onChange={(e) => setRow(row.key, { cost: e.target.value })}
                        inputProps={{ min: 0, step: 0.01 }}
                        error={!!rowProblems.cost}
                        // A blank HPP is NOT zero: null means "no cost
                        // recorded" and the margin column reads the two
                        // completely differently.
                        helperText={rowProblems.cost ?? "Kosong = belum ada HPP"}
                        disabled={!row.selected}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <AppButton
          onClick={handleSave}
          disabled={saving || rows.length === 0}
          isLoading={saving}
        >
          <Save className="mr-1.5 h-4 w-4" />
          Buat {rows.filter((row) => row.selected).length} varian
        </AppButton>
        <AppButton variantStyle="outline" onClick={resetComposer} aria-label="Batal">
          <X className="h-4 w-4" />
        </AppButton>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* A8, stated the way the spec fixes it: the parent is not quotable, its
          variants are quoted instead. NOT "the parent stopped being sellable" -
          nothing about the product was changed. */}
      <div className="flex gap-3 rounded-lg border-l-4 border-l-indigo-500 bg-indigo-50 p-4 text-sm dark:bg-indigo-950/30">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
        <div>
          <p className="font-medium">
            Begitu produk ini punya varian, yang dipilih di quotation adalah <b>variannya</b>,
            bukan produk induknya.
          </p>
          <p className="mt-1 text-muted-foreground">
            Produk induk tetap ada, tetap bisa diubah dan tetap memegang kategori, satuan dan
            atribut yang diwarisi varian - ia hanya tidak lagi muncul sebagai baris yang bisa
            dijual selama masih punya varian. Tiap varian adalah baris produk penuh dengan SKU,
            harga dan HPP sendiri, dan hanya satu tingkat: varian tidak bisa punya varian lagi.
          </p>
          {variants.length > 0 && (
            <p className="mt-1 text-muted-foreground">
              Quotation yang sudah tersimpan tidak berubah - barisnya menyimpan nama dan SKU produk
              saat dibuat.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!composing && (
          <AppButton onClick={() => setComposing(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Buat varian
          </AppButton>
        )}
      </div>

      {composing && composer}

      <SuperTable<Product>
        tableId="product-variants-table"
        urlKey=""
        entityLabel="varian"
        columns={columns}
        data={variants}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Varian gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={typeof data?.total === "number" ? data.total : undefined}
        resetPageKey={mutationSeq}
        renderEmptyState={() => (
          <EmptyState
            icon={Layers}
            title="Belum ada varian"
            description="Buat varian bila produk ini dijual dalam beberapa pilihan - warna, ukuran, rasa - yang masing-masing punya SKU dan harga sendiri."
            action={
              composing ? undefined : { label: "Buat varian", onClick: () => setComposing(true) }
            }
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
