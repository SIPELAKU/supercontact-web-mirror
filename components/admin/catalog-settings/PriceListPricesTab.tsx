"use client";

import { useCallback, useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { Plus, Save, Tag, X, XCircle } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { SuperTable, type MRT_ColumnDef, type SuperTableState } from "@/components/ui/super-table";
import CatalogProductPicker, {
    type ProductPickerOption,
} from "@/components/admin/catalog-settings/CatalogProductPicker";
import { notify } from "@/lib/notifications";
import { extractFieldErrors } from "@/lib/api/catalog-http";
import { formatRupiah } from "@/lib/helper/currency";
import { useActiveUnits } from "@/lib/hooks/useUnits";
import {
    useAddPriceListPrice,
    useClosePriceListPrice,
    usePriceListPrices,
} from "@/lib/hooks/usePriceLists";
import {
    BASE_COMPARISON_LABELS,
    compareToBasePrice,
    formatDateShort,
    formatValidityRange,
    priceWindowLabel,
    priceWindowState,
    tierLabel,
} from "@/lib/utils/priceGrid";
import type { PriceList, ProductPrice, ProductPriceListParams } from "@/lib/types/PriceList";

interface Draft {
    productId: string;
    unitId: string;
    minQuantity: string;
    price: string;
    validFrom: string;
    validUntil: string;
}

const EMPTY_DRAFT: Draft = {
    productId: "",
    unitId: "",
    minQuantity: "1",
    price: "",
    validFrom: "",
    validUntil: "",
};

const INITIAL_PARAMS: ProductPriceListParams = {
    page: 1,
    limit: 25,
    search: "",
    // The server's own default. The grid opens on the prices that APPLY;
    // closed and superseded rows are history and are opt-in below.
    only_open: true,
    sort_order: "asc",
    include_total: true,
};

function sameParams(a: ProductPriceListParams, b: ProductPriceListParams): boolean {
    return (
        a.page === b.page &&
        a.limit === b.limit &&
        a.search === b.search &&
        a.product_id === b.product_id &&
        a.only_open === b.only_open &&
        a.sort_by === b.sort_by &&
        a.sort_order === b.sort_order
    );
}

const WINDOW_CHIP_COLOR: Record<string, "success" | "info" | "default" | "warning"> = {
    open: "success",
    scheduled: "info",
    closed: "default",
    empty: "warning",
};

export default function PriceListPricesTab({
    priceList,
    /** Bumped by the page after a bulk run: the rows changed wholesale, so the
     *  lazy list restarts from batch 1 - without throwing away the user's
     *  search and filters, which remounting the tab would. */
    refreshKey = 0,
}: {
    priceList: PriceList;
    refreshKey?: number;
}) {
    const [params, setParams] = useState<ProductPriceListParams>(INITIAL_PARAMS);
    const [productFilter, setProductFilter] = useState<ProductPickerOption | null>(null);
    const { data, isLoading, isFetching, isError, refetch } = usePriceListPrices(priceList.id, params);
    const rows: ProductPrice[] = data?.prices ?? [];

    const { data: unitsData } = useActiveUnits();
    const unitOptions = useMemo(
        () => [
            { value: "", label: "Satuan produk (bawaan)" },
            ...(unitsData?.units ?? []).map((unit) => ({ value: unit.id, label: unit.name })),
        ],
        [unitsData]
    );

    const addMutation = useAddPriceListPrice();
    const closeMutation = useClosePriceListPrice();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    const [draftProduct, setDraftProduct] = useState<ProductPickerOption | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [mutationSeq, setMutationSeq] = useState(0);

    const resetForm = () => {
        setAdding(false);
        setDraft(EMPTY_DRAFT);
        setDraftProduct(null);
        setFieldErrors({});
    };

    const handleServerError = (error: any, title: string) => {
        const fe = extractFieldErrors(error);
        const known = Object.keys(fe).filter((k) => k !== "_");
        if (known.length > 0) setFieldErrors(fe);
        if (known.length === 0 || fe._) notify.error(title, { description: fe._ ?? error?.message });
    };

    const handleSave = async () => {
        const problems: Record<string, string> = {};
        if (!draft.productId) problems.product_id = "Pilih produk";
        const minQuantity = Number(draft.minQuantity);
        if (!Number.isFinite(minQuantity) || minQuantity <= 0)
            problems.min_quantity = "Jumlah minimum harus lebih dari 0";
        const price = Number(draft.price);
        if (draft.price.trim() === "" || !Number.isFinite(price) || price < 0)
            problems.price = "Harga wajib diisi dan tidak boleh negatif";
        if (draft.validFrom && draft.validUntil && draft.validUntil < draft.validFrom)
            problems.valid_until = "Tanggal berakhir harus setelah tanggal mulai";
        if (Object.keys(problems).length > 0) {
            setFieldErrors(problems);
            return;
        }

        try {
            await addMutation.mutateAsync({
                priceListId: priceList.id,
                data: {
                    product_id: draft.productId,
                    unit_id: draft.unitId || null,
                    min_quantity: minQuantity,
                    price,
                    valid_from: draft.validFrom || null,
                    valid_until: draft.validUntil || null,
                },
            });
            notify.success("Harga disimpan", {
                description:
                    "Baris harga lama untuk tier ini ditutup, baris baru dibuat. Riwayat harga tetap ada.",
            });
            resetForm();
            setMutationSeq((s) => s + 1);
        } catch (error: any) {
            handleServerError(error, "Gagal menyimpan harga");
        }
    };

    const handleClose = (row: ProductPrice) => {
        confirm({
            variant: "warning",
            title: "Tutup harga",
            description: `Harga ${formatRupiah(row.price, { decimals: 2 })} untuk "${row.product.product_name}" berhenti berlaku hari ini. Barisnya tidak dihapus - tetap terbaca sebagai riwayat, dan quotation yang sudah ada tidak berubah.`,
            confirmText: "Tutup harga",
            cancelText: "Batal",
            onConfirm: async () => {
                try {
                    await closeMutation.mutateAsync({ priceListId: priceList.id, priceId: row.id });
                    notify.success("Harga ditutup");
                    setMutationSeq((s) => s + 1);
                } catch (error: any) {
                    notify.error("Gagal menutup harga", { description: error?.message });
                }
            },
        });
    };

    const handleStateChange = useCallback((state: SuperTableState) => {
        const page = state.pagination.pageIndex + 1;
        const sort = state.sorting?.[0];
        setParams((prev) => {
            const next: ProductPriceListParams = {
                ...prev,
                page,
                limit: state.pagination.pageSize,
                search: state.globalFilter || "",
                // Inverted on purpose: an unticked boolean filter is ABSENT,
                // so declaring it as "hanya harga aktif" would quietly flip the
                // server's `only_open=true` default to false on first render.
                only_open: state.filters?.include_closed ? false : true,
                sort_by: sort?.id,
                sort_order: sort ? (sort.desc ? "desc" : "asc") : "asc",
                include_total: page === 1,
            };
            return sameParams(prev, next) ? prev : next;
        });
    }, []);

    const applyProductFilter = (option: ProductPickerOption | null) => {
        setProductFilter(option);
        setParams((prev) => ({ ...prev, page: 1, product_id: option?.value, include_total: true }));
    };

    const columns = useMemo<MRT_ColumnDef<ProductPrice>[]>(
        () => [
            {
                // The id IS the `sort_by` value sent to the server, so it is the
                // joined column's name, not a display label.
                id: "product_name",
                accessorFn: (row) => row.product.product_name,
                header: "Produk",
                size: 260,
                Cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span>{row.original.product.product_name}</span>
                        <span className="font-mono text-[11px] text-gray-500">{row.original.product.sku}</span>
                    </div>
                ),
            },
            {
                id: "unit",
                accessorFn: (row) => row.unit?.name ?? "",
                header: "Satuan",
                size: 120,
                enableSorting: false,
                Cell: ({ row }) =>
                    row.original.unit?.name ?? (
                        <span className="text-gray-400">Satuan produk</span>
                    ),
            },
            {
                id: "min_quantity",
                accessorFn: (row) => Number(row.min_quantity),
                header: "Tier",
                size: 130,
                Cell: ({ row }) => tierLabel(row.original.min_quantity, row.original.unit?.name ?? null),
            },
            {
                id: "price",
                accessorFn: (row) => Number(row.price),
                header: "Harga",
                size: 190,
                Cell: ({ row }) => {
                    const comparison = compareToBasePrice(row.original.price, row.original.product.price);
                    return (
                        <div className="flex flex-col">
                            {/* Cents matter in a price grid, unlike a summary total. */}
                            <span className="font-medium">
                                {formatRupiah(row.original.price, { decimals: 2 })}
                            </span>
                            {comparison !== "unknown" && comparison !== "same" && (
                                <span className="text-[11px] text-gray-500">
                                    {BASE_COMPARISON_LABELS[comparison]}{" "}
                                    ({formatRupiah(row.original.product.price)})
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "valid_from",
                header: "Berlaku dari",
                size: 140,
                Cell: ({ cell }) => formatDateShort(cell.getValue<string>()),
            },
            {
                accessorKey: "valid_until",
                header: "Sampai",
                size: 140,
                Cell: ({ cell }) => formatDateShort(cell.getValue<string | null>()) || "Terbuka",
            },
            {
                id: "window",
                accessorFn: (row) => priceWindowLabel(priceWindowState(row)),
                header: "Status",
                size: 130,
                enableSorting: false,
                Cell: ({ row }) => {
                    const state = priceWindowState(row.original);
                    return (
                        <Chip
                            label={priceWindowLabel(state)}
                            color={WINDOW_CHIP_COLOR[state]}
                            size="small"
                            title={formatValidityRange(row.original)}
                        />
                    );
                },
            },
        ],
        []
    );

    const editorRow = (
        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <label className="mb-1 block text-xs font-medium">Produk</label>
                    <CatalogProductPicker
                        // A variant is a full product row (A2) and carries its
                        // own list price, so it must be selectable here.
                        includeVariants
                        value={draft.productId || null}
                        selectedOption={draftProduct}
                        onChange={(option) => {
                            setDraftProduct(option);
                            setDraft((prev) => ({ ...prev, productId: option?.value ?? "" }));
                        }}
                        error={!!fieldErrors.product_id}
                        helperText={
                            fieldErrors.product_id ??
                            (draftProduct
                                ? `Harga katalog saat ini ${formatRupiah(draftProduct.price, { decimals: 2 })}`
                                : undefined)
                        }
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
                        helperText={fieldErrors.unit_id}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Jumlah minimum (tier)</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.minQuantity}
                        onChange={(e) => setDraft({ ...draft, minQuantity: e.target.value })}
                        inputProps={{ min: 0.01, step: 0.01 }}
                        error={!!fieldErrors.min_quantity}
                        helperText={fieldErrors.min_quantity ?? "Harga ini dipakai mulai jumlah segini"}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Harga satuan</label>
                    <AppInput
                        isBgWhite
                        type="number"
                        value={draft.price}
                        onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                        inputProps={{ min: 0, step: 0.01 }}
                        error={!!fieldErrors.price}
                        helperText={fieldErrors.price}
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Berlaku dari</label>
                    <input
                        type="date"
                        aria-label="Berlaku dari"
                        value={draft.validFrom}
                        onChange={(e) => setDraft({ ...draft, validFrom: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">Kosong = mulai hari ini</p>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium">Berlaku sampai</label>
                    <input
                        type="date"
                        aria-label="Berlaku sampai"
                        value={draft.validUntil}
                        onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })}
                        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none ${
                            fieldErrors.valid_until ? "border-red-500" : "border-gray-200"
                        }`}
                    />
                    {fieldErrors.valid_until && (
                        <p className="mt-1 text-xs text-red-600">{fieldErrors.valid_until}</p>
                    )}
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Harga lama tidak diubah - baris lama ditutup dan baris baru dibuat, sehingga riwayat harga
                tetap ada. Mengubah harga pada hari yang sama akan menggantikan baris hari ini.
            </p>
            <div className="flex gap-2">
                <AppButton onClick={handleSave} disabled={addMutation.isPending}>
                    <Save className="mr-1.5 h-4 w-4" />
                    Simpan harga
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-sm">
                    <CatalogProductPicker
                        label="Filter produk"
                        // ...and the filter must be able to name the rows the
                        // editor above can create.
                        includeVariants
                        value={params.product_id ?? null}
                        selectedOption={productFilter}
                        onChange={applyProductFilter}
                        placeholder="Semua produk"
                    />
                </div>
                {!adding && (
                    <AppButton onClick={() => setAdding(true)}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Tambah harga
                    </AppButton>
                )}
            </div>

            {adding && editorRow}

            <SuperTable<ProductPrice>
                tableId="price-list-prices-table"
                urlKey="prices"
                entityLabel="harga"
                searchPlaceholder="Cari nama atau SKU produk"
                columns={columns}
                data={rows}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isFetching={isFetching}
                isError={isError}
                errorMessage="Failed to load prices. Please try again."
                onRetry={() => refetch()}
                rowCount={typeof data?.total === "number" ? data.total : undefined}
                manualPagination
                manualFiltering
                manualSorting
                onStateChange={handleStateChange}
                // The product filter lives outside the table, so its changes
                // have to restart the lazy list the same way a search does.
                resetPageKey={`${mutationSeq}:${refreshKey}:${params.product_id ?? ""}`}
                filters={[
                    { id: "include_closed", label: "Tampilkan harga yang sudah ditutup", type: "boolean" },
                ]}
                rowActions={[
                    {
                        id: "close",
                        label: "Tutup harga",
                        icon: <XCircle size={16} />,
                        destructive: true,
                        hidden: (row) => !row.is_open,
                        onClick: (row) => handleClose(row),
                    },
                ]}
                renderEmptyState={({ hasActiveFilters, hasSearch }) => (
                    <EmptyState
                        icon={Tag}
                        title={
                            hasActiveFilters || hasSearch || params.product_id
                                ? "No prices match"
                                : "No prices in this list yet"
                        }
                        description="A price list with no product prices changes nothing: every line falls through to the catalogue price."
                    />
                )}
                features={{
                    pagination: true,
                    globalFilter: true,
                    sorting: true,
                    columnFilters: false,
                    urlSync: true,
                    rowSelection: "none",
                }}
            />
        </div>
    );
}
