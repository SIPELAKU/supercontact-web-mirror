"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { TicketCategory } from "@/lib/types/TicketSettings";
import {
    useTicketCategories,
    useCreateTicketCategory,
    useUpdateTicketCategory,
    useDeleteTicketCategory,
} from "@/lib/hooks/useTicketCategories";

export default function CategoriesSettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketCategories();
    const categories = data?.data?.data || [];
    const createMutation = useCreateTicketCategory();
    const updateMutation = useUpdateTicketCategory();
    const deleteMutation = useDeleteTicketCategory();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setNewName("");
    };

    const handleEdit = (category: TicketCategory) => {
        setEditingId(category.id);
        setNewName(category.name);
    };

    const handleSave = async () => {
        if (!newName.trim()) {
            notify.warning("Validation Error", { description: "Please enter a category name." });
            return;
        }
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: { name: newName.trim() } });
                notify.success("Category updated");
            } else {
                await createMutation.mutateAsync({ name: newName.trim() });
                notify.success("Category added");
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
            notify.success("Category removed");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<TicketCategory>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
        ],
        []
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500">
                Define the ticket categories your team uses - shown as a dropdown on every ticket.
            </p>

            <div className="flex gap-3 max-w-md">
                <AppInput
                    isBgWhite
                    fullWidth
                    placeholder="e.g. Billing"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <AppButton
                    onClick={handleSave}
                    disabled={createMutation.isPending || updateMutation.isPending}
                    startIcon={editingId ? undefined : <Plus size={16} />}
                >
                    {editingId ? "Save" : "Add"}
                </AppButton>
                {editingId && (
                    <AppButton variantStyle="outline" onClick={resetForm}>
                        Cancel
                    </AppButton>
                )}
            </div>

            <SuperTable<TicketCategory>
                entityLabel="kategori"
                searchPlaceholder="Cari nama kategori"
                tableId="ticket-categories-table"
                urlKey="cats"
                columns={columns}
                data={categories}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load ticket categories. Please try again."
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
                        icon={Tags}
                        title="No categories configured yet"
                        description="Categories you add appear as a dropdown on every ticket."
                    />
                )}
                features={{          urlSync: true,
 columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
