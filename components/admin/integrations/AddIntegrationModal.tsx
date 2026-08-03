"use client";

import React, { useEffect, useState } from "react";
import { AppInput } from "@/components/ui/app-input";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { useCreateIntegration } from "@/lib/hooks/useIntegrations";
import { IntegrationProvider } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { Loader2 } from "lucide-react";
import { AVAILABLE_PROVIDERS, PROVIDER_LABELS } from "./IntegrationsClient";

interface AddIntegrationModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    configuredProviders: IntegrationProvider[];
}

const AddIntegrationModal: React.FC<AddIntegrationModalProps> = ({
    open,
    onClose,
    onSuccess,
    configuredProviders,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [provider, setProvider] = useState<IntegrationProvider | "">("");
    const [apiKey, setApiKey] = useState("");
    const [model, setModel] = useState("");

    const selectableProviders = AVAILABLE_PROVIDERS.filter(
        (p) => !configuredProviders.includes(p)
    );

    useEffect(() => {
        if (open) {
            setProvider(selectableProviders[0] || "");
            setApiKey("");
            setModel("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const createIntegrationMutation = useCreateIntegration();

    const handleSubmit = async () => {
        if (!provider || !apiKey) {
            notify.warning("Validation Error", { description: "Please select a provider and enter an API key." });
            return;
        }

        setIsLoading(true);
        try {
            await createIntegrationMutation.mutateAsync({
                provider,
                api_key: apiKey,
                config: provider === "llm_groq" && model ? { model } : undefined,
            });

            notify.success("Integration Added", {
                description: `${PROVIDER_LABELS[provider]} has been connected. Test the connection to activate it.`,
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            const message = handleError(error, "Add Integration");
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
                    <h2 className="text-xl font-bold text-gray-900">Add Integration</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Provider <span className="text-red-500">*</span>
                        </label>
                        <AppSelect
                            isBgWhite
                            fullWidth
                            size="small"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as IntegrationProvider)}
                            displayEmpty
                            options={selectableProviders.map((p) => ({
                                value: p,
                                label: PROVIDER_LABELS[p],
                            }))}
                        />
                        {selectableProviders.length === 0 && (
                            <p className="text-xs text-gray-500">
                                Every available provider already has an integration configured.
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            API Key <span className="text-red-500">*</span>
                        </label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Paste your API key"
                        />
                        {provider === "meta_graph" && (
                            <p className="text-xs text-gray-500">
                                Paste a long-lived Facebook/Instagram Page Access Token.
                            </p>
                        )}
                    </div>

                    {provider === "llm_groq" && (
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
                    <AppButton
                        onClick={handleSubmit}
                        disabled={isLoading || selectableProviders.length === 0}
                        variantStyle="primary"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default AddIntegrationModal;
