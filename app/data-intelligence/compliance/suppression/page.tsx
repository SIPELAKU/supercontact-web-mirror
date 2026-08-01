"use client";

import { useState } from "react";
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Plus } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import ComplianceTabs from "@/components/data-intelligence/compliance/ComplianceTabs";
import AddSuppressionEntryModal from "@/components/data-intelligence/compliance/AddSuppressionEntryModal";
import { useSuppressionEntries, useDeleteSuppressionEntry } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

const TYPE_LABELS: Record<string, string> = {
    email: "Email",
    phone: "Phone",
    domain: "Domain",
    organization_id: "Organization ID",
};

export default function SuppressionListPage() {
    const { data: response, isLoading } = useSuppressionEntries();
    const entries = response?.data || [];
    const [openAdd, setOpenAdd] = useState(false);
    const deleteEntry = useDeleteSuppressionEntry();

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this entry from the suppression list?")) return;
        try {
            await deleteEntry.mutateAsync(id);
            notify.success("Removed", { description: "Entry removed from suppression list." });
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Remove Suppression Entry") });
        }
    };

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Compliance"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Compliance" }]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[300px]">
                <ComplianceTabs />

                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
                    <p className="max-w-lg text-sm text-gray-500">
                        Values on this list are excluded from search results and blocked from being saved
                        to CRM in this workspace. Values are stored as one-way hashes, never plaintext.
                        Suppression is per-workspace - it does not apply to other tenants on this platform.
                    </p>
                    <AppButton
                        onClick={() => setOpenAdd(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                    >
                        Add Entry
                    </AppButton>
                </section>

                <div className="mx-6 my-6 overflow-x-auto rounded-lg border border-gray-200">
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Type</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Reason</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Added</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, textAlign: "center" }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <p className="text-gray-500">Suppression list is empty.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.map((entry) => (
                                    <TableRow key={entry.id} hover>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                {TYPE_LABELS[entry.entry_type] || entry.entry_type}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {entry.reason || "-"}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {new Date(entry.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="center">
                                            <DeleteButton onClick={() => handleDelete(entry.id)} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddSuppressionEntryModal open={openAdd} onClose={() => setOpenAdd(false)} />
        </div>
    );
}
