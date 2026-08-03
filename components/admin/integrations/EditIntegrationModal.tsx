"use client";

import React, { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { useUpdateIntegration } from "@/lib/hooks/useIntegrations";
import { Integration } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { PROVIDER_LABELS } from "./IntegrationsClient";

interface EditIntegrationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    integration: Integration | null;
}

const EditIntegrationModal: React.FC<EditIntegrationModalProps> = ({
    open,
    onClose,
    onSuccess,
    integration,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");

    useEffect(() => {
        if (open && integration) {
            // Never pre-fill the key - the API never returns it. Blank means
            // "keep the current key", mirroring the Mail Server edit form.
            setApiKey("");
            setModel((integration.config?.model as string) || "");
        }
    }, [open, integration]);

    const updateIntegrationMutation = useUpdateIntegration();

    const handleSubmit = async () => {
        if (!integration) return;
        setIsLoading(true);

        try {
            const payload: Record<string, any> = {};
            if (apiKey) {
                payload.api_key = apiKey;
            }
            if (integration.provider === "llm_groq") {
                payload.config = model ? { model } : {};
            }

            if (Object.keys(payload).length === 0) {
                notify.warning("Nothing to update", { description: "Change the API key or model, then save." });
                setIsLoading(false);
                return;
            }

            await updateIntegrationMutation.mutateAsync({ id: integration.id, data: payload });

            notify.success("Integration Updated", {
                description: `${PROVIDER_LABELS[integration.provider]} has been updated.`,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Update Integration");
            notify.error("Error", { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    if (!open || !integration) return null;

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
                    <h2 className="text-xl font-bold text-gray-900">
                        Edit {PROVIDER_LABELS[integration.provider]}
                    </h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">API Key</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Leave blank to keep current key"
                        />
                        <p className="text-xs text-gray-500">Only fill this in if you want to replace the current key.</p>
                    </div>

                    {integration.provider === "llm_groq" && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Model (optional)</label>
                            <AppInput
                                isBgWhite
                                fullWidth
                                value={model}
                                onChange={(e) => setModel(e.target.value)}
                                placeholder="Default: llama-3.3-70b-versatile"
                            />
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                    <AppButton onClick={onClose} variantStyle="outline" color="gray">
                        Cancel
                    </AppButton>
                    <AppButton onClick={handleSubmit} disabled={isLoading} variantStyle="primary">
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save Changes"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default EditIntegrationModal;
