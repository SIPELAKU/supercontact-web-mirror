"use client";

import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { Loader2, ListChecks } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { EmptyState } from "@/components/ui/empty-state";
import { useCompanyLists, useAddCompanyListMembers } from "@/lib/hooks/useCompanyLists";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";

interface AddSelectedToListModalProps {
    open: boolean;
    crmCompanyIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

// Bulk "add these already-selected rows to a list" - a genuinely new
// capability (previously "Add Companies" only existed from inside a
// single list's own detail page, picking companies one at a time; this
// goes the other direction, picking a list for companies you've already
// selected in the Companies workspace). Only static lists are offered -
// dynamic lists populate themselves from their filter, so manually adding
// to one wouldn't do anything.
export default function AddSelectedToListModal({
    open,
    crmCompanyIds,
    onClose,
    onSuccess,
}: AddSelectedToListModalProps) {
    const { data: response, isLoading } = useCompanyLists({ limit: 100 });
    const staticLists = (response?.data || []).filter((list) => list.list_type === "static");
    const [selectedListId, setSelectedListId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const addMembersMutation = useAddCompanyListMembers();

    useEffect(() => {
        if (open) setSelectedListId(null);
    }, [open]);

    const handleSubmit = async () => {
        if (!selectedListId) {
            notify.warning("Validation Error", { description: "Select a list." });
            return;
        }
        setIsSaving(true);
        try {
            await addMembersMutation.mutateAsync({ id: selectedListId, crmCompanyIds });
            notify.success("Added to List", {
                description: `${crmCompanyIds.length} compan${crmCompanyIds.length === 1 ? "y" : "ies"} added.`,
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Add to List") });
        } finally {
            setIsSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900">Add to List</h2>
                    <p className="mt-1 text-xs text-gray-500">
                        {crmCompanyIds.length} compan{crmCompanyIds.length === 1 ? "y" : "ies"} selected
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <CircularProgress size={24} />
                        </div>
                    ) : staticLists.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                icon={ListChecks}
                                title="No static lists yet"
                                description="Create a static list from the Lists tab first."
                            />
                        </div>
                    ) : (
                        staticLists.map((list) => (
                            <label
                                key={list.id}
                                className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50"
                            >
                                <input
                                    type="radio"
                                    name="target-list"
                                    checked={selectedListId === list.id}
                                    onChange={() => setSelectedListId(list.id)}
                                    className="h-4 w-4 accent-[#5479EE]"
                                />
                                <span className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">{list.name}</span>
                                    <span className="text-xs text-gray-400">{list.member_count} members</span>
                                </span>
                            </label>
                        ))
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isSaving || !selectedListId} variantStyle="primary">
                        {isSaving ? <Loader2 className="animate-spin" /> : "Add"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
