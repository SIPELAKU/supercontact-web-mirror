"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Plus, Radar, ListChecks, ListPlus } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useConfirmation } from "@/components/ui/confirm-modal";
import { useCompanyLists, useDeleteCompanyList } from "@/lib/hooks/useCompanyLists";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import CreateListModal from "@/components/data-intelligence/lists/CreateListModal";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";

export default function CompanyListsPage() {
    const router = useRouter();
    const { data: response, isLoading, refetch } = useCompanyLists();
    const lists = response?.data || [];
    const [openCreate, setOpenCreate] = useState(false);
    const deleteListMutation = useDeleteCompanyList();
    const { showConfirmation } = useConfirmation();

    const handleDelete = (id: string, name: string) => {
        showConfirmation({
            type: "delete",
            title: "Delete List",
            message: `Are you sure you want to delete "${name}"? This cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    await deleteListMutation.mutateAsync(id);
                    notify.success("List Deleted", { description: `"${name}" has been deleted.` });
                } catch (err: any) {
                    notify.error("Error", { description: handleError(err, "Delete List") });
                }
            },
        });
    };

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title="Lists"
                breadcrumbs={[{ label: "Data Intelligence" }, { label: "Lists" }]}
                actions={
                    <AppButton
                        onClick={() => setOpenCreate(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                    >
                        Create List
                    </AppButton>
                }
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6 min-h-[300px]">
                <section className="px-6 pt-5">
                    <p className="max-w-lg text-sm text-gray-500">
                        Save companies into static lists you curate manually, or dynamic lists that
                        auto-refresh from a saved search filter.
                    </p>
                </section>

                {!isLoading && lists.length === 0 ? (
                    <div className="mx-6 mb-6">
                        <EmptyState
                            icon={ListPlus}
                            title="No lists yet"
                            description="Create a list to start organizing companies you care about."
                            action={{ label: "Create List", onClick: () => setOpenCreate(true), icon: <Plus size={16} /> }}
                        />
                    </div>
                ) : (
                    <div className="mx-6 mb-6 overflow-x-auto rounded-lg border border-gray-200">
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Name</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, textAlign: "center" }}>Type</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, textAlign: "center" }}>Members</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, pr: 3, textAlign: "center" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lists.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        hover
                                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f9fafb" } }}
                                        onClick={() => router.push(`/data-intelligence/lists/${item.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-medium text-gray-900">{item.name}</span>
                                                {item.description && (
                                                    <span className="text-xs text-gray-500">{item.description}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                {item.list_type === "dynamic" ? (
                                                    <Radar size={12} />
                                                ) : (
                                                    <ListChecks size={12} />
                                                )}
                                                {item.list_type === "dynamic" ? "Dynamic" : "Static"}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">{item.member_count}</TableCell>
                                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                            <DeleteButton onClick={() => handleDelete(item.id, item.name)} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                )}
            </div>

            <CreateListModal open={openCreate} onClose={() => setOpenCreate(false)} onSuccess={() => refetch()} />
        </div>
    );
}
