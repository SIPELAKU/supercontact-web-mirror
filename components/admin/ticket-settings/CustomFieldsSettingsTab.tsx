"use client";

import { useMemo, useState } from "react";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
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
    useUpdateTicketCustomField,
    useDeleteTicketCustomField,
} from "@/lib/hooks/useTicketCustomFields";
import {
    TicketCustomFieldDefinition,
    TicketCustomFieldType,
    TicketVisibilityClause,
    TicketVisibilityCondition,
    TicketVisibilityOp,
} from "@/lib/types/TicketSettings";

const FIELD_TYPE_OPTIONS: { value: TicketCustomFieldType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes/No" },
    { value: "select", label: "Dropdown" },
];

// Built-in ticket fields that a visibility clause can reference, with their known
// value sets (kept in sync with the FE source-of-truth unions in lib/types/Ticket.ts
// and the pickers in TicketForm.tsx).
const BUILTIN_CONDITION_FIELDS: { value: string; label: string; options: string[] }[] = [
    { value: "type", label: "Type", options: ["Question", "Incident", "Problem", "Task"] },
    { value: "priority", label: "Priority", options: ["Urgent", "High", "Medium", "Low"] },
    {
        value: "status",
        label: "Status",
        options: ["Open", "Pending", "On-hold", "In Progress", "Solved", "Closed"],
    },
];

const CONDITION_OP_OPTIONS: { value: TicketVisibilityOp; label: string }[] = [
    { value: "eq", label: "is" },
    { value: "neq", label: "is not" },
    { value: "in", label: "is any of" },
];

// Serialize the builder's clause rows into the exact backend visibility_condition
// shape, or null when there are no complete clauses. `in` values become string[]
// (blanks dropped); eq/neq values become a single trimmed string.
function serializeConditions(
    clauses: TicketVisibilityClause[]
): TicketVisibilityCondition | null {
    const valid = clauses
        .map((c) => {
            if (c.op === "in") {
                const arr = (Array.isArray(c.value) ? c.value : [c.value])
                    .map((v) => String(v).trim())
                    .filter(Boolean);
                return { field: c.field, op: c.op, value: arr };
            }
            const single = Array.isArray(c.value) ? c.value[0] ?? "" : c.value;
            return { field: c.field, op: c.op, value: String(single).trim() };
        })
        .filter((c) =>
            Boolean(c.field) &&
            (c.op === "in" ? (c.value as string[]).length > 0 : c.value !== "")
        );
    return valid.length > 0 ? { all: valid } : null;
}

