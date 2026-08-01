"use client";

import React, { useState } from "react";
import { notify } from "@/lib/notifications";
import { useDeleteIntegration } from "@/lib/hooks/useIntegrations";
import { Integration } from "@/lib/models/types";
import { AppButton } from "@/components/ui/app-button";
import { Loader2 } from "lucide-react";
import { handleError } from "@/lib/utils/errorHandler";
import { PROVIDER_LABELS } from "./IntegrationsClient";

interface DeleteIntegrationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    integration: Integration | null;
}

const DeleteIntegrationModal: React.FC<DeleteIntegrationModalProps> = ({
    open,
    onClose,
    onSuccess,
    integration,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const deleteIntegrationMutation = useDeleteIntegration();

    const handleSubmit = async () => {
        if (!integration) return;
        setIsLoading(true);

        try {
            await deleteIntegrationMutation.mutateAsync(integration.id);

            notify.success("Integration Deleted", { description: "Searches for this provider will fall back to the shared platform key." });
            onSuccess();
            onClose();
        } catch (err: any) {
            const message = handleError(err, "Delete Integration");
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
                <div className="p-6 text-start">
                    <h2 className="text-2xl font-bold text-gray-900">Delete Integration</h2>
                    <p className="text-gray-600 text-md mt-2">
                        Are you sure you want to remove the{" "}
                        <span className="font-semibold text-gray-900">
                            {integration ? PROVIDER_LABELS[integration.provider] : ""}
                        </span>{" "}
                        integration? This cannot be undone.
                    </p>

                    <div className="flex justify-end gap-3 mt-8 font-medium">
                        <AppButton onClick={onClose} variantStyle="outline" color="gray">
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={handleSubmit}
                            disabled={isLoading}
                            variantStyle="danger"
                            color="danger"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Delete Integration"}
                        </AppButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteIntegrationModal;
