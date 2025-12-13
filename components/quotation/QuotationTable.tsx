"use client"

import { useState } from "react"
import { Search, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui-mui/button"
import { FilterBar } from "@/components/ui-mui/filter"
import { CustomTable as Table } from "@/components/ui-mui/table"
import { Column } from "@/lib/type/Quotation"
import QuotationList from '@/lib/data/quotationList.json'
import Link from "next/link"

export default function QuatationTable() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState("all")
    const [dateRangeFilter, setDateRangeFilter] = useState("all")

    const columns: Column<(typeof QuotationList)[0]>[] = [
        { key: "client", label: "Client", width: 18 },
        { key: "id", label: "Quotation ID", width: 14 },
        { key: "date", label: "Date", width: 12 },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${row.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : row.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.status}
                </span>
            ),
            width: 12,
        },
        {
            key: "amount",
            label: "Amount",
            render: (row) => (
                <span className="font-medium text-gray-900">{row.amount}</span>
            ),
            width: 12,
        },
    ];


    const filteredData = QuotationList.filter((q) => {
        const matchSearch =
            q.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.id.toLowerCase().includes(searchQuery.toLowerCase())

        const matchStatus =
            statusFilter === "all" ||
            q.status.toLowerCase() === statusFilter.toLowerCase()

        return matchSearch && matchStatus
    })

    return (
        <div className="rounded-2xl shadow-sm border border-gray-200 space-y-8 overflow-visible">
            <div className="px-6 pt-5">
                <h2 className="font-medium pb-2">Filters</h2>
                <FilterBar
                    width="680px"
                    filters={[
                        {
                            type: "dropdown",
                            label: "Select Status",
                            value: statusFilter,
                            options: [
                                { label: "All", value: "all" },
                                { label: "Active", value: "active" },
                                { label: "Closed", value: "closed" }
                            ],
                            onChange: setStatusFilter,
                        },
                        {
                            type: "dropdown",
                            label: "Select By Date Range",
                            value: dateRangeFilter,
                            options: [
                                { label: "All Time", value: "all" },
                                { label: "This Month", value: "month" },
                                { label: "This Quarter", value: "quarter" },
                            ],
                            onChange: setDateRangeFilter,
                        },
                    ]}
                />
            </div>

            <div className="border-b w-full p-0 border-gray-300" />

            <div className="flex justify-between items-center gap-4 px-6 w-full">
                <div
                    className="flex items-center min-w-[550px] h-10 rounded-lg bg-white border border-[#E5E7EB] px-3 hover:border-[#D1D5DB] focus-within:border-[#60A5FA] focus-within:ring-1 focus-within:ring-[#60A5FA] transition-all"
                >
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                        type="text"
                        placeholder="Search by name or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                <Link href={"/sales/quotation/add"}>
                    <Button className="bg-[#4F6DF5] hover:bg-[#3f58ce] text-white gap-2 h-10 px-4 rounded-lg">
                        <Plus className="h-4 w-4" />
                        <span className="hidden font-semibold sm:inline">Add New Quotation</span>
                        <span className="sm:hidden font-semibold">Add</span>
                    </Button>
                </Link>
            </div>

            <Table
                data={filteredData}
                columns={columns}
            />

        </div>
    )
}
