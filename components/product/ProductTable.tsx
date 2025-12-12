"use client"

import { Trash2, Pencil } from "lucide-react"
import { CustomTable as Table } from "@/components/ui-mui/table"
import { Column } from "@/lib/type/Quotation"

const product = [
    {
        id: "prod-2024-001",
        productName: "Premium Subscription",
        sku: "SKU-001",
        price: "$199.00",
        tax: "5",

    },
    {
        id: "prod-2024-002",
        productName: "Standard Subscription",
        sku: "SKU-002",
        price: "$99.00",
        tax: "5",
    },
    {
        id: "prod-2024-003",
        productName: "Basic Subscription",
        sku: "SKU-003",
        price: "$9.00",
        tax: "5",
    },
]

export default function ProductTable() {

    const columns: Column<(typeof product)[0]>[] = [
        { key: "productName", label: "Product Name", width: 16 },
        { key: "sku", label: "SKU", width: 14 },
        {
            key: "price",
            label: "Price",
            render: (row) => (
                <span className="font-medium text-gray-900">{row.price}</span>
            ),
            width: 12,
        },
        {
            key: "tax",
            label: "Tax Rate",
            render: (row) => (
                <span className="font-medium text-gray-900">{row.tax}</span>
            ),
            width: 12,
        },
    ];


    return (
        <div className="space-y-6">
            <Table
                data={product}
                columns={columns}
                actionMode="inline"
                actions={(row) => [
                    <button
                        key="edit"
                        onClick={() => console.log("edit", row.id)}
                        className="hover:underline text-sm"
                    >
                        <div className="flex items-center gap-1 cursor-pointer">
                            <Pencil className="w-4 h-4" />
                        </div>
                    </button>,
                    <button
                        key="delete"
                        onClick={() => console.log("delete", row.id)}
                        className="hover:underline text-sm"
                    >
                        <div className="flex items-center gap-1 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                        </div>
                    </button>
                ]}
            />
        </div>
    )
}
