"use client";

import React, { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { useCreateCompanyList } from "@/lib/hooks/useCompanyLists";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { CompanyIntelligenceSearchPayload } from "@/lib/types/company-intelligence";

interface CreateListModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    // D2: the Companies workspace always holds live Discover-tab filter
    // state in memory (it doesn't get cleared switching tabs), so a Dynamic
    // list is created from whatever's actually on screen right now - no
    // more depending on sessionStorage from a previous page visit.
    currentFilter?: CompanyIntelligenceSearchPayload | null;
    defaultListType?: "static" | "dynamic";
}

export default function CreateListModal({
    open,
    onClose,
    onSuccess,
    currentFilter = null,
    defaultListType = "static",
}: CreateListModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [listType, setListType] = useState<"static" | "dynamic">("static");
    const [isLoading, setIsLoading] = useState(false);

    const createListMutation = useCreateCompanyList();

    useEffect(() => {
        if (open) {
            setName("");
            setDescription("");
            setListType(defaultListType);
        }
    }, [open, defaultListType]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a list name." });
            return;
        }
        if (listType === "dynamic" && !currentFilter) {
            notify.warning("Validation Error", {
                description: "Switch to the Discover tab, set up your filters, then save them as a list.",
            });
            return;
        }

        setIsLoading(true);
        try {
            await createListMutation.mutateAsync({
                name: name.trim(),
                description: description.trim() || undefined,
                list_type: listType,
                filter_criteria: listType === "dynamic" ? currentFilter! : undefined,
            });
            notify.success("List Created", { description: `"${name.trim()}" has been created.` });
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Create List");
            notify.error("Error", { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Create List</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            List Name <span className="text-red-500">*</span>
                        </label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Jakarta Fintech Targets"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Description (optional)</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What is this list for?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setListType("static")}
                                className={`flex-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                                    listType === "static"
                                        ? "border-[#5479EE] bg-[#5479EE10] text-[#5479EE]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <span className="block font-semibold">Static</span>
                                <span className="text-xs text-gray-500">Manually add companies</span>
                            </button>
                            <button
                                onClick={() => setListType("dynamic")}
                                className={`flex-1 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                                    listType === "dynamic"
                                        ? "border-[#5479EE] bg-[#5479EE10] text-[#5479EE]"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                <span className="block font-semibold">Dynamic</span>
                                <span className="text-xs text-gray-500">Auto-updates from a saved filter</span>
                            </button>
                        </div>
                        {listType === "dynamic" && (
                            <p className="text-xs text-gray-500">
                                {currentFilter
                                    ? "This list will use your current Discover filters."
                                    : "No active Discover filters - switch to the Discover tab and set some up first."}
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Create"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
