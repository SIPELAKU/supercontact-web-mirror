"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";
import { MRT_ColumnDef } from "@/components/ui/super-table";
import { SuperTable, SuperTableState } from "@/components/ui/super-table";
import { PRODUCT_STATUS_LABELS, PRODUCT_TYPE_LABELS, Product } from "@/lib/store/product";
import { PRODUCT_TYPE_OPTIONS } from "@/lib/constants/product-type";
import { formatMoney } from "@/lib/helper/currency";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/context/AuthContext";
import { listVariants } from "@/lib/api/products";
import { variantValueChips } from "@/lib/utils/variantMatrix";
import { Archive, Copy, Layers, Package, Pencil, Plus } from "lucide-react";

export interface ProductTableProps {
    products: Product[];
    isLoading: boolean;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    onAdd?: () => void;
    /** Only when the total is known - never 0 as a stand-in for "unknown". */
    rowCount?: number;
    onStateChange?: (state: SuperTableState) => void;
    onExportRequest?: (params: any) => Promise<Product[]>;
    renderTopLeftToolbar?: () => React.ReactNode;
    /** Class A row interaction: the row opens the edit modal with THIS row object. */
    onEdit: (product: Product) => void;
    /** DELETE /products/{id} archives; nothing is physically deleted any more. */
    onArchive: (product: Product) => Promise<{ success: boolean; error?: string }>;
    onBulkArchive?: (products: Product[], clearSelection: () => void) => Promise<void>;
    isBulkArchiving?: boolean;
    onDuplicate?: (products: Product[], clearSelection?: () => void) => void;
    isDuplicating?: boolean;
    /** flattenTree(tree) labels - the "Kategori" filter's options. */
    categoryOptions?: { value: string; label: string }[];
    /** Bumped by the page after every mutation so the lazy list restarts at batch 1. */
    resetPageKey?: string | number;
}

/** GET /products `status` values as the user reads them. "Aktif" is the server default. */
export const PRODUCT_STATUS_FILTER_OPTIONS = [
    { value: "active", label: "Aktif" },
    { value: "archived", label: "Diarsipkan" },
    { value: "all", label: "Semua" },
];

function ProductThumb({ url, name }: { url: string | null; name: string }) {
    if (!url) {
        return (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-400">
                <Package size={16} />
            </span>
        );
    }
    // Plain <img>: the storage host is not in next.config `remotePatterns`.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name} className="h-8 w-8 rounded-md object-cover" loading="lazy" />;
}

/**
 * COMMERCIAL Phase 5 (spec I5 / M-k). THE FIRST USE OF `renderDetailPanel` IN
 * THIS CODEBASE.
 *
 * The slot is DEFINED (`components/ui/super-table/types.ts:550`) and wired
 * straight to MRT (`hooks/useTableConfig.tsx:584-585`) but had ZERO call sites,
 * so this is untested ground in the repo - which is why it is a small,
 * self-contained component with its own query and its own empty/loading state
 * rather than something threaded through the table's props.
 *
 * It exists because the default list is TOP-LEVEL ONLY: a parent's children are
 * shown by expanding its row, instead of flooding a flat list with every child.
 */
