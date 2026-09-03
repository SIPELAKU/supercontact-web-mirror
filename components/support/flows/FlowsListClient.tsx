"use client";

// components/support/flows/FlowsListClient.tsx
// Flows list (F1): every automation flow of the tenant with status/version,
// a "New Flow" dialog (name + channel scope + trigger), and delete. Rows open
// the visual studio. Gated on conversations:routing:manage (same gate as the
// backend /support/flows endpoints).

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus, ShieldAlert, Trash2, Workflow } from "lucide-react";
import PageHeader from "@/components/ui/page-header";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { usePermission } from "@/lib/hooks/usePermission";
import { useCreateFlow, useDeleteFlow, useFlows } from "@/lib/hooks/useFlows";
import type { FlowChannel, FlowSummary, FlowTriggerType } from "@/lib/api/flows";
import { CHANNEL_LABELS, KeywordsInput, TRIGGER_TYPE_OPTIONS } from "./FlowPropertiesPanel";
import { makeGraphId } from "./flowGraph";

// Every channel the FlowEngine runs on (F3 completed the set).
const FLOW_CHANNELS: { value: FlowChannel; label: string }[] = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "web_widget", label: "Web widget" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "messenger", label: "Messenger" },
    { value: "instagram", label: "Instagram" },
];

