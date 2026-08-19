"use client";

import { format } from 'date-fns';
import { useMemo, useState } from "react";
import { Plus, ShieldOff } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { useConfirmationPopup } from "@/components/ui/confirmation-popup";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import ComplianceTabs from "@/components/data-intelligence/compliance/ComplianceTabs";
import AddSuppressionEntryModal from "@/components/data-intelligence/compliance/AddSuppressionEntryModal";
import { useSuppressionEntries, useDeleteSuppressionEntry } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { SuppressionEntryItem } from "@/lib/types/compliance";

const TYPE_LABELS: Record<string, string> = {
    email: "Email",
    phone: "Phone",
    domain: "Domain",
    organization_id: "Organization ID",
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));

export default function SuppressionListPage() {
    const { data: response, isLoading, isError, refetch } = useSuppressionEntries();
    const entries = response?.data || [];
    const [openAdd, setOpenAdd] = useState(false);
    const deleteEntry = useDeleteSuppressionEntry();
    const { confirm, confirmationPopup } = useConfirmationPopup();

    const handleDelete = (id: string) => {
        confirm({
            variant: "danger",
            title: "Remove Suppression Entry",
            description: "Remove this entry from the suppression list?",
            confirmText: "Remove",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await deleteEntry.mutateAsync(id);
                    notify.success("Removed", { description: "Entry removed from suppression list." });
                } catch (err: any) {
                    notify.error("Error", { description: handleError(err, "Remove Suppression Entry") });
                }
            },
        });
    };

    const columns = useMemo<MRT_ColumnDef<SuppressionEntryItem>[]>(
        () => [
            {
                accessorKey: "entry_type",
                header: "Type",
                filterVariant: "select",
                filterSelectOptions: TYPE_OPTIONS,
                filterFn: "equals",
                Cell: ({ cell }) => (
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                        {TYPE_LABELS[cell.getValue<string>()] || cell.getValue<string>()}
                    </span>
                ),
            },
            {
                accessorKey: "reason",
                header: "Reason",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">{cell.getValue<string>() || "-"}</span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Added",
                enableColumnFilter: false,
                Cell: ({ cell }) => (
                    <span className="text-sm text-gray-600">
                        {format(new Date(cell.getValue<string>()), "dd MMM yyyy, HH:mm")}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Compliance · Suppression List"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Compliance" }, { label: "Suppression List" }]}
                actions={
                    <AppButton
                        onClick={() => setOpenAdd(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                    >
                        Add Entry
                    </AppButton>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[300px]">
                <ComplianceTabs />

                <section className="px-6 pt-5">
                    <p className="max-w-lg text-sm text-gray-500">
                        Values on this list are excluded from search results and blocked from being saved
                        to CRM in this workspace. Values are stored as one-way hashes, never plaintext.
                        Suppression is per-workspace - it does not apply to other tenants on this platform.
                    </p>
                </section>

                <div className="mx-6 my-6">
                    <SuperTable<SuppressionEntryItem>
                        tableId="suppression-list-table"
                        columns={columns}
                        data={entries}
                        isLoading={isLoading}
                        isError={isError}
                        errorMessage="Failed to load the suppression list. Please try again."
                        onRetry={() => refetch()}
                        renderRowActions={({ row }) => (
                            <DeleteButton onClick={() => handleDelete(row.original.id)} />
                        )}
                        renderEmptyState={() => (
                            <EmptyState
                                icon={ShieldOff}
                                title="Suppression list is empty"
                                description="Values you add here are excluded from future search results and CRM saves."
                                action={{ label: "Add Entry", onClick: () => setOpenAdd(true), icon: <Plus size={16} /> }}
                            />
                        )}
                        initialState={{ sorting: [{ id: "created_at", desc: true }] }}
                        features={{
                            globalFilter: true,
                            columnFilters: true,
                            pagination: true,
                        }}
                    />
                </div>
            </div>

            <AddSuppressionEntryModal open={openAdd} onClose={() => setOpenAdd(false)} />
            {confirmationPopup}
        </div>
    );
}
