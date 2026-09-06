"use client";

// components/product/ProductBundleItemsTab.tsx
//
// The bundle composition editor (COMMERCIAL Phase 5, spec I4 / A5 / D2).
//
// A BUNDLE IS PRICED AS ONE LINE (A5). Its components are a JSON snapshot on
// the quotation line - names, quantities, units, NO MONEY - because a
// per-component amount would imply a per-component price that does not exist.
// That is also why the quotation form and the PDF render them as an indented
// read-only sub-block and never as extra table rows.
//
// THE TWO NUMBERS ARE SHOWN SIDE BY SIDE, AND THE DIFFERENCE IS NEVER AN ERROR
// (spec I4). `bundle_price` is what the customer pays; `components_sum` is what
// the same goods would cost bought separately. A bundle whose price differs
// from the sum is the entire point of a bundle - the screen states the gap
// plainly, in words, and does not colour it red.
//
// ONE LEVEL: a component is never itself a bundle (A5 / E6).

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef } from "@/components/ui/super-table";
import CatalogProductPicker, {
  type ProductPickerOption,
} from "@/components/admin/catalog-settings/CatalogProductPicker";
import { useAuth } from "@/lib/context/AuthContext";
import { notify } from "@/lib/notifications";
import { formatMoney, formatQuantity, parseMoney } from "@/lib/helper/currency";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import {
  addBundleItem,
  listBundleItems,
  removeBundleItem,
  updateBundleItem,
} from "@/lib/api/products";
import { useActiveUnits } from "@/lib/hooks/useUnits";
import type { Product } from "@/lib/store/product";
import type { ProductBundleItem } from "@/lib/types/Products";

interface Draft {
  componentProductId: string;
  componentOption: ProductPickerOption | null;
  quantity: string;
  unitId: string;
  sortOrder: string;
}

const EMPTY_DRAFT: Draft = {
  componentProductId: "",
  componentOption: null,
  quantity: "1",
  unitId: "",
  sortOrder: "0",
};

