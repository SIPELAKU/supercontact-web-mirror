"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    useTicketMacros,
    useCreateTicketMacro,
    useDeleteTicketMacro,
} from "@/lib/hooks/useTicketMacros";

const STATUS_OPTIONS = [
    { value: "", label: "No change" },
    { value: "Open", label: "Open" },
    { value: "In Progress", label: "In Progress" },
    { value: "Closed", label: "Closed" },
];

const PRIORITY_OPTIONS = [
    { value: "", label: "No change" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

export default function MacrosSettingsTab() {
    const { data, isLoading } = useTicketMacros();
    const macros = data?.data?.data || [];
    const createMutation = useCreateTicketMacro();
    const deleteMutation = useDeleteTicketMacro();

    const [name, setName] = useState("");
    const [bodyTemplate, setBodyTemplate] = useState("");
    const [statusChange, setStatusChange] = useState("");
    const [priorityChange, setPriorityChange] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const handleAdd = async () => {
        if (!name.trim() || !bodyTemplate.trim()) {
            notify.warning("Validation Error", { description: "Please fill in name and reply body." });
            return;
        }
        const field_changes: Record<string, any> = {};
        if (statusChange) field_changes.status = statusChange;
        if (priorityChange) field_changes.priority = priorityChange;

        try {
            await createMutation.mutateAsync({
                name: name.trim(),
                body_template: bodyTemplate.trim(),
                field_changes,
            });
            notify.success("Macro added");
            setName("");
            setBodyTemplate("");
            setStatusChange("");
            setPriorityChange("");
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

            <div className="flex justify-end">
                <AppButton onClick={handleAdd} disabled={createMutation.isPending} startIcon={<Plus size={16} />}>
                    Add Macro
                </AppButton>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!">
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Reply Body</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600, textAlign: "right" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : macros.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                    <p className="text-gray-500">No macros configured yet.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            macros.map((macro) => (
                                <TableRow key={macro.id} hover>
                                    <TableCell>{macro.name}</TableCell>
                                    <TableCell className="max-w-md truncate">{macro.body_template}</TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => setDeleteTarget({ id: macro.id, name: macro.name })}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Delete macro"
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
