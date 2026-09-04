"use client";

import { useMemo, useState } from "react";
import { Chip } from "@mui/material";
import { MRT_ColumnDef } from "@/components/ui/super-table";
import { SuperTable, SuperTableState } from "@/components/ui/super-table";
import {
    PRODUCT_STATUS_LABELS,
    PRODUCT_TYPE_LABELS,
    Product,
    useGetProductStore,
} from "@/lib/store/product";
import { formatRupiah } from "@/lib/helper/currency";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { AddProductModal } from "@/components/product/AddProductModal";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Archive, Copy, Package, Pencil, Plus } from "lucide-react";

export interface ProductTableProps {
    products: Product[];
    isLoading: boolean;
    isError?: boolean;
    errorMessage?: string;
    onRetry?: () => void;
    onAdd?: () => void;
    rowCount?: number;
    onStateChange?: (state: SuperTableState) => void;
    onExportRequest?: (params: any) => Promise<Product[]>;
    renderTopLeftToolbar?: () => React.ReactNode;
    /** DELETE /products/{id} archives; nothing is physically deleted any more. */
    onBulkArchive?: (products: Product[], clearSelection: () => void) => Promise<void>;
    isBulkArchiving?: boolean;
    onDuplicate?: (products: Product[], clearSelection?: () => void) => void;
    isDuplicating?: boolean;
}

/** GET /products `status` values as the user reads them. "Aktif" is the server default. */
export const PRODUCT_STATUS_FILTER_OPTIONS = [
    { value: "active", label: "Aktif" },
    { value: "archived", label: "Diarsipkan" },
    { value: "all", label: "Semua" },
];

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
    onBulkArchive,
    isBulkArchiving,
    onDuplicate,
    isDuplicating
}: ProductTableProps) {
    const { setEditId, archiveProduct } = useGetProductStore();
    const { confirm, confirmationPopup } = useConfirmationPopup();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const columns = useMemo<MRT_ColumnDef<Product>[]>(
        () => [
            {
                accessorKey: "product_name",
                header: "Product Name",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <div className="max-w-50 truncate" title={cell.getValue<string>()}>
                        {cell.getValue<string>()}
                    </div>
                ),
            },
            {
                accessorKey: "sku",
                header: "SKU",
                enableColumnFilter: false,
            },
            {
                id: "product_type",
                accessorFn: (row) => PRODUCT_TYPE_LABELS[row.product_type] ?? row.product_type,
                header: "Type",
                enableColumnFilter: false,
            },
            {
                id: "price",
                accessorFn: (row) => formatRupiah(row.price),
                header: "Price",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="font-medium text-gray-900 whitespace-nowrap">
                        {cell.getValue<string>()}
                    </span>
                ),
            },
            {
                id: "status",
                // The export gets the label, the cell gets the chip.
                accessorFn: (row) => PRODUCT_STATUS_LABELS[row.status] ?? row.status,
                header: "Status",
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

    const openEditModal = (product: Product) => {
        setIsModalOpen(true);
        setEditId(product.id);
    };

    return (
        <>
            {confirmationPopup}
            <AddProductModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            <SuperTable
                entityLabel="produk"
                searchPlaceholder="Cari nama atau kode produk"
                tableId="products-table"
                columns={columns}
                data={products || []}
                isLoading={isLoading}
                isError={isError}
                errorMessage={errorMessage}
                onRetry={onRetry}
                rowCount={rowCount}
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
                onRowClick={(row) => openEditModal(row)}
                // ProductClient reads `state.filters.status` and sends it as the
                // GET /products `status` query. No filter = the server default.
                filters={[
                    {
                        id: "status",
                        label: "Status",
                        type: "select",
                        options: PRODUCT_STATUS_FILTER_OPTIONS,
                        anyLabel: "Aktif (bawaan)",
                    },
                ]}
                rowActions={[
                    {
                        id: "edit",
                        label: "Edit",
                        icon: <Pencil size={16} />,
                        onClick: (row) => openEditModal(row),
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
                        label: "Archive",
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
                                    const res = await archiveProduct(row.id);
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
