"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, LayoutList, Pencil, Plus, Trash2 } from "lucide-react";
import { Switch } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import {
    useCreateTicketForm,
    useDeleteTicketForm,
    useTicketForms,
    useUpdateTicketForm,
} from "@/lib/hooks/useTicketForms";
import { useTicketCustomFields } from "@/lib/hooks/useTicketCustomFields";
import type {
    TicketFormDefinition,
    TicketFormFieldLayoutItem,
} from "@/lib/api/ticket-forms";

// Built-in ticket fields a form's layout can reference (kept in sync with the
// pickers in TicketForm.tsx / lib/types/Ticket.ts).
const BUILTIN_FORM_FIELDS: { value: string; label: string }[] = [
    { value: "subject", label: "Subject" },
    { value: "description", label: "Description" },
    { value: "type", label: "Type" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
];

export default function TicketFormsSettingsTab() {
    const { data: forms = [], isLoading } = useTicketForms();
    const { data: customFieldData } = useTicketCustomFields();
    const customFieldDefs = customFieldData?.data?.data || [];

    const createMutation = useCreateTicketForm();
    const updateMutation = useUpdateTicketForm();
    const deleteMutation = useDeleteTicketForm();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [displayOrder, setDisplayOrder] = useState("0");
    const [layout, setLayout] = useState<TicketFormFieldLayoutItem[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // All fields the layout can reference: built-ins + every tenant custom field.
    const fieldOptions = useMemo(() => {
        const custom = customFieldDefs.map((d: any) => ({
            value: d.field_key as string,
            label: `${d.label} (custom)`,
        }));
        return [...BUILTIN_FORM_FIELDS, ...custom];
    }, [customFieldDefs]);

    const labelForField = (field: string) =>
        fieldOptions.find((o) => o.value === field)?.label || field;

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setIsActive(true);
        setDisplayOrder("0");
        setLayout([]);
    };

    const handleEdit = (form: TicketFormDefinition) => {
        setEditingId(form.id);
        setName(form.name);
        setIsActive(form.is_active);
        setDisplayOrder(String(form.display_order ?? 0));
        setLayout((form.field_layout || []).map((f) => ({ field: f.field, required: !!f.required })));
    };

    // --- Field-layout editor ---
    const addRow = () =>
        setLayout((prev) => [
            ...prev,
            { field: fieldOptions[0]?.value || "subject", required: false },
        ]);

    const updateRow = (index: number, patch: Partial<TicketFormFieldLayoutItem>) =>
        setLayout((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));

    const removeRow = (index: number) =>
        setLayout((prev) => prev.filter((_, i) => i !== index));

    const moveRow = (index: number, dir: -1 | 1) =>
        setLayout((prev) => {
            const next = [...prev];
            const target = index + dir;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

    const handleSave = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a form name." });
            return;
        }
        if (layout.length === 0) {
            notify.warning("Validation Error", { description: "Add at least one field to the form." });
            return;
        }
        const parsedOrder = Number.parseInt(displayOrder, 10);
        const payload = {
            name: name.trim(),
            is_active: isActive,
            display_order: Number.isNaN(parsedOrder) ? 0 : parsedOrder,
            field_layout: layout.map((f) => ({ field: f.field, required: !!f.required })),
        };
        try {
            if (editingId) {
                await updateMutation.mutateAsync({ id: editingId, data: payload });
                notify.success("Ticket form updated");
            } else {
                await createMutation.mutateAsync(payload);
                notify.success("Ticket form created");
            }
            resetForm();
        } catch (error: any) {
            // Surfaces the friendly 409 dup-name message from the API layer.
            notify.error("Error", { description: error?.message || "Failed to save ticket form" });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Ticket form deleted");
            if (editingId === deleteTarget.id) resetForm();
            setDeleteTarget(null);
        } catch (error: any) {
            notify.error("Error", { description: error?.message || "Failed to delete ticket form" });
        }
    };

    return (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
                Ticket forms let you define named intake layouts - an ordered set of built-in and
                custom fields (each optionally required). Active forms can be selected when creating
                a ticket.
            </p>

            {/* Editor */}
            <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Form name</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            placeholder="e.g. Billing Issue"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Display order</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            type="number"
                            placeholder="0"
                            value={displayOrder}
                            onChange={(e) => setDisplayOrder(e.target.value)}
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex h-10 items-center gap-2 text-sm text-gray-700">
                            <Switch
                                size="small"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                inputProps={{ "aria-label": "Form active" }}
                            />
                            Active
                        </label>
                    </div>
                </div>

                {/* Field-layout editor */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-700">Fields</p>
                        <AppButton variantStyle="outline" onClick={addRow} startIcon={<Plus size={14} />}>
                            Add field
                        </AppButton>
                    </div>

                    {layout.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
                            No fields yet. Add fields to build the form layout.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {layout.map((row, index) => (
                                <div
                                    key={index}
                                    className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
                                >
                                    <span className="w-5 text-center text-xs font-medium text-gray-400">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-[12rem] flex-1">
                                        <AppSelect
                                            isBgWhite
                                            fullWidth
                                            value={row.field}
                                            options={fieldOptions}
                                            onChange={(e) =>
                                                updateRow(index, { field: e.target.value as string })
                                            }
                                        />
                                    </div>
                                    <label className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={!!row.required}
                                            onChange={(e) =>
                                                updateRow(index, { required: e.target.checked })
                                            }
                                        />
                                        Required
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveRow(index, -1)}
                                            disabled={index === 0}
                                            className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                                            aria-label="Move up"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveRow(index, 1)}
                                            disabled={index === layout.length - 1}
                                            className="text-gray-300 hover:text-gray-700 disabled:opacity-30"
                                            aria-label="Move down"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeRow(index)}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Remove field"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                        {editingId ? "Save form" : "Add form"}
                    </AppButton>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <p className="text-sm text-gray-400">Loading ticket forms...</p>
            ) : forms.length === 0 ? (
                <EmptyState
                    icon={LayoutList}
                    title="No ticket forms yet"
                    description="Create a form above to offer a named intake layout when agents create tickets."
                />
            ) : (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                    {forms
                        .slice()
                        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                        .map((form) => (
                            <li
                                key={form.id}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate text-sm font-medium text-gray-900">
                                            {form.name}
                                        </span>
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                                form.is_active
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-gray-100 text-gray-500"
                                            }`}
                                        >
                                            {form.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 truncate text-xs text-gray-400">
                                        Order {form.display_order ?? 0} ·{" "}
                                        {(form.field_layout || []).length} field
                                        {(form.field_layout || []).length === 1 ? "" : "s"}
                                        {form.field_layout?.length
                                            ? ` · ${form.field_layout
                                                  .map((f) => labelForField(f.field))
                                                  .join(", ")}`
                                            : ""}
                                    </p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button
                                        onClick={() => handleEdit(form)}
                                        className="text-gray-300 hover:text-gray-700"
                                        aria-label="Edit form"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            setDeleteTarget({ id: form.id, name: form.name })
                                        }
                                        className="text-gray-300 hover:text-red-500"
                                        aria-label="Delete form"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </li>
                        ))}
                </ul>
            )}

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Ticket Form"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? Tickets already created with it are not affected.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
