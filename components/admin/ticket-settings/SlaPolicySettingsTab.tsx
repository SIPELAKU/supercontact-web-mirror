"use client";

import { useMemo, useState } from "react";
import { Plus, Timer, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    useTicketSlaPolicies,
    useCreateTicketSlaPolicy,
    useDeleteTicketSlaPolicy,
} from "@/lib/hooks/useTicketSlaPolicies";
import { useTicketCategories } from "@/lib/hooks/useTicketCategories";
import { useBusinessHours } from "@/lib/hooks/useBusinessHours";
import { TicketSlaPolicy, TicketSlaPriority } from "@/lib/types/TicketSettings";

const PRIORITY_OPTIONS: { value: TicketSlaPriority; label: string }[] = [
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

function formatMinutes(minutes: number): string {
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export default function SlaPolicySettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketSlaPolicies();
    const policies = data?.data?.data || [];
    const { data: categoriesData } = useTicketCategories();
    const categories = categoriesData?.data?.data || [];
    const { data: calendarsData } = useBusinessHours();
    const calendars = calendarsData?.data?.data || [];

    const createMutation = useCreateTicketSlaPolicy();
    const deleteMutation = useDeleteTicketSlaPolicy();

    const [name, setName] = useState("");
    const [priority, setPriority] = useState<TicketSlaPriority | "">("");
    const [categoryId, setCategoryId] = useState("");
    const [firstResponseMinutes, setFirstResponseMinutes] = useState("60");
    const [resolutionMinutes, setResolutionMinutes] = useState("480");
    const [calendarId, setCalendarId] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setName("");
        setPriority("");
        setCategoryId("");
        setFirstResponseMinutes("60");
        setResolutionMinutes("480");
        setCalendarId("");
    };

    const handleAdd = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a policy name." });
            return;
        }
        const firstResponse = Number(firstResponseMinutes);
        const resolution = Number(resolutionMinutes);
        if (!firstResponse || firstResponse <= 0 || !resolution || resolution <= 0) {
            notify.warning("Validation Error", { description: "Targets must be positive numbers of minutes." });
            return;
        }
        try {
            await createMutation.mutateAsync({
                name: name.trim(),
                priority: priority || null,
                category_id: categoryId || null,
                first_response_target_minutes: firstResponse,
                resolution_target_minutes: resolution,
                business_hours_calendar_id: calendarId || null,
            });
            notify.success("SLA policy added");
            resetForm();
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("SLA policy removed");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<TicketSlaPolicy>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                id: "priority",
                accessorFn: (row) => row.priority || "Any",
                header: "Priority",
            },
            {
                id: "category",
                accessorFn: (row) =>
                    categories.find((c) => c.id === row.category_id)?.name || "Any",
                header: "Category",
            },
            {
                id: "first_response",
                accessorFn: (row) => row.first_response_target_minutes,
                header: "First Response",
                Cell: ({ row }) => <>{formatMinutes(row.original.first_response_target_minutes)}</>,
            },
            {
                id: "resolution",
                accessorFn: (row) => row.resolution_target_minutes,
                header: "Resolution",
                Cell: ({ row }) => <>{formatMinutes(row.original.resolution_target_minutes)}</>,
            },
        ],
        [categories]
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500 max-w-2xl">
                Define response/resolution targets. The most specific matching policy (category +
                priority, then priority-only, then category-only, then a company-wide default) applies
                to each new ticket.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Name</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        placeholder="e.g. High Priority"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Priority</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        placeholder="Any"
                        value={priority}
                        options={PRIORITY_OPTIONS}
                        onChange={(e) => setPriority(e.target.value as TicketSlaPriority)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Category</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        placeholder="Any"
                        value={categoryId}
                        options={categories.map((c) => ({ value: c.id, label: c.name }))}
                        onChange={(e) => setCategoryId(e.target.value as string)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">First Response (min)</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        type="number"
                        value={firstResponseMinutes}
                        onChange={(e) => setFirstResponseMinutes(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Resolution (min)</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        type="number"
                        value={resolutionMinutes}
                        onChange={(e) => setResolutionMinutes(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Business Hours</label>
                    <div className="flex gap-2">
                        <AppSelect
                            isBgWhite
                            fullWidth
                            placeholder="24/7"
                            value={calendarId}
                            options={calendars.map((c) => ({ value: c.id, label: c.name }))}
                            onChange={(e) => setCalendarId(e.target.value as string)}
                        />
                        <AppButton onClick={handleAdd} disabled={createMutation.isPending} startIcon={<Plus size={16} />}>
                            Add
                        </AppButton>
                    </div>
                </div>
            </div>

            <SuperTable<TicketSlaPolicy>
                tableId="ticket-sla-policies-table"
                columns={columns}
                data={policies}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load SLA policies. Please try again."
                onRetry={() => refetch()}
                renderRowActions={({ row }) => (
                    <button
                        onClick={() => setDeleteTarget({ id: row.original.id, name: row.original.name })}
                        className="text-gray-300 hover:text-red-500"
                        aria-label="Delete SLA policy"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Timer}
                        title="No SLA policies configured yet"
                        description="Add response and resolution targets to track SLA compliance on tickets."
                    />
                )}
                features={{ columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete SLA Policy"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
