"use client";

import { useState, useRef } from "react";
import { Plus, Printer } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { TicketTable } from "@/components/support/tickets/TicketTable";
import {
    useTickets,
    useDeleteTicket,
    useBulkDeleteTickets,
    useBulkAssignTickets,
    useBulkUpdateTickets,
} from "@/lib/hooks/useTickets";
import { TicketStatus } from "@/lib/types/Ticket";
import { AddTicketModal } from "@/components/support/tickets/modals/AddTicketModal";
import { EditTicketModal } from "@/components/support/tickets/modals/EditTicketModal";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { Ticket } from "@/lib/types/Ticket";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";
import { usePermission } from "@/lib/hooks/usePermission";


import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import PageHeader from "@/components/ui/page-header";
import { SuperTableState } from "@/components/ui/super-table";

export default function TicketManagementPage() {
    const { token } = useAuth();
    const { can } = usePermission();
    const canWrite = can(["tickets:write:my", "tickets:write:team", "tickets"]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);

    // ===== TABLE STATE (Driven by SuperTable) ===== //
    const [tableState, setTableState] = useState({
        pageIndex: 0,
        pageSize: 10,
        globalFilter: "",
        columnFilters: [] as { id: string; value: unknown }[],
        sorting: [{ id: "updated_at", desc: true }] as { id: string; desc: boolean }[],
    });

    // Confirmation Hook
    const { showConfirmation } = useConfirmation();

    // Helper to extract specific column filter value
    const getFilterValue = (id: string) => {
        const filter = tableState.columnFilters.find((f) => f.id === id);
        return filter ? (filter.value as string) : "";
    };

    // Server-side sorting (sort_by/sort_order contract)
    const sortParam = tableState.sorting[0];
    const sortByParam = sortParam?.id;
    const sortOrderParam: "asc" | "desc" | undefined = sortParam
        ? (sortParam.desc ? "desc" : "asc")
        : undefined;

    // Data Fetching
    const { data: ticketData, isLoading, isError } = useTickets(
        tableState.pageIndex + 1, // API is 1-indexed
        tableState.pageSize,
        tableState.globalFilter,
        getFilterValue("status"),
        getFilterValue("priority"),
        getFilterValue("assigned_agent"),
        sortByParam,
        sortOrderParam
    );

    const deleteMutation = useDeleteTicket();
    const bulkDeleteMutation = useBulkDeleteTickets();
    const bulkAssignMutation = useBulkAssignTickets();
    const bulkUpdateMutation = useBulkUpdateTickets();

    const tickets = ticketData?.data?.tickets || [];
    const totalTickets = ticketData?.data?.total || 0;

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

    const handleBulkDelete = async (selectedTickets: Ticket[], clearSelection: () => void) => {
        try {
            const res = await bulkDeleteMutation.mutateAsync(selectedTickets.map((t) => t.id));
            const { succeeded, failed } = res.data;
            clearSelection();
            if (succeeded.length > 0) {
                notify.success("Success", { description: `${succeeded.length} ticket(s) deleted successfully` });
            }
            if (failed.length > 0) {
                notify.error("Error", { description: `${failed.length} ticket(s) failed to delete` });
            }
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Gagal menghapus tiket" });
        }
    };

    const handleBulkAssign = async (selectedTickets: Ticket[], agentId: string, clearSelection: () => void) => {
        try {
            const res = await bulkAssignMutation.mutateAsync({
                ticketIds: selectedTickets.map((t) => t.id),
                assignedAgentId: agentId,
            });
            const { succeeded, failed } = res.data;
            clearSelection();
            if (succeeded.length > 0) {
                notify.success("Success", { description: `${succeeded.length} ticket(s) assigned successfully` });
            }
            if (failed.length > 0) {
                notify.error("Error", { description: `${failed.length} ticket(s) failed to assign` });
            }
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Gagal menugaskan tiket" });
        }
    };

    const handleBulkStatusChange = async (selectedTickets: Ticket[], status: TicketStatus, clearSelection: () => void) => {
        try {
            const res = await bulkUpdateMutation.mutateAsync({
                ticketIds: selectedTickets.map((t) => t.id),
                data: { status },
            });
            const { succeeded, failed } = res.data;
            clearSelection();
            if (succeeded.length > 0) {
                notify.success("Success", { description: `${succeeded.length} ticket(s) updated successfully` });
            }
            if (failed.length > 0) {
                notify.error("Error", { description: `${failed.length} ticket(s) failed to update` });
            }
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Gagal memperbarui tiket" });
        }
    };

    const handleTableStateChange = (state: SuperTableState) => {
        setTableState({
            pageIndex: state.pagination.pageIndex,
            pageSize: state.pagination.pageSize,
            globalFilter: state.globalFilter,
            columnFilters: state.columnFilters,
            sorting: state.sorting || [],
        });
    };

    const handleExportRequest = async (params: { format: "csv" | "excel", currentState: SuperTableState }) => {
        try {
            const search = params.currentState.globalFilter;
            const status = getFilterValue("status");
            const priority = getFilterValue("priority");
            const agentId = getFilterValue("assigned_agent");

            const LIMIT_PER_PAGE = 100;
            let allData: any[] = [];
            let currentPage = 1;
            let totalPages = 1;

            do {
                const urlParams = new URLSearchParams();
                urlParams.set("page", String(currentPage));
                urlParams.set("limit", String(LIMIT_PER_PAGE));
                if (search) urlParams.set("search", search);
                if (status) urlParams.set("status", status);
                if (priority) urlParams.set("priority", priority);
                if (agentId) urlParams.set("assigned_agent_id", agentId);
                if (sortByParam) {
                    urlParams.set("sort_by", sortByParam);
                    urlParams.set("sort_order", sortOrderParam ?? "asc");
                }
                
                const response = await fetch(
                    `/api/proxy/tickets?${urlParams.toString()}`,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
                );
                const data = await response.json();
                
                const items = data?.data?.tickets || [];
                totalPages = data?.data?.total_pages || 1;
                allData = [...allData, ...items];
                currentPage++;
                
            } while (currentPage <= totalPages);
            
            return allData;
        } catch (err) {
            console.error("Export error:", err);
            return [];
        }
    };

    // Legacy Print (Will be updated in Task 3)
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Tickets",
    });

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

    return (
        <div className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 pt-6 space-y-6">
            <PageHeader
                title="Tickets"
                breadcrumbs={[{ label: "Support" }, { label: "Tickets" }]}
            />

            <div className="w-full overflow-x-auto">
                <TicketTable
                    tickets={tickets}
                    isLoading={isLoading}
                    isError={isError}
                    rowCount={totalTickets}
                    onStateChange={handleTableStateChange}
                    onExportRequest={handleExportRequest}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onBulkDelete={handleBulkDelete}
                    isBulkDeleting={bulkDeleteMutation.isPending}
                    onBulkAssign={handleBulkAssign}
                    isBulkAssigning={bulkAssignMutation.isPending}
                    onBulkStatusChange={handleBulkStatusChange}
                    isBulkChangingStatus={bulkUpdateMutation.isPending}
                    renderTopLeftToolbar={() => (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:flex gap-2">
                                {canWrite && (
                                    <AppButton
                                        onClick={() => setIsAddModalOpen(true)}
                                        startIcon={<Plus size={16} />}
                                    >
                                        Add Ticket
                                    </AppButton>
                                )}
                                <AppButton
                                    variantStyle="outline"
                                    onClick={handlePrint}
                                    startIcon={<Printer size={16} />}
                                >
                                    Print PDF
                                </AppButton>
                            </div>

                            {/* Mobile — icon only, ukuran w-9 h-9 */}
                            <div className="flex md:hidden gap-2">
                                {canWrite && (
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center justify-center w-9 h-9 rounded-md border border-[#5479EE] text-[#5479EE] hover:bg-blue-50 transition-colors"
                                >
                                    <Printer size={16} />
                                </button>
                            </div>
                        </>
                    )}
                />
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
                    title="Tickets"
                    data={tickets}
                    columns={printableColumns}
                />
            </div>
        </div>
    );
}