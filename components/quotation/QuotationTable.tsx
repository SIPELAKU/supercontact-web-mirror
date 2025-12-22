"use client"

import { useState } from "react"
import { Search, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui-mui/button"
import { FilterBar } from "@/components/ui-mui/filter"
import { CustomTable as Table } from "@/components/ui-mui/table"
import { Column } from "@/lib/type/Quotation"
import Link from "next/link"
import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import { useGetQuotationstore } from "@/lib/store/quotation"
import { formatRupiah } from "@/lib/helper/currency"

export const quotationStatus = [
    { value: "all", label: "All", bgColor: "bg-white", textColor: "text-black" },
    { value: "Accepted", label: "Accepted", bgColor: "bg-green-100", textColor: "text-green-800" },
    { value: "Pending", label: "Pending", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    { value: "Rejected", label: "Rejected", bgColor: "bg-red-100", textColor: "text-red-800" },
]

export default function QuatationTable() {
    const {
        listQuotations,
        pagination,
        setLimit,
        setPage,
        loading,
        searchQuery,
        setSearchQuery,
        dateRangeFilter,
        setDateRangeFilter,
        statusFilter,
        setStatusFilter
    } = useGetQuotationstore();

    const columns: Column<(typeof listQuotations)[0]>[] = [
        { key: "client", label: "Client", width: 18 },
        { key: "id", label: "Quotation ID", width: 14 },
        { key: "date", label: "Date", width: 12 },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${row.quotation_status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : row.quotation_status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                >
                    {row.quotation_status}
                </span>
            ),
            width: 12,
        },
        {
            key: "amount",
            label: "Amount",
            render: (row) => (
                <span className="font-medium text-gray-900">{formatRupiah(row.grand_total)}</span>
            ),
            width: 12,
        },
    ];

    return (
        <div className="rounded-2xl shadow-sm border border-gray-200 space-y-8 overflow-visible">
            <div className="px-6 pt-5">
                <h2 className="font-medium pb-2">Filters</h2>
                <FilterBar
                    width="680px"
                    filters={[
                        {
                            type: "custom",
                            component: (
                                <CustomSelectStage
                                    placeholder="Select All"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    data={quotationStatus}
                                    className="bg-white rounded-lg font-normal"
                                />
                            )
                        },
                        {
                            type: "custom",
                            component: (
                                <CustomSelectStage
                                    placeholder="Select By Date Range"
                                    value={dateRangeFilter}
                                    onChange={setDateRangeFilter}
                                    data={[
                                        { label: "All", value: "all" },
                                        { label: "Today", value: "today" },
                                        { label: "This Week", value: "this_week" },
                                        { label: "Last Week", value: "last_week" },
                                        { label: "This Month", value: "this_month" },
                                        { label: "Last Month", value: "last_month" }
                                    ]}
                                    className="bg-white rounded-lg font-normal"
                                />
                            )
                        },
                    ]}
                />
            </div>

            <div className="border-b w-full p-0 border-gray-300" />

            <div className="flex justify-between items-center gap-4 px-6 w-full">
                <div
                    className="flex items-center min-w-137.5 h-10 rounded-lg bg-white border border-[#E5E7EB] px-3 hover:border-[#D1D5DB] focus-within:border-[#60A5FA] focus-within:ring-1 focus-within:ring-[#60A5FA] transition-all"
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
                data={listQuotations}
                rowKey={(row) => row.id}
                columns={columns}
                loading={loading}
                total={pagination.total}
                page={pagination.page}
                rowsPerPage={pagination.limit}
                onPageChange={setPage}
                onRowsPerPageChange={setLimit}
            />

        </div>
    )
}