export default function CustomFieldsSettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketCustomFields();
    const definitions = data?.data?.data || [];
    const createMutation = useCreateTicketCustomField();
    const updateMutation = useUpdateTicketCustomField();
    const deleteMutation = useDeleteTicketCustomField();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [fieldKey, setFieldKey] = useState("");
    const [label, setLabel] = useState("");
    const [fieldType, setFieldType] = useState<TicketCustomFieldType>("text");
    const [selectOptions, setSelectOptions] = useState("");
    const [isRequired, setIsRequired] = useState(false);
    const [conditions, setConditions] = useState<TicketVisibilityClause[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setFieldKey("");
        setLabel("");
        setFieldType("text");
        setSelectOptions("");
        setIsRequired(false);
        setConditions([]);
    };

    const handleEdit = (definition: TicketCustomFieldDefinition) => {
        setEditingId(definition.id);
        setFieldKey(definition.field_key);
        setLabel(definition.label);
        setFieldType(definition.field_type);
        setSelectOptions((definition.select_options || []).join(", "));
        setIsRequired(definition.is_required);
        setConditions(
            (definition.visibility_condition?.all || []).map((c) => ({
                field: c.field,
                op: c.op,
                value: Array.isArray(c.value) ? [...c.value] : c.value,
            }))
        );
    };

    // Fields a clause can reference: the built-ins plus every OTHER custom field
    // (a field can't be conditioned on itself). Each carries its known value set so
    // the value control can offer a picker instead of free text where possible.
    const conditionFieldOptions = useMemo(() => {
        const custom = definitions
            .filter((d) => d.id !== editingId)
            .map((d) => ({
                value: d.field_key,
                label: `${d.label} (custom)`,
                options: d.field_type === "select" ? d.select_options || [] : [],
            }));
        return [...BUILTIN_CONDITION_FIELDS, ...custom];
    }, [definitions, editingId]);

    const knownOptionsFor = (fieldName: string): string[] =>
        conditionFieldOptions.find((o) => o.value === fieldName)?.options || [];

    const updateClause = (index: number, patch: Partial<TicketVisibilityClause>) =>
        setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));

    const addClause = () =>
        setConditions((prev) => [...prev, { field: "type", op: "eq", value: "" }]);

    const removeClause = (index: number) =>
        setConditions((prev) => prev.filter((_, i) => i !== index));

    // Changing the field resets the value (its valid options differ).
    const handleClauseFieldChange = (index: number, newField: string) =>
        updateClause(index, { field: newField, value: conditions[index].op === "in" ? [] : "" });

    // Switching to/from "is any of" coerces the value between string and string[].
    const handleClauseOpChange = (index: number, newOp: TicketVisibilityOp) => {
        const current = conditions[index];
        let value: string | string[];
        if (newOp === "in") {
            value = Array.isArray(current.value)
                ? current.value
                : current.value
                ? [current.value]
                : [];
        } else {
            value = Array.isArray(current.value) ? current.value[0] ?? "" : current.value;
        }
        updateClause(index, { op: newOp, value });
    };

    const handleSave = async () => {
        if (!fieldKey.trim() || !label.trim()) {
            notify.warning("Validation Error", { description: "Please fill in field key and label." });
            return;
        }
        if (fieldType === "select" && !selectOptions.trim()) {
            notify.warning("Validation Error", { description: "Dropdown fields need at least one option." });
            return;
        }
        const parsedOptions =
            fieldType === "select"
                ? selectOptions.split(",").map((o) => o.trim()).filter(Boolean)
                : undefined;
        const visibilityCondition = serializeConditions(conditions);
        try {
            if (editingId) {
                // field_key and field_type are create-only in the backend PATCH schema.
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: {
                        label: label.trim(),
                        select_options: parsedOptions,
                        is_required: isRequired,
                        visibility_condition: visibilityCondition,
                    },
                });
                notify.success("Custom field updated");
            } else {
                await createMutation.mutateAsync({
                    field_key: fieldKey.trim(),
                    label: label.trim(),
                    field_type: fieldType,
                    select_options: parsedOptions,
                    is_required: isRequired,
                    visibility_condition: visibilityCondition,
                });
                notify.success("Custom field added");
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
                        disabled={!!editingId}
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
                        disabled={!!editingId}
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
                <div className="flex items-center h-10">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            className="h-4 w-4"
                        />
                        Required
                    </label>
                </div>
            </div>

            {/* Inc 4: optional visibility condition builder — AND over clauses. */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Show this field only when…</p>
                        <p className="text-xs text-gray-500">
                            {conditions.length === 0
                                ? "Always visible. Add a condition to show it only for matching tickets."
                                : "All conditions below must match for this field to appear on the ticket."}
                        </p>
                    </div>
                    <AppButton variantStyle="outline" onClick={addClause} startIcon={<Plus size={14} />}>
                        Add condition
                    </AppButton>
                </div>

                {conditions.map((clause, index) => {
                    const options = knownOptionsFor(clause.field);
                    const singleValue = Array.isArray(clause.value) ? clause.value[0] ?? "" : clause.value;
                    return (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                            <div className="w-40">
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={clause.field}
                                    options={conditionFieldOptions.map((o) => ({ value: o.value, label: o.label }))}
                                    onChange={(e) => handleClauseFieldChange(index, e.target.value as string)}
                                />
                            </div>
                            <div className="w-28">
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    value={clause.op}
                                    options={CONDITION_OP_OPTIONS}
                                    onChange={(e) => handleClauseOpChange(index, e.target.value as TicketVisibilityOp)}
                                />
                            </div>
                            <div className="flex-1 min-w-[10rem]">
                                {clause.op === "in" ? (
                                    options.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {options.map((opt) => {
                                                const selected = Array.isArray(clause.value) ? clause.value : [];
                                                const checked = selected.includes(opt);
                                                return (
                                                    <label
                                                        key={opt}
                                                        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="h-3.5 w-3.5"
                                                            checked={checked}
                                                            onChange={(e) =>
                                                                updateClause(index, {
                                                                    value: e.target.checked
                                                                        ? [...selected, opt]
                                                                        : selected.filter((v) => v !== opt),
                                                                })
                                                            }
                                                        />
                                                        {opt}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            placeholder="value1, value2"
                                            value={Array.isArray(clause.value) ? clause.value.join(", ") : clause.value}
                                            onChange={(e) =>
                                                updateClause(index, {
                                                    value: e.target.value.split(",").map((s) => s.trim()),
                                                })
                                            }
                                        />
                                    )
                                ) : options.length > 0 ? (
                                    <AppSelect
                                        isBgWhite
                                        fullWidth
                                        placeholder="Select value"
                                        value={singleValue}
                                        options={options.map((o) => ({ value: o, label: o }))}
                                        onChange={(e) => updateClause(index, { value: e.target.value as string })}
                                    />
                                ) : (
                                    <AppInput
                                        isBgWhite
                                        fullWidth
                                        placeholder="Enter value"
                                        value={singleValue}
                                        onChange={(e) => updateClause(index, { value: e.target.value })}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeClause(index)}
                                className="text-gray-300 hover:text-red-500"
                                aria-label="Remove condition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-end gap-3">
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
                    {editingId ? "Save" : "Add"}
                </AppButton>
            </div>

            <SuperTable<TicketCustomFieldDefinition>
                tableId="ticket-custom-fields-table"
                urlKey="fields"
                columns={columns}
                data={definitions}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load custom fields. Please try again."
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
                        onClick: (row) => setDeleteTarget({ id: row.id, label: row.label }),
                    },
                ]}
                renderEmptyState={() => (
                    <EmptyState
                        icon={ListChecks}
                        title="No custom fields configured yet"
                        description="Fields you define here appear on every ticket and are validated on save."
                    />
                )}
                features={{          urlSync: true,
 columnFilters: false }}
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
