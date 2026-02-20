"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import InputSearch from "@/components/ui/input-search";
import BannerDashboard from "@/components/ui/banner-dashboard";
import { TicketTable } from "@/components/support/tickets/TicketTable";
import { useTickets, useDeleteTicket, useAssignableAgents } from "@/lib/hooks/useTickets";
import { AddTicketModal } from "@/components/support/tickets/modals/AddTicketModal";
import { EditTicketModal } from "@/components/support/tickets/modals/EditTicketModal";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { Ticket } from "@/lib/types/Ticket";
import { notify } from "@/lib/notifications";
import Pagination from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

import { Card, CardHeader, Divider, Box, TablePagination } from "@mui/material";
import ExportPopover from "./ExportPopover";
import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import PageHeader from "@/components/ui/page-header";

export default function TicketManagementPage() {
    const searchParams = useSearchParams();
    const [page, setPage] = useState(0); // MUI TablePagination uses 0-indexed page
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Select Status");
    const [priorityFilter, setPriorityFilter] = useState("Select Priority");
    const [agentFilter, setAgentFilter] = useState("Select Agent");
    const [agentSearch, setAgentSearch] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Reset page on search or filter change
    useEffect(() => {
        setPage(0);
    }, [search, statusFilter, priorityFilter, agentFilter]);

    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    // Confirmation Hook
    const { showConfirmation } = useConfirmation();

    // Data Fetching
    const { data: ticketData, isLoading } = useTickets(page + 1, limit, search, statusFilter, priorityFilter, agentFilter);
    const { data: agentData, isLoading: isLoadingAgents } = useAssignableAgents(agentSearch);
    const deleteMutation = useDeleteTicket();

    const tickets = ticketData?.data?.tickets || [];
    const totalTickets = ticketData?.data?.total || 0;
    const agents = agentData?.data || [];

    // Handlers
    const handleEdit = (ticket: Ticket) => setEditingTicket(ticket);
    const handleDeleteClick = (ticket: Ticket) => {
        showConfirmation({
            type: "delete",
            title: "Delete Ticket",
            message: `Are you sure you want to delete ticket #${ticket.ticket_code}? This action cannot be undone.`,
            confirmText: "Delete",
            onConfirm: async () => {
                try {
                    await deleteMutation.mutateAsync(ticket.id);
                    notify.success("Success", { description: "Ticket deleted successfully!" });
                } catch (error: any) {
                    notify.error("Error", { description: error.message || "Failed to delete ticket" });
                }
            },
        });
    };

    const agentOptions = [
        ...agents.map((a: any) => ({ label: a.fullname, value: a.id }))
    ];

    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const handleAgentSearchChange = useCallback((event: any, value: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            setAgentSearch(value);
        }, 300);
    }, []);

    const columns = [
        { id: "ticket_code", label: "Ticket ID" },
        { id: "subject", label: "Subject" },
        { id: "priority", label: "Priority" },
        { id: "status", label: "Status" },
        { id: "assigned_agent.fullname", label: "Assigned Agent" },
    ];

    const printableColumns = [
        { header: "Ticket ID", accessorKey: "ticket_code" },
        { header: "Subject", accessorKey: "subject" },
        { header: "Priority", accessorKey: "priority" },
        { header: "Status", accessorKey: "status" },
        {
            header: "Assigned Agent",
            accessorKey: "assigned_agent",
            cell: (item: any) => item.assigned_agent?.fullname || "-"
        },
    ];

    const handleExportCSV = () => {
        if (!tickets || tickets.length === 0) return notify.error("Error", {
            description: "Ticket data is empty"
        })
        const headers = columns.map((col) => col.label);
        const keys = columns.map((col) => col.id);

        const getNestedValue = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const csvContent = [
            headers.join(","),
            ...tickets.map((item) =>
                keys
                    .map((key) => {
                        const val = getNestedValue(item, key) || "";
                        return `"${String(val).replace(/"/g, '""')}"`;
                    })
                    .join(","),
            ),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "ticket_export.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Tickets",
    });

    return (
        <div className="min-h-screen bg-[#ffffff] p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <PageHeader
                    title="Ticket Management"
                    breadcrumbs={[{ label: "Support" }, { label: "Ticket" }]}
                />

                <Card className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                    <CardHeader title="Filters" />
                    <Box sx={{ p: 4, pt: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <AppSelect
                                options={[
                                    { label: "All Status", value: "" },
                                    { label: "Open", value: "Open" },
                                    { label: "In Progress", value: "In Progress" },
                                    { label: "Closed", value: "Closed" },
                                ]}
                                placeholder="Select Status"
                                value={statusFilter === "Select Status" ? "" : statusFilter}
                                isBgWhite={true}
                                onChange={(e) => setStatusFilter(e.target.value as string || "Select Status")}
                            />
                            <AppSelect
                                options={[
                                    { label: "All Priority", value: "" },
                                    { label: "High", value: "High" },
                                    { label: "Medium", value: "Medium" },
                                    { label: "Low", value: "Low" },
                                ]}
                                placeholder="Select Priority"
                                value={priorityFilter === "Select Priority" ? "" : priorityFilter}
                                isBgWhite={true}
                                onChange={(e) => setPriorityFilter(e.target.value as string || "Select Priority")}
                            />
                            <AppAutocomplete
                                options={agentOptions}
                                placeholder="Select Agent"
                                value={agentFilter !== "Select Agent" ? (agentOptions.find((opt: any) => opt.value === agentFilter) || null) : null}
                                onChange={(e, newValue) => {
                                    setAgentFilter((newValue as any)?.value || "Select Agent");
                                }}
                                onInputChange={handleAgentSearchChange}
                                loading={isLoadingAgents}
                                isBgWhite={true}
                            />
                        </div>
                    </Box>

                    <Divider />

                    {/* Toolbar */}
                    <Box sx={{ p: 2, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ExportPopover
                            onExportCSV={handleExportCSV} onPrint={handlePrint}
                        />

                        <div className="flex gap-4">
                            <div className="relative w-full md:w-[320px]">
                                <InputSearch
                                    placeholder="Search by ID, subject, or keyword"
                                    handleSearch={setSearch}
                                    searchParams={searchParams}
                                />
                            </div>
                            <Button
                                className="bg-[#5479EE] hover:bg-[#4a6cd9] text-white gap-2"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                <Plus className="w-4 h-4" />
                                Add Ticket
                            </Button>
                        </div>
                    </Box>

                    {/* Table Area */}
                    <Box sx={{ p: 0 }}>
                        <TicketTable
                            tickets={tickets}
                            isLoading={isLoading}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                        />
                    </Box>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={totalTickets}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={limit}
                        onRowsPerPageChange={(e) => {
                            setLimit(parseInt(e.target.value, 10));
                            setPage(0);
                        }}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        sx={{ borderTop: '1px solid #e5e7eb' }}
                    />
                </Card>
            </div>

            {/* Modals */}
            <AddTicketModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditTicketModal
                isOpen={!!editingTicket}
                onClose={() => setEditingTicket(null)}
                ticket={editingTicket}
            />

            <div style={{ display: "none" }}>
                <PrintableTable
                    ref={componentRef}
                    title="Ticket Management"
                    data={tickets}
                    columns={printableColumns}
                />
            </div>
        </div>
    );
}