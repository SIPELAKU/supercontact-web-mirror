"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Plus, Radar, ListChecks } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { DeleteButton } from "@/components/ui/app-action-buttons-table";
import {
    useCompanyList,
    useCompanyListMembers,
    useRemoveCompanyListMember,
} from "@/lib/hooks/useCompanyLists";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import AddToListModal from "@/components/data-intelligence/lists/AddToListModal";

export default function CompanyListDetailPage() {
    const params = useParams();
    const router = useRouter();
    const listId = params.id as string;

    const { data: list, isLoading: isListLoading } = useCompanyList(listId);
    const { data: membersResponse, isLoading: isMembersLoading, refetch } = useCompanyListMembers(listId);
    const members = membersResponse?.data || [];
    const removeMemberMutation = useRemoveCompanyListMember();
    const [openAdd, setOpenAdd] = useState(false);

    const handleRemove = async (crmCompanyId: string, name: string) => {
        if (!confirm(`Remove "${name}" from this list?`)) return;
        try {
            await removeMemberMutation.mutateAsync({ id: listId, crmCompanyId });
            notify.success("Removed", { description: `"${name}" removed from the list.` });
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Remove Member") });
        }
    };

    if (isListLoading || !list) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <PageHeader
                title={list.name}
                breadcrumbs={[
                    { label: "Data Intelligence" },
                    { label: "Lists", href: "/data-intelligence/lists" },
                    { label: list.name },
                ]}
            />

            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {list.list_type === "dynamic" ? <Radar size={12} /> : <ListChecks size={12} />}
                    {list.list_type === "dynamic" ? "Dynamic" : "Static"}
                </span>
                {list.description && <span className="text-sm text-gray-500">{list.description}</span>}
            </div>

            {list.list_type === "dynamic" && (
                <p className="rounded-lg bg-[#5479EE10] px-4 py-3 text-sm text-[#5479EE]">
                    This list auto-refreshes from a saved filter - matching companies are added
                    automatically each time you view this page.
                </p>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-6 min-h-[300px]">
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
                    <p className="text-sm text-gray-500">{members.length} compan{members.length === 1 ? "y" : "ies"}</p>
                    {list.list_type === "static" && (
                        <AppButton
                            onClick={() => setOpenAdd(true)}
                            variantStyle="primary"
                            startIcon={<Plus size={16} />}
                        >
                            Add Companies
                        </AppButton>
                    )}
                </section>

                <div className="mx-6 mb-6 overflow-x-auto rounded-lg border border-gray-200">
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Name</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Industry</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Location</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, pr: 3, textAlign: "center" }}>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isMembersLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : members.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                        <p className="text-gray-500">
                                            {list.list_type === "dynamic"
                                                ? "No companies match this list's filter yet."
                                                : "No companies in this list yet."}
                                        </p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                members.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        hover
                                        sx={{ cursor: "pointer", "&:hover": { bgcolor: "#f9fafb" } }}
                                        onClick={() => router.push(`/data-intelligence/company/${member.id}?source=saved`)}
                                    >
                                        <TableCell className="font-medium text-gray-900">{member.name}</TableCell>
                                        <TableCell>{member.industry || "-"}</TableCell>
                                        <TableCell>{member.location || "-"}</TableCell>
                                        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                                            <DeleteButton onClick={() => handleRemove(member.id, member.name)} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AddToListModal
                open={openAdd}
                listId={listId}
                existingMemberIds={members.map((m) => m.id)}
                onClose={() => setOpenAdd(false)}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
