"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { useCreateSuppressionEntry } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { SuppressionEntryType } from "@/lib/types/compliance";

interface AddSuppressionEntryModalProps {
    open: boolean;
    onClose: () => void;
}

const ENTRY_TYPE_OPTIONS: { value: SuppressionEntryType; label: string }[] = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "domain", label: "Domain" },
    { value: "organization_id", label: "Organization ID" },
];

export default function AddSuppressionEntryModal({ open, onClose }: AddSuppressionEntryModalProps) {
    const [entryType, setEntryType] = useState<SuppressionEntryType>("email");
    const [value, setValue] = useState("");
    const [reason, setReason] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const createEntry = useCreateSuppressionEntry();

    useEffect(() => {
        if (open) {
            setEntryType("email");
            setValue("");
            setReason("");
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!value.trim()) {
            notify.warning("Validation Error", { description: "Please enter a value to suppress." });
            return;
        }
        setIsLoading(true);
        try {
            await createEntry.mutateAsync({
                entry_type: entryType,
                value: value.trim(),
                reason: reason.trim() || undefined,
            });
            notify.success("Added to Suppression List", {
                description: "This value will be excluded from future search results and CRM saves.",
            });
            onClose();
        } catch (error: any) {
            notify.error("Error", { description: handleError(error, "Add Suppression Entry") });
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
                    <h2 className="text-xl font-bold text-gray-900">Add to Suppression List</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Suppressed values are excluded from search results and blocked from being saved to
                        CRM in this workspace only.
                    </p>
                </div>

                <div className="p-6 space-y-4">
                    <AppSelect
                        label="Type"
                        value={entryType}
                        onChange={(e) => setEntryType(e.target.value as SuppressionEntryType)}
                        options={ENTRY_TYPE_OPTIONS}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Value <span className="text-red-500">*</span>
                        </label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={
                                entryType === "email"
                                    ? "name@example.com"
                                    : entryType === "phone"
                                      ? "0812xxxxxxx"
                                      : entryType === "domain"
                                        ? "example.com"
                                        : "organization uuid"
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Reason (optional)</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. opted out, DSR request #..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Add"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
