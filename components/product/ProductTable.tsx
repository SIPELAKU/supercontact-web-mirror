"use client";

import { useMemo, useState } from "react";
import { MRT_ColumnDef } from "@/components/ui/super-table";
import { SuperTable, SuperTableState } from "@/components/ui/super-table";
import { Product, useGetProductStore } from "@/lib/store/product";
import { formatRupiah } from "@/lib/helper/currency";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { AddProductModal } from "@/components/product/AddProductModal";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Copy, Package, Pencil, Plus, Trash2 } from "lucide-react";

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
    onBulkDelete?: (products: Product[], clearSelection: () => void) => Promise<void>;
    isBulkDeleting?: boolean;
    onDuplicate?: (products: Product[], clearSelection?: () => void) => void;
    isDuplicating?: boolean;
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
    onBulkDelete,
    isBulkDeleting,
    onDuplicate,
    isDuplicating
}: ProductTableProps) {
    const { setEditId, deleteProduct } = useGetProductStore();
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
                id: "tax_rate",
                accessorFn: (row) => row.tax_rate ? `${row.tax_rate}%` : "-",
                header: "Tax Rate",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="font-medium text-gray-900">
                        {cell.getValue<string>()}
                    </span>
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
                        id: "delete",
                        label: "Delete",
                        icon: <Trash2 size={16} />,
                        destructive: true,
                        onClick: (row) => {
                            confirm({
                                variant: "danger",
                                title: "Delete Product",
                                description: `Are you sure you want to delete "${row.product_name}"? This action cannot be undone.`,
                                confirmText: "Delete",
                                cancelText: "Cancel",
                                onConfirm: async () => {
                                    await new Promise((resolve) => setTimeout(resolve, 1000));
                                    const res = await deleteProduct(row.id);
                                    if (res.success) {
                                        notify.success("Product Deleted", { description: `Product "${row.product_name}" has been successfully deleted.` });
                                    } else {
                                        notify.error("Failed to Delete", { description: res.error || "An error occurred while deleting the product." });
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
                        <AppButton
                            variantStyle="danger"
                            disabled={isBulkDeleting}
                            onClick={() => {
                                if (onBulkDelete) {
                                    onBulkDelete(
                                        selectedRows as Product[],
                                        clearSelection
                                    );
                                }
                            }}
                        >
                            {isBulkDeleting ? "Deleting..." : `Delete (${selectedRows.length})`}
                        </AppButton>
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
