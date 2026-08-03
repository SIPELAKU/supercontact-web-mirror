"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { notify } from "@/lib/notifications";
import {
    useTicketCategories,
    useCreateTicketCategory,
    useDeleteTicketCategory,
} from "@/lib/hooks/useTicketCategories";

export default function CategoriesSettingsTab() {
    const { data, isLoading } = useTicketCategories();
    const categories = data?.data?.data || [];
    const createMutation = useCreateTicketCategory();
    const deleteMutation = useDeleteTicketCategory();

    const [newName, setNewName] = useState("");

    const handleAdd = async () => {
        if (!newName.trim()) {
            notify.warning("Validation Error", { description: "Please enter a category name." });
            return;
        }
        try {
            await createMutation.mutateAsync({ name: newName.trim() });
            notify.success("Category added");
            setNewName("");
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            notify.success("Category removed");
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

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
                    onClick={handleAdd}
                    disabled={createMutation.isPending}
                    startIcon={<Plus size={16} />}
                >
                    Add
                </AppButton>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!">
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600, textAlign: "right" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} align="center" sx={{ py: 6 }}>
                                    <p className="text-gray-500">No categories configured yet.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((c) => (
                                <TableRow key={c.id} hover>
                                    <TableCell>{c.name}</TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => handleDelete(c.id)}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Delete category"
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
