"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    useTicketCustomFields,
    useCreateTicketCustomField,
    useDeleteTicketCustomField,
} from "@/lib/hooks/useTicketCustomFields";
import { TicketCustomFieldDefinition, TicketCustomFieldType } from "@/lib/types/TicketSettings";

const FIELD_TYPE_OPTIONS: { value: TicketCustomFieldType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes/No" },
    { value: "select", label: "Dropdown" },
];

export default function CustomFieldsSettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketCustomFields();
    const definitions = data?.data?.data || [];
    const createMutation = useCreateTicketCustomField();
    const deleteMutation = useDeleteTicketCustomField();

    const [fieldKey, setFieldKey] = useState("");
    const [label, setLabel] = useState("");
    const [fieldType, setFieldType] = useState<TicketCustomFieldType>("text");
    const [selectOptions, setSelectOptions] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

    const handleAdd = async () => {
        if (!fieldKey.trim() || !label.trim()) {
            notify.warning("Validation Error", { description: "Please fill in field key and label." });
            return;
        }
        if (fieldType === "select" && !selectOptions.trim()) {
            notify.warning("Validation Error", { description: "Dropdown fields need at least one option." });
            return;
        }
        try {
            await createMutation.mutateAsync({
                field_key: fieldKey.trim(),
                label: label.trim(),
                field_type: fieldType,
                select_options:
                    fieldType === "select"
                        ? selectOptions.split(",").map((o) => o.trim()).filter(Boolean)
                        : undefined,
                is_required: isRequired,
            });
            notify.success("Custom field added");
            setFieldKey("");
            setLabel("");
            setFieldType("text");
            setSelectOptions("");
            setIsRequired(false);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Custom field removed");
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<TicketCustomFieldDefinition>[]>(
        () => [
            {
                accessorKey: "label",
                header: "Label",
            },
            {
                accessorKey: "field_key",
                header: "Key",
                Cell: ({ cell }) => (
                    <span className="font-mono text-xs">{cell.getValue<string>()}</span>
                ),
            },
            {
                accessorKey: "field_type",
                header: "Type",
                Cell: ({ cell }) => (
                    <span className="capitalize">{cell.getValue<string>()}</span>
                ),
            },
            {
                id: "is_required",
                accessorFn: (row) => (row.is_required ? "Yes" : "No"),
                header: "Required",
            },
        ],
        []
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500">
                Define admin-configurable fields that appear on every ticket. Values are validated
                against these definitions when a ticket is created or updated.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Field key</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        placeholder="order_id"
                        value={fieldKey}
                        onChange={(e) => setFieldKey(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Label</label>
                    <AppInput
                        isBgWhite
                        fullWidth
                        placeholder="Order ID"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Type</label>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        value={fieldType}
                        options={FIELD_TYPE_OPTIONS}
                        onChange={(e) => setFieldType(e.target.value as TicketCustomFieldType)}
                    />
                </div>
                {fieldType === "select" && (
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Options (comma-separated)</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            placeholder="Small, Medium, Large"
                            value={selectOptions}
                            onChange={(e) => setSelectOptions(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            className="h-4 w-4"
                        />
                        Required
                    </label>
                    <AppButton onClick={handleAdd} disabled={createMutation.isPending} startIcon={<Plus size={16} />}>
                        Add
                    </AppButton>
                </div>
            </div>

            <SuperTable<TicketCustomFieldDefinition>
                tableId="ticket-custom-fields-table"
                columns={columns}
                data={definitions}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load custom fields. Please try again."
                onRetry={() => refetch()}
                renderRowActions={({ row }) => (
                    <button
                        onClick={() => setDeleteTarget({ id: row.original.id, label: row.original.label })}
                        className="text-gray-300 hover:text-red-500"
                        aria-label="Delete custom field"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                renderEmptyState={() => (
                    <EmptyState
                        icon={ListChecks}
                        title="No custom fields configured yet"
                        description="Fields you define here appear on every ticket and are validated on save."
                    />
                )}
                features={{ columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Custom Field"
                description={`Are you sure you want to delete "${deleteTarget?.label ?? ""}"? Existing values for this field will no longer be validated.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
