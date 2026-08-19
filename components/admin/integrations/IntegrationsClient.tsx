"use client";

import React, { useEffect, useState } from "react";
import { AppButton } from "@/components/ui/app-button";
import { DeleteButton, EditButton } from "@/components/ui/app-action-buttons-table";
import SettingsPageHeader from "@/components/settings/SettingsPageHeader";
import { handleError } from "@/lib/utils/errorHandler";
import { useIntegrations, useTestIntegrationConnection } from "@/lib/hooks/useIntegrations";
import { Integration, IntegrationProvider } from "@/lib/models/types";
import { notify } from "@/lib/notifications";
import { CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import { AlertCircle, CheckCircle2, HelpCircle, Play, Plus } from "lucide-react";
import AddIntegrationModal from "./AddIntegrationModal";
import EditIntegrationModal from "./EditIntegrationModal";
import DeleteIntegrationModal from "./DeleteIntegrationModal";
import ConnectionStatusModal from "./ConnectionStatusModal";

// B6: pluggable adapter stubs - schema-reserved (see AVAILABLE_PROVIDERS
// below, which deliberately excludes these) but no client is wired up yet.
// Shown here so it's clear these are planned, not simply missing.
const COMING_SOON_PROVIDERS: IntegrationProvider[] = ["ahu_oss_npwp", "whatsapp_business"];

export const PROVIDER_LABELS: Record<IntegrationProvider, string> = {
    google_maps: "Google Maps",
    llm_groq: "LLM (Groq)",
    llm_openai: "LLM (OpenAI)",
    llm_anthropic: "LLM (Anthropic)",
    social_firmographic: "Social / Firmographic",
    ahu_oss_npwp: "AHU / OSS / NPWP (Gov. Registry)",
    whatsapp_business: "WhatsApp Business",
    meta_graph: "Meta Graph (Facebook/Instagram)",
};

// Providers a tenant can actually configure today - the rest are reserved in
// the schema for later so they can ship without a migration, but have no
// client wired up yet.
export const AVAILABLE_PROVIDERS: IntegrationProvider[] = ["google_maps", "llm_groq", "meta_graph"];

export const IntegrationsClient = () => {
    const { data: response, isLoading, isError, error, refetch } = useIntegrations();
    const integrations = response?.data?.providers || [];

    useEffect(() => {
        if (isError && error) {
            const message = handleError(error, "Fetch Integrations");
            notify.error("Failed to load integrations", { description: message });
        }
    }, [isError, error]);

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openStatus, setOpenStatus] = useState(false);
    const [selected, setSelected] = useState<Integration | null>(null);

    const testConnectionMutation = useTestIntegrationConnection();

    const handleTestConnection = async (item: Integration) => {
        notify.info("Testing Connection...", {
            description: `Testing connection to ${PROVIDER_LABELS[item.provider]}`,
        });
        try {
            const res = await testConnectionMutation.mutateAsync(item.id);
            if (res.success) {
                notify.success("Connection Successful", { description: res.data.message });
            }
        } catch (err: any) {
            const message = handleError(err, "Test Connection");
            notify.error("Connection Failed", { description: message, duration: 10000 });
        }
    };

    const handleEdit = (item: Integration) => {
        setSelected(item);
        setOpenEdit(true);
    };

    const handleDelete = (item: Integration) => {
        setSelected(item);
        setOpenDelete(true);
    };

    const handleViewLog = (item: Integration) => {
        setSelected(item);
        setOpenStatus(true);
    };

    const configuredProviders = integrations.map((i) => i.provider);
    const canAddMore = AVAILABLE_PROVIDERS.some((p) => !configuredProviders.includes(p));

    return (
        <div className="w-full flex flex-col gap-4 p-4 md:p-8">
            <SettingsPageHeader
                title="Integrations"
                breadcrumbs={[
                    { label: "Settings", href: "/settings" },
                    { label: "Integrations" },
                ]}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 space-y-8 min-h-[300px]">
                <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pt-5">
                    <p className="text-sm text-gray-500 max-w-lg">
                        Bring your own API key for Google Maps or your LLM provider to search
                        with your own quota instead of the shared platform key.
                    </p>
                    <AppButton
                        onClick={() => setOpenAdd(true)}
                        variantStyle="primary"
                        startIcon={<Plus size={16} />}
                        disabled={!canAddMore}
                    >
                        Add Integration
                    </AppButton>
                </section>

                <div className="overflow-x-auto rounded-lg border border-gray-200 mx-6 mb-6">
                    <Table sx={{ minWidth: 640 }}>
                        <TableHead>
                            <TableRow className="bg-[#EEF2FD]!">
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2 }}>Provider</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, textAlign: "center" }}>Status</TableCell>
                                <TableCell sx={{ color: "#6B7280", fontWeight: 600, py: 2, pr: 3, textAlign: "center" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : integrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 10 }}>
                                        <p className="text-gray-500">No integrations configured yet - searches use the shared platform key.</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                integrations.map((item) => (
                                    <TableRow key={item.id} hover sx={{ "&:hover": { bgcolor: "#f9fafb" } }}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-gray-900">
                                                    {PROVIDER_LABELS[item.provider]}
                                                </span>
                                                {item.status === "Error" ? (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-red-500 hover:underline cursor-pointer"
                                                    >
                                                        <AlertCircle size={12} className="text-red-500" />
                                                        Check log connection
                                                    </button>
                                                ) : item.status === "Active" ? (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-emerald-500 hover:underline cursor-pointer"
                                                    >
                                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                                        Check log connection
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleViewLog(item)}
                                                        className="flex items-center gap-1 text-xs text-gray-400 hover:underline cursor-pointer"
                                                    >
                                                        <HelpCircle size={12} className="text-gray-400" />
                                                        Check log connection
                                                    </button>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "Active"
                                                        ? "bg-emerald-100 text-emerald-600"
                                                        : item.status === "Error"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleTestConnection(item)}
                                                    className="cursor-pointer p-1 hover:bg-gray-100 rounded-lg text-emerald-500 transition-colors disabled:opacity-50"
                                                    title="Test Connection"
                                                    disabled={testConnectionMutation.isPending}
                                                >
                                                    {testConnectionMutation.isPending && testConnectionMutation.variables === item.id ? (
                                                        <CircularProgress size={18} color="inherit" />
                                                    ) : (
                                                        <Tooltip title="Test Connection">
                                                            <Play size={18} />
                                                        </Tooltip>
                                                    )}
                                                </button>
                                                <EditButton onClick={() => handleEdit(item)} />
                                                <DeleteButton onClick={() => handleDelete(item)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <section className="px-6 pb-6">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3">Coming Soon</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {COMING_SOON_PROVIDERS.map((provider) => (
                            <div
                                key={provider}
                                className="rounded-lg border border-dashed border-gray-200 px-4 py-3"
                            >
                                <span className="text-sm font-medium text-gray-500">
                                    {PROVIDER_LABELS[provider]}
                                </span>
                                <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                                    Coming Soon
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <AddIntegrationModal
                open={openAdd}
                onClose={() => setOpenAdd(false)}
                onSuccess={() => refetch()}
                configuredProviders={configuredProviders}
            />

            <EditIntegrationModal
                open={openEdit}
                onClose={() => setOpenEdit(false)}
                onSuccess={() => refetch()}
                integration={selected}
            />

            {openDelete && (
                <DeleteIntegrationModal
                    open={openDelete}
                    onClose={() => setOpenDelete(false)}
                    onSuccess={() => refetch()}
                    integration={selected}
                />
            )}

            {openStatus && (
                <ConnectionStatusModal
                    open={openStatus}
                    onClose={() => setOpenStatus(false)}
                    providerName={selected ? PROVIDER_LABELS[selected.provider] : ""}
                    integrationId={selected?.id || null}
                />
            )}
        </div>
    );
};
