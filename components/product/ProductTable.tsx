"use client"

import { AddProductModal } from "@/components/product/AddProductModal"
import { Button } from "@/components/ui-mui/button"
import { useConfirmation } from "@/components/ui-mui/confirm-modal"
import { CustomTable as Table } from "@/components/ui-mui/table"
import { formatRupiah } from "@/lib/helper/currency"
import { Product, useGetProductStore } from "@/lib/store/product"
import { Column } from "@/lib/type/Quotation"
import Pencil from "@/public/icons/pencil.png"
import Trash from "@/public/icons/trash.png"
import { Plus, Search } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

const columns: Column<Product>[] = [
    { key: "product_name", label: "Product Name", width: 8 },
    { key: "sku", label: "SKU", width: 8 },
    {
        key: "price",
        label: "Price",
        render: (row: Product) => (
            <span className="font-medium text-gray-900">{formatRupiah(row.price)}</span>
        ),
        width: 8,
    },
    {
        key: "tax_rate",
        label: "Tax Rate",
        render: (row) => (
            <span className="font-medium text-gray-900">{row.tax_rate}</span>
        ),
        width: 8,
    },
];

export default function ProductTable() {
    const { listProduct, pagination, setLimit, setPage, loading, setEditId, id, deleteProduct, searchQuery, setSearchQuery } = useGetProductStore();
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const { showConfirmation } = useConfirmation()


    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8">
            <AddProductModal open={isModalOpen} onOpenChange={setIsModalOpen} />
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 px-4 pt-5 w-full">
                <div
                    className="
                        flex items-center   
                        lg:w-[50%] w-full
                        h-10 rounded-lg bg-white border border-[#E5E7EB] px-3
                        hover:border-[#D1D5DB]
                        focus-within:border-[#60A5FA] focus-within:ring-1 focus-within:ring-[#60A5FA]
                        transition-all
                    "
                >
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by product name and sku"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                <Button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="
                        w-full sm:w-auto
                        bg-[#4F6DF5] hover:bg-[#3f58ce]
                        text-white gap-2 h-10 px-4 rounded-lg
                        flex justify-center
                    "
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden font-semibold sm:inline">Add New Product</span>
                    <span className="sm:hidden font-semibold">Add</span>
                </Button>

            </div>
            <Table
                data={listProduct}
                columns={columns}
                loading={loading}
                actionMode="inline"
                total={pagination.total}
                page={pagination.page}
                rowsPerPage={pagination.limit}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
                rowKey={(row) => row.id}
                actions={(row) => [
                    <button
                        key="edit"
                        onClick={() => {
                            console.log(row.id);
                            
                            setIsModalOpen(!isModalOpen)
                            setEditId(row.id)
                        }}
                        className="hover:underline text-sm"
                    >
                        <div className="flex gap-1 cursor-pointer">
                            <Image
                                src={Pencil}
                                height={34}
                                width={34}
                                alt="edit-button"
                            />
                        </div>
                    </button>,
                    <button
                        key="delete"
                        onClick={() => {
                            const data = listProduct.filter((item) => item.id === row.id)
                            showConfirmation({
                                type: "delete",
                                title: "Delete Product",
                                message: `Are you sure you want to delete "${data[0].product_name}"? This action cannot be undone.`,
                                confirmText: "Delete",
                                cancelText: "Cancel",
                                onConfirm: async () => {
                                    await new Promise((resolve) => setTimeout(resolve, 1000))
                                    await deleteProduct(row.id)
                                },
                            })
                        }}
                        className="hover:underline text-sm"
                    >
                        <div className="flex gap-1 cursor-pointer">
                            <Image
                                src={Trash}
                                height={34}
                                width={34}
                                alt="delete-button"
                            />
                        </div>
                    </button>
                ]}
            />
        </div>
    )
}
