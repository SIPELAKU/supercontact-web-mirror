"use client"

import CustomSelectStage from "@/components/pipeline/SelectDealStage"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/ui/filter"
import { formatRupiah } from "@/lib/helper/currency"
import { formatMDY } from "@/lib/helper/date"
import { useGetQuotationstore } from "@/lib/store/quotation"
import { Plus, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"

export const quotationStatus = [
    { value: "all", label: "All", bgColor: "bg-white", textColor: "text-black" },
    { value: "Accepted", label: "Accepted", bgColor: "bg-green-100", textColor: "text-green-800" },
    { value: "Pending", label: "Pending", bgColor: "bg-yellow-100", textColor: "text-yellow-800" },
    { value: "Rejected", label: "Rejected", bgColor: "bg-red-100", textColor: "text-red-800" },
]

export default function QuotationTable() {
    const router = useRouter();
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

    const handleRowClick = (quotationId: string) => {
        router.push(`/sales/quotation/${quotationId}`);
    };

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
                        placeholder="Search by name or quotation ID"
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

            <div className="overflow-hidden rounded-lg border border-gray-200 mx-6 mb-6">
                <Table>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!">
                            <TableCell><span className="text-[#6B7280]">Client</span></TableCell>
                            <TableCell><span className="text-[#6B7280]">Quotation ID</span></TableCell>
                            <TableCell><span className="text-[#6B7280]">Date</span></TableCell>
                            <TableCell><span className="text-[#6B7280]">Status</span></TableCell>
                            <TableCell><span className="text-[#6B7280]">Amount</span></TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <div className="py-8 text-gray-500">Loading...</div>
                                </TableCell>
                            </TableRow>
                        ) : listQuotations.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <div className="py-8 text-gray-500">No data available</div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            listQuotations.map((quotation) => (
                                <TableRow
                                    key={quotation.id}
                                    onClick={() => handleRowClick(quotation.id)}
                                    className="cursor-pointer hover:bg-gray-50"
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: '#f9fafb',
                                        },
                                        cursor: 'pointer',
                                    }}
                                >
                                    <TableCell>
                                        <span className="font-medium text-gray-900">
                                            {quotation.lead.contact.name}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-gray-900">
                                            {quotation.quotation_number}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-gray-900">
                                            {formatMDY(quotation.expire_date)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${quotation.quotation_status === "Accepted"
                                                    ? "bg-green-100 text-green-800"
                                                    : quotation.quotation_status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {quotation.quotation_status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-gray-900">
                                            {formatRupiah(quotation.grand_total)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={pagination.total}
                    rowsPerPage={pagination.limit}
                    page={pagination.page - 1}
                    onPageChange={(_, page) => setPage(page + 1)}
                    onRowsPerPageChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                    }}
                    rowsPerPageOptions={[5, 10, 15, 20]}
                    slotProps={{
                        select: {
                            inputProps: { 'aria-label': 'rows per page' }
                        }
                    }}
                />
            </div>
        </div>
    )
}
