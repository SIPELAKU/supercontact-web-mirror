"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import {
    useTicketCustomFields,
    useCreateTicketCustomField,
    useDeleteTicketCustomField,
} from "@/lib/hooks/useTicketCustomFields";
import { TicketCustomFieldType } from "@/lib/types/TicketSettings";

const FIELD_TYPE_OPTIONS: { value: TicketCustomFieldType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes/No" },
    { value: "select", label: "Dropdown" },
];

export default function CustomFieldsSettingsTab() {
    const { data, isLoading } = useTicketCustomFields();
    const definitions = data?.data?.data || [];
    const createMutation = useCreateTicketCustomField();
    const deleteMutation = useDeleteTicketCustomField();

    const [fieldKey, setFieldKey] = useState("");
    const [label, setLabel] = useState("");
    const [fieldType, setFieldType] = useState<TicketCustomFieldType>("text");
    const [selectOptions, setSelectOptions] = useState("");
    const [isRequired, setIsRequired] = useState(false);

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

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            notify.success("Custom field removed");
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

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

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!">
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Label</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Key</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Type</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Required</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600, textAlign: "right" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : definitions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <p className="text-gray-500">No custom fields configured yet.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            definitions.map((def) => (
                                <TableRow key={def.id} hover>
                                    <TableCell>{def.label}</TableCell>
                                    <TableCell className="font-mono text-xs">{def.field_key}</TableCell>
                                    <TableCell className="capitalize">{def.field_type}</TableCell>
                                    <TableCell>{def.is_required ? "Yes" : "No"}</TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => handleDelete(def.id)}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Delete custom field"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