export default function ProductBundleItemsTab({
  product,
  onChanged,
}: {
  product: Product;
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
  const [editing, setEditing] = useState<ProductBundleItem | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["product-bundle-items", product.id, mutationSeq],
    queryFn: async () => listBundleItems(await getToken(), product.id),
  });
  const items = data?.items ?? [];

  const { data: unitsData } = useActiveUnits();
  const unitOptions = useMemo(
    () => [
      { value: "", label: "Satuan produk komponen" },
      ...((unitsData?.units ?? []).map((unit) => ({ value: unit.id, label: unit.name })) as {
        value: string;
        label: string;
      }[]),
    ],
    [unitsData]
  );

  const resetForm = () => {
    setAdding(false);
    setEditing(null);
    setDraft(EMPTY_DRAFT);
    setFieldErrors({});
  };

  const beginEdit = (row: ProductBundleItem) => {
    setAdding(false);
    setEditing(row);
    setDraft({
      componentProductId: row.component_product_id,
      componentOption: {
        value: row.component.id,
        label: `${row.component.sku} — ${row.component.product_name}`,
        sku: row.component.sku,
        productName: row.component.product_name,
        price: row.component.price ?? "",
        unitId: row.unit_id ?? null,
        unitName: row.unit?.name ?? null,
        unitPrecision: row.unit?.precision ?? null,
      },
      quantity: row.quantity ?? "1",
      unitId: row.unit_id ?? "",
      sortOrder: String(row.sort_order ?? 0),
    });
    setFieldErrors({});
  };

  const handleSave = async () => {
    const problems: Record<string, string> = {};
    const quantity = Number(draft.quantity);
    const sortOrder = draft.sortOrder.trim() === "" ? 0 : Number(draft.sortOrder);

    if (!editing && !draft.componentProductId) problems.component_product_id = "Pilih produk";
    if (!editing && draft.componentProductId === product.id) {
      // A bundle containing itself is an infinite composition; the server
      // refuses it, and refusing here says WHY rather than showing a 400.
      problems.component_product_id = "Paket tidak bisa berisi dirinya sendiri";
    }
    if (draft.quantity.trim() === "" || !Number.isFinite(quantity) || quantity <= 0) {
      problems.quantity = "Kuantitas wajib diisi dan lebih dari 0";
    }
    if (!Number.isInteger(sortOrder)) problems.sort_order = "Harus bilangan bulat";

    if (Object.keys(problems).length > 0) {
      setFieldErrors(problems);
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      if (editing) {
        await updateBundleItem(token, product.id, editing.id, {
          quantity,
          unit_id: draft.unitId || null,
          sort_order: sortOrder,
        });
        notify.success("Isi paket diubah");
      } else {
        await addBundleItem(token, product.id, {
          component_product_id: draft.componentProductId,
          quantity,
          unit_id: draft.unitId || null,
          sort_order: sortOrder,
        });
        notify.success("Komponen ditambahkan");
      }
      resetForm();
      bump();
    } catch (error: any) {
      const fe = extractFieldErrors(error);
      const known = Object.keys(fe).filter((key) => key !== "_");
      if (known.length > 0) setFieldErrors(fe);
      if (known.length === 0 || fe._) {
        notify.error("Gagal menyimpan isi paket", { description: fe._ ?? error?.message });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (row: ProductBundleItem) => {
    confirm({
      variant: "warning",
      title: "Hapus komponen",
      description: `Keluarkan "${row.component.product_name}" dari paket ini? Quotation yang sudah tersimpan tidak berubah - barisnya menyimpan isi paket saat dibuat.`,
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: async () => {
        try {
          await removeBundleItem(await getToken(), product.id, row.id);
          notify.success("Komponen dihapus");
          bump();
        } catch (error: any) {
          notify.error("Gagal menghapus komponen", { description: error?.message });
        }
      },
    });
  };

  const columns = useMemo<MRT_ColumnDef<ProductBundleItem>[]>(
    () => [
      {
        id: "component",
        accessorFn: (row) => row.component.product_name,
        header: "Komponen",
        size: 260,
        enableSorting: false,
        Cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.component.product_name}</span>
            <span className="font-mono text-xs text-gray-500">{row.original.component.sku}</span>
          </div>
        ),
      },
      {
        id: "quantity",
        accessorFn: (row) =>
          `${formatQuantity(row.quantity)}${row.unit?.name ? ` ${row.unit.name}` : ""}`,
        header: "Jumlah",
        size: 140,
        enableSorting: false,
      },
      { accessorKey: "sort_order", header: "Urutan", size: 100, enableSorting: false },
    ],
    []
  );

  const bundlePrice = data?.bundle_price ?? "0.00";
  const componentsSum = data?.components_sum ?? "0.00";
  const difference = parseMoney(bundlePrice) - parseMoney(componentsSum);
  const hasDifference = Number.isFinite(difference) && Math.abs(difference) >= 0.005;

  const editorRow = (
    <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium">Komponen</label>
          {editing ? (
            <AppInput
              isBgWhite
              value={`${editing.component.sku} — ${editing.component.product_name}`}
              disabled
              helperText="Komponen tidak bisa diganti - hapus barisnya dan tambah yang baru"
            />
          ) : (
            <CatalogProductPicker
              // A component MAY be a variant - that is the point of variants
              // (A5 / E6), and `GET /products` is top-level-only by default.
              includeVariants
              value={draft.componentProductId || null}
              selectedOption={draft.componentOption}
              onChange={(option) =>
                setDraft({
                  ...draft,
                  componentProductId: option?.value ?? "",
                  componentOption: option,
                  // The component's own unit is the sensible default; a
                  // different unit is an explicit choice.
                  unitId: option?.unitId ?? "",
                })
              }
              error={!!fieldErrors.component_product_id}
              helperText={fieldErrors.component_product_id}
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Jumlah</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.quantity}
            onChange={(e) => setDraft({ ...draft, quantity: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
            error={!!fieldErrors.quantity}
            helperText={fieldErrors.quantity ?? "Berapa banyak komponen ini di dalam satu paket"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Satuan</label>
          <AppSelect
            isBgWhite
            fullWidth
            value={draft.unitId}
            options={unitOptions}
            onChange={(e) => setDraft({ ...draft, unitId: String(e.target.value) })}
            error={!!fieldErrors.unit_id}
            helperText={fieldErrors.unit_id ?? "Kosong = satuan produk komponen"}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium">Urutan</label>
          <AppInput
            isBgWhite
            type="number"
            value={draft.sortOrder}
            onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
            inputProps={{ step: 1 }}
            error={!!fieldErrors.sort_order}
            helperText={fieldErrors.sort_order ?? "Urutan tampil di quotation dan PDF"}
          />
        </div>
      </div>

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

      {/* THE TWO NUMBERS, SIDE BY SIDE, AND THE DIFFERENCE STATED PLAINLY -
          NEVER AS AN ERROR (spec I4). A bundle price that differs from the sum
          of its parts is the point of a bundle. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Harga paket</p>
          <p className="mt-1 text-lg font-semibold">{formatMoney(bundlePrice)}</p>
          <p className="mt-1 text-xs text-gray-500">Yang dibayar pelanggan untuk satu paket.</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Jumlah harga komponen</p>
          <p className="mt-1 text-lg font-semibold">{formatMoney(componentsSum)}</p>
          <p className="mt-1 text-xs text-gray-500">
            Bila barang yang sama dibeli terpisah dengan harga dasarnya.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-gray-500">Selisih</p>
          <p className="mt-1 text-lg font-semibold">
            {hasDifference ? formatMoney(Math.abs(difference)) : formatMoney(0)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {!hasDifference
              ? "Harga paket sama dengan jumlah komponennya."
              : difference < 0
                ? "Paket ini lebih murah daripada membeli komponennya terpisah."
                : "Paket ini lebih mahal daripada membeli komponennya terpisah - biasanya karena ada jasa atau kemasan di dalamnya."}
          </p>
        </div>
      </div>

      <div className="rounded-lg border-l-4 border-l-sky-500 bg-sky-50 p-4 text-sm dark:bg-sky-950/30">
        <p className="font-medium">Paket dihargai sebagai satu baris.</p>
        <p className="mt-1 text-muted-foreground">
          Di quotation, isi paket tampil sebagai daftar di dalam barisnya - nama, jumlah dan satuan
          - <b>tanpa harga per komponen</b>, karena yang dijual adalah paketnya. Isi paket ikut
          tercatat di baris quotation saat dibuat, jadi mengubahnya di sini tidak mengubah dokumen
          yang sudah keluar.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!adding && !editing && (
          <AppButton
            onClick={() => {
              setAdding(true);
              setDraft(EMPTY_DRAFT);
              setFieldErrors({});
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Tambah komponen
          </AppButton>
        )}
      </div>

      {(adding || editing) && editorRow}

      <SuperTable<ProductBundleItem>
        tableId="product-bundle-items-table"
        urlKey=""
        entityLabel="komponen"
        columns={columns}
        data={items}
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage="Isi paket gagal dimuat. Coba lagi."
        onRetry={() => refetch()}
        rowCount={data?.total}
        resetPageKey={mutationSeq}
        rowActions={[
          {
            id: "edit",
            label: "Ubah",
            icon: <Pencil size={16} />,
            onClick: (row) => beginEdit(row),
          },
          {
            id: "remove",
            label: "Hapus",
            icon: <Trash2 size={16} />,
            destructive: true,
            onClick: (row) => handleRemove(row),
          },
        ]}
        renderEmptyState={() => (
          <EmptyState
            icon={Boxes}
            title="Paket ini masih kosong"
            description="Tambahkan produk yang ada di dalamnya. Isi paket dicatat di baris quotation dan dicetak di PDF."
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