const TRIGGER_LABEL: Record<string, string> = Object.fromEntries(
    TRIGGER_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

function StatusBadge({ status }: { status: FlowSummary["status"] }) {
    return status === "published" ? (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            Published
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            Draft
        </span>
    );
}

export default function FlowsListClient() {
    const router = useRouter();
    const { can } = usePermission();
    const canManage = can("conversations:routing:manage");

    const { data: flows = [], isLoading, isError, refetch } = useFlows();
    const createMutation = useCreateFlow();
    const deleteMutation = useDeleteFlow();

    // ---- New Flow dialog state ---------------------------------------------
    const [createOpen, setCreateOpen] = useState(false);
    const [name, setName] = useState("");
    const [channels, setChannels] = useState<FlowChannel[]>(["whatsapp"]);
    const [triggerType, setTriggerType] = useState<FlowTriggerType>("inbound_first");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<FlowSummary | null>(null);

    const openCreate = () => {
        setName("");
        setChannels(["whatsapp"]);
        setTriggerType("inbound_first");
        setKeywords([]);
        setCreateOpen(true);
    };

    const toggleChannel = (channel: FlowChannel) => {
        setChannels((current) =>
            current.includes(channel)
                ? current.filter((c) => c !== channel)
                : [...current, channel]
        );
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a flow name." });
            return;
        }
        if (channels.length === 0) {
            notify.warning("Validation Error", {
                description: "Select at least one channel for this flow.",
            });
            return;
        }
        if (triggerType === "keyword" && keywords.length === 0) {
            notify.warning("Validation Error", {
                description: "Add at least one trigger keyword.",
            });
            return;
        }
        try {
            const created = await createMutation.mutateAsync({
                name: name.trim(),
                channel_scope: channels,
                trigger_config:
                    triggerType === "keyword"
                        ? { type: triggerType, keywords }
                        : { type: triggerType },
                // Seed the canvas with its (single, undeletable) trigger node
                // so the studio always opens with the starting point in place.
                graph: {
                    nodes: [
                        {
                            id: makeGraphId("trigger"),
                            type: "trigger",
                            position: { x: 260, y: 40 },
                            data: {},
                        },
                    ],
                    edges: [],
                },
            });
            setCreateOpen(false);
            notify.success("Flow created", { description: "Opening the studio..." });
            router.push(`/support/flows/${created.id}/studio`);
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Create Flow") });
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteMutation.mutateAsync(deleteTarget.id);
            notify.success("Flow deleted");
            setDeleteTarget(null);
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Delete Flow") });
        }
    };

    const columns = useMemo<MRT_ColumnDef<FlowSummary>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
                Cell: ({ row }) => (
                    <div>
                        <span className="font-semibold text-gray-800">{row.original.name}</span>
                        {row.original.description && (
                            <p className="line-clamp-1 text-xs text-gray-400">
                                {row.original.description}
                            </p>
                        )}
                    </div>
                ),
            },
            {
                id: "channels",
                accessorFn: (row) =>
                    (row.channel_scope ?? []).map((c) => CHANNEL_LABELS[c] ?? c).join(", "),
                header: "Channels",
                Cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1">
                        {(row.original.channel_scope ?? []).map((c) => (
                            <span
                                key={c}
                                className="inline-flex items-center rounded-full bg-[#5479EE]/10 px-2 py-0.5 text-xs font-medium text-[#3f5fd0]"
                            >
                                {CHANNEL_LABELS[c] ?? c}
                            </span>
                        ))}
                    </div>
                ),
            },
            {
                id: "trigger",
                accessorFn: (row) => {
                    const type = row.trigger_config?.type;
                    return type ? TRIGGER_LABEL[type] ?? type : "-";
                },
                header: "Trigger",
            },
            {
                accessorKey: "status",
                header: "Status",
                Cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "version",
                header: "Version",
                Cell: ({ row }) => <span className="text-gray-600">v{row.original.version}</span>,
            },
            {
                id: "updated_at",
                accessorFn: (row) => row.updated_at,
                header: "Updated",
                Cell: ({ row }) => {
                    const raw = row.original.updated_at;
                    const date = raw ? new Date(raw) : null;
                    return (
                        <span className="text-gray-500">
                            {date && !Number.isNaN(date.getTime())
                                ? format(date, "d MMM yyyy, HH:mm")
                                : "-"}
                        </span>
                    );
                },
            },
        ],
        []
    );

    if (!canManage) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
                <ShieldAlert className="h-8 w-8 text-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
                <p className="max-w-sm text-sm text-gray-500">
                    You need the conversation routing permission to manage automation flows. Ask an
                    administrator if you believe you should have access.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-full space-y-6 px-4 pt-6 sm:px-6 md:px-8">
            <PageHeader
                title="Flows"
                description="Visual automation flows that reply, branch, and hand off inbound conversations."
                breadcrumbs={[{ label: "Support" }, { label: "Flows" }]}
                actions={
                    <AppButton onClick={openCreate} startIcon={<Plus size={16} />}>
                        New Flow
                    </AppButton>
                }
            />

            <SuperTable<FlowSummary>
                entityLabel="flow"
                searchPlaceholder="Cari nama flow"
                tableId="support-flows-table"
                urlKey=""
                columns={columns}
                data={flows}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load flows. Please try again."
                onRetry={() => refetch()}
                // The name is the way into the studio: a real link, so
                // middle-click and open-in-new-tab work. Row click stays on top
                // as a mouse convenience.
                primaryColumn={{
                    accessorKey: "name",
                    href: (row) => `/support/flows/${row.id}/studio`,
                }}
                onRowClick={(row) => router.push(`/support/flows/${row.id}/studio`)}
                rowActions={[
                    {
                        id: "delete",
                        label: "Delete",
                        icon: <Trash2 size={16} />,
                        destructive: true,
                        onClick: (row) => setDeleteTarget(row),
                    },
                ]}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Workflow}
                        title="No flows yet"
                        description="Create your first automation flow: auto-reply, branch on keywords or business hours, and hand off to an agent."
                        action={{
                            label: "New Flow",
                            onClick: openCreate,
                            icon: <Plus size={16} />,
                        }}
                    />
                )}
                features={{          urlSync: true,
 columnFilters: false }}
            />

            {/* ---- New Flow dialog ---- */}
            <Dialog
                open={createOpen}
                onOpenChange={(next) => {
                    if (!next && !createMutation.isPending) setCreateOpen(false);
                }}
                maxWidth="sm"
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>New Flow</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <AppInput
                            isBgWhite
                            fullWidth
                            label="Name"
                            required
                            placeholder="e.g. WhatsApp welcome + FAQ handoff"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />

                        <div>
                            <p className="mb-1.5 text-sm font-medium text-gray-600">
                                Channels <span className="text-red-500">*</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {FLOW_CHANNELS.map((c) => {
                                    const active = channels.includes(c.value);
                                    return (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => toggleChannel(c.value)}
                                            aria-pressed={active}
                                            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                                                active
                                                    ? "border-[#5479EE] bg-[#5479EE]/10 text-[#3f5fd0]"
                                                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                                The flow runs only on the channels you pick here, and only on
                                accounts switched to flow automation.
                            </p>
                        </div>

                        <AppSelect
                            isBgWhite
                            fullWidth
                            label="Trigger"
                            value={triggerType}
                            options={TRIGGER_TYPE_OPTIONS}
                            onChange={(e) => setTriggerType(e.target.value as FlowTriggerType)}
                        />

                        {triggerType === "keyword" && (
                            <div>
                                <p className="mb-1.5 text-sm font-medium text-gray-600">
                                    Trigger keywords <span className="text-red-500">*</span>
                                </p>
                                <KeywordsInput value={keywords} onChange={setKeywords} />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <AppButton
                            variantStyle="outline"
                            color="gray"
                            onClick={() => setCreateOpen(false)}
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </AppButton>
                        <AppButton
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            isLoading={createMutation.isPending}
                        >
                            Create & open studio
                        </AppButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
                title="Delete flow"
                description={
                    deleteTarget?.status === "published"
                        ? `"${deleteTarget?.name ?? ""}" is PUBLISHED and currently running. Deleting it stops the automation immediately. This action cannot be undone.`
                        : `Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`
                }
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
