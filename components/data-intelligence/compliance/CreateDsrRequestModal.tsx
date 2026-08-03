"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { useCreateDsrRequest } from "@/lib/hooks/useCompliance";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { DsrRequestType } from "@/lib/types/compliance";

interface CreateDsrRequestModalProps {
    open: boolean;
    onClose: () => void;
}

const REQUEST_TYPE_OPTIONS: { value: DsrRequestType; label: string }[] = [
    { value: "access", label: "Access - what data do you hold on me?" },
    { value: "deletion", label: "Deletion - remove my data" },
    { value: "correction", label: "Correction - fix incorrect data" },
];

export default function CreateDsrRequestModal({ open, onClose }: CreateDsrRequestModalProps) {
    const [requestType, setRequestType] = useState<DsrRequestType>("access");
    const [subjectName, setSubjectName] = useState("");
    const [subjectContact, setSubjectContact] = useState("");
    const [details, setDetails] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const createRequest = useCreateDsrRequest();

    useEffect(() => {
        if (open) {
            setRequestType("access");
            setSubjectName("");
            setSubjectContact("");
            setDetails("");
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!subjectName.trim() || !subjectContact.trim()) {
            notify.warning("Validation Error", {
                description: "Please enter the subject's name and email or phone.",
            });
            return;
        }
        setIsLoading(true);
        try {
            await createRequest.mutateAsync({
                request_type: requestType,
                subject_name: subjectName.trim(),
                subject_email_or_phone: subjectContact.trim(),
                details: details.trim() || undefined,
            });
            notify.success("Request Logged", { description: "Data subject request has been logged." });
            onClose();
        } catch (error: any) {
            notify.error("Error", { description: handleError(error, "Log DSR Request") });
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
                    <h2 className="text-xl font-bold text-gray-900">Log a Data Subject Request</h2>
                </div>

                <div className="p-6 space-y-4">
                    <AppSelect
                        label="Request Type"
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value as DsrRequestType)}
                        options={REQUEST_TYPE_OPTIONS}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            placeholder="Full name of the person making the request"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Email or Phone <span className="text-red-500">*</span>
                        </label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            value={subjectContact}
                            onChange={(e) => setSubjectContact(e.target.value)}
                            placeholder="name@example.com or 0812xxxxxxx"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Details (optional)</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            multiline
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Any extra context about this request"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Log Request"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
}
