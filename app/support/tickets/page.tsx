"use client";

import { useState } from "react";
import { Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSelect } from "@/components/ui/app-select";
import { InputSearch } from "@/components/ui/input-search";
import BannerDashboard from "@/components/ui/banner-dashboard";
import { TicketTable } from "@/components/support/tickets/TicketTable";
import { useTickets, useDeleteTicket } from "@/lib/hooks/useTickets";
import { useManageUsers } from "@/lib/hooks/useManageUsers";
import { AddTicketModal } from "@/components/support/tickets/modals/AddTicketModal";
import { EditTicketModal } from "@/components/support/tickets/modals/EditTicketModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Ticket } from "@/lib/types/Ticket";
import { notify } from "@/lib/notifications";
import Pagination from "@/components/ui/pagination";

export default function TicketManagementPage() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); // Standardize to 10 rows
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Select Status");
    const [priorityFilter, setPriorityFilter] = useState("Select Priority");
    const [agentFilter, setAgentFilter] = useState("Select Agent");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [deletingTicket, setDeletingTicket] = useState<Ticket | null>(null);

    // Data Fetching
    const { data: ticketData, isLoading } = useTickets(page, limit, search, statusFilter, priorityFilter, agentFilter);
    const { users: agents } = useManageUsers(1, 100);
    const deleteMutation = useDeleteTicket();

    const tickets = ticketData?.data?.tickets || [];
    const totalPages = ticketData?.data?.total_pages || 1;

    // Handlers
    const handleEdit = (ticket: Ticket) => setEditingTicket(ticket);
    const handleDeleteClick = (ticket: Ticket) => setDeletingTicket(ticket);

    const handleConfirmDelete = async () => {
        if (!deletingTicket) return;
        try {
            await deleteMutation.mutateAsync(deletingTicket.id);
            notify.success("Success", { description: "Ticket deleted successfully!" });
            setDeletingTicket(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message || "Failed to delete ticket" });
        }
    };

    const agentOptions = [
        { label: "Select Agent", value: "Select Agent" },
        ...agents.map((a: any) => ({ label: a.name, value: a.user_id }))
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            <BannerDashboard
                title="Ticket Management"
                description="Support • Ticket Management"
                variant="blue"
            />

            <div className="p-6 max-w-[1600px] mx-auto space-y-6">
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
                            onChange={setStatusFilter}
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
                            onChange={setPriorityFilter}
                        />
                        <AppSelect
                            options={agentOptions}
                            placeholder="Select Agent"
                            value={agentFilter}
                            onChange={setAgentFilter}
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
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by ID, subject, or keyword"
                                />
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
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

            <ConfirmModal
                isOpen={!!deletingTicket}
                onClose={() => setDeletingTicket(null)}
                onConfirm={handleConfirmDelete}
                title="Are you sure you want to delete this ticket?"
                description="This action is permanent and cannot be undone"
                confirmText="Delete Ticket"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
