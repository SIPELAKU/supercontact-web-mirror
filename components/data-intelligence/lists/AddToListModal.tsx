"use client";

import React, { useEffect, useState } from "react";
import { Checkbox, CircularProgress } from "@mui/material";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { useAuth } from "@/lib/context/AuthContext";
import { getMyTargetCompanies } from "@/lib/api/company-intelligence";
import { useAddCompanyListMembers } from "@/lib/hooks/useCompanyLists";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { Loader2 } from "lucide-react";

interface AddToListModalProps {
    open: boolean;
    listId: string;
    existingMemberIds: string[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddToListModal({
    open,
    listId,
    existingMemberIds,
    onClose,
    onSuccess,
}: AddToListModalProps) {
    const { getToken } = useAuth();
    const [search, setSearch] = useState("");
    const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isSearching, setIsSearching] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const addMembersMutation = useAddCompanyListMembers();

    useEffect(() => {
        if (!open) return;
        setSearch("");
        setSelected(new Set());
        loadCompanies("");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const loadCompanies = async (query: string) => {
        setIsSearching(true);
        try {
            const token = await getToken();
            const res = await getMyTargetCompanies(token, { search: query || undefined, limit: 50 });
            setCompanies(res.data.map((c) => ({ id: c.id, name: c.name })));
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Search Saved Companies") });
        } finally {
            setIsSearching(false);
        }
    };

    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleSubmit = async () => {
        if (selected.size === 0) {
            notify.warning("Validation Error", { description: "Select at least one company." });
            return;
        }
        setIsSaving(true);
        try {
            await addMembersMutation.mutateAsync({ id: listId, crmCompanyIds: Array.from(selected) });
            notify.success("Companies Added", { description: `${selected.size} compan${selected.size === 1 ? "y" : "ies"} added to the list.` });
            onSuccess();
            onClose();
        } catch (err: any) {
            notify.error("Error", { description: handleError(err, "Add Companies") });
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
                className="flex h-[70vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-b border-gray-100 p-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Companies</h2>
                    <p className="mt-1 text-xs text-gray-500">From your saved companies</p>
                </div>

                <div className="border-b border-gray-100 p-4">
                    <AppInput
                        isBgWhite
                        fullWidth
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            loadCompanies(e.target.value);
                        }}
                        placeholder="Search saved companies..."
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {isSearching ? (
                        <div className="flex justify-center py-10">
                            <CircularProgress size={24} />
                        </div>
                    ) : companies.length === 0 ? (
                        <p className="p-4 text-center text-sm text-gray-500">No saved companies found.</p>
                    ) : (
                        companies.map((company) => {
                            const alreadyMember = existingMemberIds.includes(company.id);
                            return (
                                <label
                                    key={company.id}
                                    className={`flex items-center gap-2 rounded-lg px-2 py-2 ${
                                        alreadyMember ? "opacity-50" : "cursor-pointer hover:bg-gray-50"
                                    }`}
                                >
                                    <Checkbox
                                        checked={selected.has(company.id) || alreadyMember}
                                        disabled={alreadyMember}
                                        onChange={() => toggle(company.id)}
                                        size="small"
                                    />
                                    <span className="text-sm text-gray-800">
                                        {company.name} {alreadyMember && <span className="text-xs text-gray-400">(already in list)</span>}
                                    </span>
                                </label>
                            );
                        })
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isSaving} variantStyle="primary">
                        {isSaving ? <Loader2 className="animate-spin" /> : `Add ${selected.size > 0 ? `(${selected.size})` : ""}`}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
