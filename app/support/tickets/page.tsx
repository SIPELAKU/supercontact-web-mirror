"use client";

import { useState, useRef } from "react";
import { Plus, Printer } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { TicketTable } from "@/components/support/tickets/TicketTable";
import { useTickets, useDeleteTicket } from "@/lib/hooks/useTickets";
import { AddTicketModal } from "@/components/support/tickets/modals/AddTicketModal";
import { EditTicketModal } from "@/components/support/tickets/modals/EditTicketModal";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { Ticket } from "@/lib/types/Ticket";
import { notify } from "@/lib/notifications";
import { useAuth } from "@/lib/context/AuthContext";


import { useReactToPrint } from "react-to-print";
import { PrintableTable } from "@/components/ui/printable-table";
import PageHeader from "@/components/ui/page-header";
import { SuperTableState } from "@/components/ui/super-table";

export default function TicketManagementPage() {
    const { token } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);

    // ===== TABLE STATE (Driven by SuperTable) ===== //
    const [tableState, setTableState] = useState({
        pageIndex: 0,
        pageSize: 10,
        globalFilter: "",
        columnFilters: [] as { id: string; value: unknown }[],
    });

    // Confirmation Hook
    const { showConfirmation } = useConfirmation();

    // Helper to extract specific column filter value
    const getFilterValue = (id: string) => {
        const filter = tableState.columnFilters.find((f) => f.id === id);
        return filter ? (filter.value as string) : "";
    };

    // Data Fetching
    const { data: ticketData, isLoading, isError } = useTickets(
        tableState.pageIndex + 1, // API is 1-indexed
        tableState.pageSize,
        tableState.globalFilter,
        getFilterValue("status"),
        getFilterValue("priority"),
        getFilterValue("assigned_agent")
    );

    const deleteMutation = useDeleteTicket();

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
        console.log("handleBulkDelete dipanggil");
        console.log("Jumlah tiket:", selectedTickets.length);
        console.log("deleteMutation:", deleteMutation);
        console.log("mutateAsync:", deleteMutation?.mutateAsync);

        setIsBulkDeleting(true);
        let successCount = 0;
        let failCount = 0;
        
        for (const ticket of selectedTickets) {
            try {
                console.log("Mencoba hapus ticket:", ticket.id);
                await deleteMutation.mutateAsync(ticket.id);
                console.log("Berhasil hapus:", ticket.id);
                successCount++;
            } catch (error: any) {
                console.error("Gagal hapus ticket:", ticket.id);
                console.error("Error detail:", error);
                console.error("Error message:", error?.message);
                failCount++;
            }
        }
        
        setIsBulkDeleting(false);
        clearSelection();
        
        if (successCount > 0) {
            notify.success("Success", { description: `${successCount} tiket berhasil dihapus` });
        }
        if (failCount > 0) {
            notify.error("Error", { description: `${failCount} tiket gagal dihapus` });
        }
    };

    const handleTableStateChange = (state: SuperTableState) => {
        setTableState({
            pageIndex: state.pagination.pageIndex,
            pageSize: state.pagination.pageSize,
            globalFilter: state.globalFilter,
            columnFilters: state.columnFilters,
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
                title="Ticket Management"
                breadcrumbs={[{ label: "Support" }, { label: "Ticket" }]}
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
                    isBulkDeleting={isBulkDeleting}
                    renderTopLeftToolbar={() => (
                        <>
                            {/* Desktop */}
                            <div className="hidden md:flex gap-2">
                                <AppButton
                                    onClick={() => setIsAddModalOpen(true)}
                                    startIcon={<Plus size={16} />}
                                >
                                    Add Ticket
                                </AppButton>
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
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center justify-center w-9 h-9 rounded-md bg-[#5479EE] text-white hover:bg-[#3F66E0] transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
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
                    title="Ticket Management"
                    data={tickets}
                    columns={printableColumns}
                />
            </div>
        </div>
    );
}