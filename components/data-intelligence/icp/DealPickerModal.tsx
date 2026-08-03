"use client";

import React, { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { notify } from "@/lib/notifications";
import { fetchClosedWonDeals } from "@/lib/api/icp-profiles";
import { ClosedWonDeal } from "@/lib/types/icp";
import { Loader2 } from "lucide-react";

interface DealPickerModalProps {
    open: boolean;
    onClose: () => void;
    // null = "use all closed-won deals" (the founder-persona default -
    // "just give me a good list").
    onConfirm: (dealIds: string[] | null) => void;
}

export default function DealPickerModal({ open, onClose, onConfirm }: DealPickerModalProps) {
    const [deals, setDeals] = useState<ClosedWonDeal[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setIsLoading(true);
        fetchClosedWonDeals()
            .then((data) => {
                setDeals(data);
                setSelected(new Set());
            })
            .catch(() => {
                notify.error("Error", { description: "Failed to load closed-won deals." });
            })
            .finally(() => setIsLoading(false));
    }, [open]);

    if (!open) return null;

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Choose Closed-Won Deals</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Pick specific deals to derive the ICP from, or use every closed-won deal.
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    ) : deals.length === 0 ? (
                        <p className="text-sm text-gray-500">No closed-won deals found.</p>
                    ) : (
                        deals.map((deal) => (
                            <label
                                key={deal.id}
                                className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm cursor-pointer hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.has(deal.id)}
                                    onChange={() => toggle(deal.id)}
                                    className="h-4 w-4"
                                />
                                <div>
                                    <div className="font-medium text-gray-900">{deal.companyLabel}</div>
                                    <div className="text-xs text-gray-500">
                                        {deal.productName}
                                        {deal.expectedCloseDate ? ` · ${deal.expectedCloseDate.slice(0, 10)}` : ""}
                                    </div>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-between items-center gap-3">
                    <button
                        onClick={() => onConfirm(null)}
                        className="text-sm font-medium text-[#5479EE] hover:underline"
                    >
                        Use all closed-won deals
                    </button>
                    <div className="flex gap-3">
                        <AppButton onClick={onClose} variantStyle="outline" color="gray">
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={() => onConfirm(Array.from(selected))}
                            disabled={selected.size === 0}
                            variantStyle="primary"
                        >
                            Use {selected.size || ""} Selected
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