function VariantDetailPanel({ product }: { product: Product }) {
    const { getToken } = useAuth();
    const { data, isLoading, isError } = useQuery({
        queryKey: ["product-variants", "detail-panel", product.id],
        queryFn: async () => listVariants(await getToken(), product.id, { limit: 25 }),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <Spinner />
            </div>
        );
    }
    if (isError) {
        return <p className="px-4 py-3 text-sm text-red-600">Varian gagal dimuat.</p>;
    }

    const variants = data?.products ?? [];
    if (variants.length === 0) {
        return <p className="px-4 py-3 text-sm text-gray-500">Belum ada varian.</p>;
    }

    return (
        <div className="px-4 py-3">
            <p className="mb-2 text-xs font-medium text-gray-500">
                Varian dari {product.product_name} - inilah yang dipilih di quotation
            </p>
            <table className="w-full text-sm">
                <tbody>
                    {variants.map((variant) => (
                        <tr key={variant.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-1.5 pr-3 font-mono text-xs text-gray-600">{variant.sku}</td>
                            <td className="py-1.5 pr-3">{variant.product_name}</td>
                            <td className="py-1.5 pr-3">
                                <div className="flex flex-wrap gap-1">
                                    {variantValueChips(variant.variant_values).map((chip) => (
                                        <Chip key={chip.key} label={chip.label} size="small" variant="outlined" />
                                    ))}
                                </div>
                            </td>
                            <td className="py-1.5 text-right font-medium whitespace-nowrap">
                                {formatMoney(variant.price)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ProductTable({
    products,
    isLoading,
    isError,
    errorMessage,
    onRetry,
    onAdd,
    rowCount,
    onStateChange,
    onExportRequest,
    renderTopLeftToolbar,
    onEdit,
    onArchive,
    onBulkArchive,
    isBulkArchiving,
    onDuplicate,
    isDuplicating,
    categoryOptions = [],
    resetPageKey,
}: ProductTableProps) {
    const { confirm, confirmationPopup } = useConfirmationPopup();
    const router = useRouter();

    // Every column carries a `size` so `features.virtualize` can be switched on
    // later without columns collapsing to MRT's default width.
    const columns = useMemo<MRT_ColumnDef<Product>[]>(
        () => [
            {
                id: "image",
                header: "Gambar",
                size: 56,
                enableSorting: false,
                enableColumnFilter: false,
                accessorFn: (row) => row.image_url ?? "",
                Cell: ({ row }) => <ProductThumb url={row.original.image_url} name={row.original.product_name} />,
            },
            {
                accessorKey: "product_name",
                header: "Product Name",
                size: 260,
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <div className="max-w-65 truncate" title={cell.getValue<string>()}>
                        {cell.getValue<string>()}
                    </div>
                ),
            },
            {
                accessorKey: "sku",
                header: "SKU",
                size: 140,
                enableColumnFilter: false,
            },
            {
                id: "product_type",
                accessorFn: (row) => PRODUCT_TYPE_LABELS[row.product_type] ?? row.product_type,
                header: "Tipe",
                size: 120,
                enableColumnFilter: false,
            },
            {
                id: "category",
                accessorFn: (row) => row.category?.name ?? "-",
                header: "Kategori",
                size: 160,
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                id: "unit",
                accessorFn: (row) => row.unit?.name ?? "-",
                header: "Satuan",
                size: 90,
                enableSorting: false,
                enableColumnFilter: false,
            },
            {
                id: "price",
                accessorFn: (row) => formatMoney(row.price),
                header: "Harga",
                size: 140,
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                        {cell.getValue<string>()}
                    </span>
                ),
            },
            {
                // COMMERCIAL Phase 5 (spec I5). A parent carries its variant
                // COUNT, so a reader can tell at a glance which rows are not
                // themselves quotable (A8) without expanding anything.
                id: "variant_count",
                accessorFn: (row) =>
                    row.parent_product_id
                        ? `Varian dari ${row.parent?.product_name ?? "-"}`
                        : (row.variant_count ?? 0) > 0
                            ? `${row.variant_count} varian`
                            : "-",
                header: "Varian",
                size: 160,
                enableSorting: false,
                enableColumnFilter: false,
                Cell: ({ row }) => {
                    const count = row.original.variant_count ?? 0;
                    if (row.original.parent_product_id) {
                        return (
                            <span className="text-xs text-gray-500">
                                Varian dari {row.original.parent?.product_name ?? "-"}
                            </span>
                        );
                    }
                    if (count === 0) return <span className="text-gray-400">-</span>;
                    return (
                        <Chip
                            icon={<Layers size={14} />}
                            label={`${count} varian`}
                            color="info"
                            size="small"
                            variant="outlined"
                        />
                    );
                },
            },
            {
                id: "status",
                // The export gets the label, the cell gets the chip.
                accessorFn: (row) => PRODUCT_STATUS_LABELS[row.status] ?? row.status,
                header: "Status",
                size: 110,
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Chip
                        label={PRODUCT_STATUS_LABELS[row.original.status] ?? row.original.status}
                        color={row.original.status === "active" ? "success" : "default"}
                        size="small"
                    />
                ),
            },
        ],
        []
    );

    return (
        <>
            {confirmationPopup}
            <SuperTable
                entityLabel="produk"
                searchPlaceholder="Cari nama atau kode produk"
                tableId="products-table"
                columns={columns}
                data={products || []}
                getRowId={(row) => row.id}
                isLoading={isLoading}
                isError={isError}
                errorMessage={errorMessage}
                onRetry={onRetry}
                rowCount={rowCount}
                resetPageKey={resetPageKey}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Package}
                        title="No products found"
                        description="Add products to build your catalog and use them in quotations."
                        action={
                            onAdd
                                ? { label: "Add Product", onClick: onAdd, icon: <Plus size={16} /> }
                                : undefined
                        }
                    />
                )}
                onStateChange={onStateChange}
                onExportRequest={onExportRequest as any}
                renderTopLeftToolbar={renderTopLeftToolbar}
                // COMMERCIAL Phase 5 (spec I5). A row with variants opens its
                // DETAIL PAGE, not the modal: the modal can only edit the
                // parent's own fields, and the interesting thing about a parent
                // is its children - which the modal has no room and no id-time
                // to show. Every other row keeps the Phase 0 behaviour.
                //
                // The ROW OBJECT still goes to the modal - not an id looked up
                // in the last batch, which broke editing anything past batch 1.
                onRowClick={(row) =>
                    (row.variant_count ?? 0) > 0
                        ? router.push(`/sales/product/${row.id}`)
                        : onEdit(row)
                }
                // ProductClient forwards `state.filters.{status,product_type,category_id}`
                // as GET /products params. No status filter = the server default.
                filters={[
                    {
                        id: "status",
                        label: "Status",
                        type: "select",
                        options: PRODUCT_STATUS_FILTER_OPTIONS,
                        anyLabel: "Aktif (bawaan)",
                    },
                    {
                        // The sanctioned "type chips": pinned in the toolbar, the
                        // active value renders as a removable chip.
                        id: "product_type",
                        label: "Tipe",
                        type: "select",
                        pinned: true,
                        options: PRODUCT_TYPE_OPTIONS,
                    },
                    {
                        // The server includes descendants of the chosen category.
                        id: "category_id",
                        label: "Kategori",
                        type: "select",
                        options: categoryOptions,
                        anyLabel: "Semua kategori",
                    },
                    {
                        // COMMERCIAL Phase 5 (spec I5 / E5.1). `GET /products`
                        // is TOP-LEVEL ONLY by default now - a catalogue of 20
                        // products with 6 variants each lists 20 rows, not 120.
                        // This chip puts the children back for the cases where a
                        // genuinely flat list is wanted (an export check, a
                        // search for one variant's SKU).
                        id: "include_variants",
                        label: "Tampilkan varian",
                        type: "boolean",
                    },
                ]}
                rowActions={[
                    {
                        // The child collections (varian, isi paket, konversi
                        // satuan) all need an existing product id, so they live
                        // on the detail page and not in the modal (spec I4).
                        id: "detail",
                        label: "Buka detail produk",
                        icon: <Layers size={16} />,
                        onClick: (row) => router.push(`/sales/product/${row.id}`),
                    },
                    {
                        id: "edit",
                        label: "Edit",
                        icon: <Pencil size={16} />,
                        onClick: (row) => onEdit(row),
                    },
                    {
                        id: "duplicate",
                        label: "Duplicate",
                        icon: <Copy size={16} />,
                        hidden: () => !onDuplicate,
                        onClick: (row) => onDuplicate?.([row]),
                    },
                    {
                        id: "archive",
                        label: "Arsipkan",
                        icon: <Archive size={16} />,
                        destructive: true,
                        // Archiving is idempotent server-side, but offering it on
                        // an archived row is noise. Un-archive is via Edit.
                        hidden: (row) => row.status === "archived",
                        onClick: (row) => {
                            confirm({
                                variant: "warning",
                                title: "Arsipkan produk",
                                description: `Arsipkan produk "${row.product_name}"? Produk tidak akan muncul di quotation baru. Quotation yang sudah ada tidak berubah, dan produk bisa diaktifkan kembali lewat Edit.`,
                                confirmText: "Arsipkan",
                                cancelText: "Batal",
                                onConfirm: async () => {
                                    const res = await onArchive(row);
                                    if (res.success) {
                                        notify.success("Produk diarsipkan", { description: `"${row.product_name}" tidak lagi ditawarkan di quotation baru.` });
                                    } else {
                                        notify.error("Gagal mengarsipkan", { description: res.error || "Terjadi kesalahan saat mengarsipkan produk." });
                                    }
                                },
                            });
                        },
                    },
                ]}
                renderBulkActions={({ selectedRows, clearSelection }: { selectedRows: any[], clearSelection: () => void }) => (
                    <div className="flex gap-2 items-center">
                        {onDuplicate && (
                            <AppButton
                                variantStyle="primary"
                                disabled={isDuplicating}
                                onClick={() => onDuplicate(selectedRows as Product[], clearSelection)}
                            >
                                {isDuplicating ? "Duplicating..." : `Duplicate (${selectedRows.length})`}
                            </AppButton>
                        )}
                        {onBulkArchive && (
                            <AppButton
                                variantStyle="danger"
                                disabled={isBulkArchiving}
                                onClick={() => onBulkArchive(selectedRows as Product[], clearSelection)}
                            >
                                {isBulkArchiving ? "Mengarsipkan..." : `Archive (${selectedRows.length})`}
                            </AppButton>
                        )}
                    </div>
                )}
                // Only a PARENT gets a panel. Returning null for every other
                // row is what stops MRT rendering an expander on rows that have
                // nothing to expand.
                renderDetailPanel={({ row }) =>
                    (row.original.variant_count ?? 0) > 0 ? (
                        <VariantDetailPanel product={row.original} />
                    ) : null
                }
                manualPagination={true}
                manualFiltering={true}
                manualSorting={true}
                features={{
                    sorting: true,
                    globalFilter: true,
                    columnFilters: false,
                    pagination: true,
                    rowSelection: 'multi',
                    export: { excel: true, csv: true },
                    densityToggle: true,
                    fullScreenToggle: true,
                    urlSync: true,
                }}
            />
        </>
    );
}
