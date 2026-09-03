"use client";

import { useMemo, useState } from "react";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { TicketMacro } from "@/lib/types/TicketSettings";
import {
    useTicketMacros,
    useCreateTicketMacro,
    useUpdateTicketMacro,
    useDeleteTicketMacro,
} from "@/lib/hooks/useTicketMacros";

const STATUS_OPTIONS = [
    { value: "", label: "No change" },
    { value: "Open", label: "Open" },
    { value: "Pending", label: "Pending" },
    { value: "On-hold", label: "On-hold" },
    { value: "In Progress", label: "In Progress" },
    { value: "Solved", label: "Solved" },
    { value: "Closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
    { value: "", label: "No change" },
    { value: "Urgent", label: "Urgent" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

export default function MacrosSettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketMacros();
    const macros = data?.data?.data || [];
    const createMutation = useCreateTicketMacro();
    const updateMutation = useUpdateTicketMacro();
    const deleteMutation = useDeleteTicketMacro();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [bodyTemplate, setBodyTemplate] = useState("");
    const [statusChange, setStatusChange] = useState("");
    const [priorityChange, setPriorityChange] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setBodyTemplate("");
        setStatusChange("");
        setPriorityChange("");
    };

    const handleEdit = (macro: TicketMacro) => {
        setEditingId(macro.id);
        setName(macro.name);
        setBodyTemplate(macro.body_template);
        setStatusChange(macro.field_changes?.status || "");
        setPriorityChange(macro.field_changes?.priority || "");
    };

    const handleSave = async () => {
        if (!name.trim() || !bodyTemplate.trim()) {
            notify.warning("Validation Error", { description: "Please fill in name and reply body." });
            return;
        }
        const field_changes: Record<string, any> = {};
        if (statusChange) field_changes.status = statusChange;
        if (priorityChange) field_changes.priority = priorityChange;

        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: {
                        name: name.trim(),
                        body_template: bodyTemplate.trim(),
                        field_changes,
                    },
                });
                notify.success("Macro updated");
            } else {
                await createMutation.mutateAsync({
                    name: name.trim(),
                    body_template: bodyTemplate.trim(),
                    field_changes,
                });
                notify.success("Macro added");
            }
            resetForm();
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Macro removed");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<TicketMacro>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                accessorKey: "body_template",
                header: "Reply Body",
                Cell: ({ cell }) => (
                    <div className="max-w-md truncate" title={cell.getValue<string>()}>
                        {cell.getValue<string>()}
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500 max-w-2xl">
                Saved replies agents can apply from a ticket in one click. Use{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{ticket_code}}"}</code>,{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{customer_name}}"}</code>, and{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{agent_name}}"}</code> as placeholders in
                the reply body. Optionally bundle a status/priority change to apply at the same time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Name</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        placeholder="e.g. Closing - Resolved"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Reply body</label>
                    <textarea
                        value={bodyTemplate}
                        onChange={(e) => setBodyTemplate(e.target.value)}
                        placeholder="Hi {{customer_name}}, your ticket {{ticket_code}} has been resolved..."
                        className="w-full min-h-[80px] bg-[#FAFAF6] p-2 rounded-lg border border-gray-200 focus:border-primary resize-none text-sm focus:outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Set status</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={statusChange}
                        options={STATUS_OPTIONS}
                        onChange={(e) => setStatusChange(e.target.value as string)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Set priority</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={priorityChange}
                        options={PRIORITY_OPTIONS}
                        onChange={(e) => setPriorityChange(e.target.value as string)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                {editingId && (
                    <AppButton variantStyle="outline" onClick={resetForm}>
                        Cancel
                    </AppButton>
                )}
                <AppButton
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    startIcon={editingId ? undefined : <Plus size={16} />}
                >
                    {editingId ? "Save Changes" : "Add Macro"}
                </AppButton>
            </div>

            <SuperTable<TicketMacro>
                entityLabel="makro"
                searchPlaceholder="Cari nama makro"
                tableId="ticket-macros-table"
                urlKey="macros"
                columns={columns}
                data={macros}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load macros. Please try again."
                onRetry={() => refetch()}
                rowActions={[
                    {
                        id: "edit",
                        label: "Edit",
                        icon: <Pencil size={16} />,
                        onClick: (row) => handleEdit(row),
                    },
                    {
                        id: "delete",
                        label: "Delete",
                        icon: <Trash2 size={16} />,
                        destructive: true,
                        onClick: (row) => setDeleteTarget({ id: row.id, name: row.name }),
                    },
                ]}
                renderEmptyState={() => (
                    <EmptyState
                        icon={MessageSquare}
                        title="No macros configured yet"
                        description="Saved replies you add can be applied from any ticket in one click."
                    />
                )}
                features={{          urlSync: true,
 columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Macro"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
