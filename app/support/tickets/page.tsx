"use client";

import { useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import InputSearch from "@/components/ui/input-search";
import BannerDashboard from "@/components/ui/banner-dashboard";
import { TicketTable } from "@/components/support/tickets/TicketTable";
import { useTickets, useDeleteTicket } from "@/lib/hooks/useTickets";
import { useManagedUsers } from "@/lib/hooks/useManagedUser";
import { AddTicketModal } from "@/components/support/tickets/modals/AddTicketModal";
import { EditTicketModal } from "@/components/support/tickets/modals/EditTicketModal";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { Ticket } from "@/lib/types/Ticket";
import { notify } from "@/lib/notifications";
import Pagination from "@/components/ui/pagination";
import { useSearchParams } from "next/navigation";

export default function TicketManagementPage() {
    const searchParams = useSearchParams();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // Standardize to 10 rows
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Select Status");
    const [priorityFilter, setPriorityFilter] = useState("Select Priority");
    const [agentFilter, setAgentFilter] = useState("Select Agent");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

    // Confirmation Hook
    const { showConfirmation } = useConfirmation();

    // Data Fetching
    const { data: ticketData, isLoading } = useTickets(page, limit, search, statusFilter, priorityFilter, agentFilter);
    const { data: userData } = useManagedUsers(1, 100);
    const deleteMutation = useDeleteTicket();

    const tickets = ticketData?.data?.tickets || [];
    const totalPages = ticketData?.data?.total_pages || 1;
    const agents = userData?.data?.manage_users || [];

    // Handlers
    const handleEdit = (ticket: Ticket) => setEditingTicket(ticket);
    const handleDeleteClick = (ticket: Ticket) => {
        showConfirmation({
            type: "delete",
            title: "Delete Ticket",
            message: `Are you sure you want to delete ticket #${ticket.id}? This action cannot be undone.`,
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
        { label: "Select Agent", value: "Select Agent" },
        ...agents.map((a: any) => ({ label: a.fullname, value: a.id }))
    ];

    return (
        <div className="min-h-screen bg-[#ffffff] p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <BannerDashboard
                    title="Ticket Management"
                />

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                    <h3 className="font-semibold text-lg text-gray-800">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <AppSelect
                            options={[
                                { label: "Select Status", value: "Select Status" },
                                { label: "Open", value: "Open" },
                                { label: "In Progress", value: "In Progress" },
                                { label: "Closed", value: "Closed" },
                            ]}
                            placeholder="Select Status"
                            value={statusFilter}
                            isBgWhite={true}
                            onChange={(e) => setStatusFilter(e.target.value as string)}
                        />
                        <AppSelect
                            options={[
                                { label: "Select Priority", value: "Select Priority" },
                                { label: "High", value: "High" },
                                { label: "Medium", value: "Medium" },
                                { label: "Low", value: "Low" },
                            ]}
                            placeholder="Select Priority"
                            value={priorityFilter}
                            isBgWhite={true}
                            onChange={(e) => setPriorityFilter(e.target.value as string)}
                        />
                        <AppSelect
                            options={agentOptions}
                            placeholder="Select Agent"
                            value={agentFilter}
                            isBgWhite={true}
                            onChange={(e) => setAgentFilter(e.target.value as string)}
                        />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between gap-4 pt-2 border-t border-gray-100">
                        <Button variant="outline" className="text-gray-600 gap-2">
                            <Upload className="w-4 h-4" />
                            Export
                        </Button>

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
                    </div>
                </div>

                {/* Table */}
                <TicketTable
                    tickets={tickets}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                />

                {/* Pagination */}
                {!isLoading && tickets.length > 0 && (
                    <div className="flex justify-end">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}
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
        </div>
    );
}
