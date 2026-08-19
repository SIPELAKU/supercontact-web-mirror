"use client";

import { useMemo, useState } from "react";
import { Switch } from "@mui/material";
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { EmptyState } from "@/components/ui/empty-state";
import { SuperTable, MRT_ColumnDef } from "@/components/ui/super-table";
import { notify } from "@/lib/notifications";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import {
    useTicketAutomationRules,
    useCreateTicketAutomationRule,
    useUpdateTicketAutomationRule,
    useDeleteTicketAutomationRule,
} from "@/lib/hooks/useTicketAutomationRules";
import { useAssignableAgents } from "@/lib/hooks/useTickets";
import {
    TicketAutomationAction,
    TicketAutomationRule,
    TicketAutomationTriggerType,
    TicketConditionClause,
    TicketConditionOp,
} from "@/lib/types/TicketAutomation";

const TRIGGER_OPTIONS: { value: TicketAutomationTriggerType; label: string }[] = [
    { value: "on_create", label: "On Ticket Created" },
    { value: "on_update", label: "On Ticket Updated" },
];

const FIELD_OPTIONS = [
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
];

const OP_OPTIONS: { value: TicketConditionOp; label: string }[] = [
    { value: "eq", label: "is" },
    { value: "neq", label: "is not" },
    { value: "in", label: "is any of" },
    { value: "changed_to", label: "changed to" },
    { value: "changed_from", label: "changed from" },
];

const PRIORITY_VALUES = ["High", "Medium", "Low"];
const STATUS_VALUES = ["Open", "In Progress", "Closed"];

const ACTION_TYPE_OPTIONS = [
    { value: "assign", label: "Assign to agent" },
    { value: "tag", label: "Add tag(s)" },
    { value: "notify", label: "Send notification" },
    { value: "change_status", label: "Change status" },
];

function valueOptionsForField(field: string): string[] {
    if (field === "priority") return PRIORITY_VALUES;
    if (field === "status") return STATUS_VALUES;
    return [];
}

function emptyCondition(): TicketConditionClause {
    return { field: "priority", op: "eq", value: "High" };
}

function emptyAction(): TicketAutomationAction {
    return { type: "tag", tags: [] };
}

export default function AutomationRulesSettingsTab() {
    const { data, isLoading, isError, refetch } = useTicketAutomationRules();
    const rules = data?.data?.data || [];
    const { data: agentsData } = useAssignableAgents();
    const agentOptions = ((agentsData?.data || agentsData || []) as any[]).map((a) => ({
        value: a.id,
        label: a.fullname,
    }));

    const createMutation = useCreateTicketAutomationRule();
    const updateMutation = useUpdateTicketAutomationRule();
    const deleteMutation = useDeleteTicketAutomationRule();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [triggerType, setTriggerType] = useState<TicketAutomationTriggerType>("on_create");
    const [priority, setPriority] = useState("100");
    const [conditions, setConditions] = useState<TicketConditionClause[]>([emptyCondition()]);
    const [actions, setActions] = useState<TicketAutomationAction[]>([emptyAction()]);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const resetForm = () => {
        setEditingId(null);
        setName("");
        setTriggerType("on_create");
        setPriority("100");
        setConditions([emptyCondition()]);
        setActions([emptyAction()]);
    };

    const handleEdit = (rule: TicketAutomationRule) => {
        setEditingId(rule.id);
        setName(rule.name);
        setTriggerType(rule.trigger_type);
        setPriority(String(rule.priority));
        setConditions((rule.conditions?.all || []).map((c) => ({ ...c })));
        setActions((rule.actions || []).map((a) => ({ ...a })));
    };

    const updateCondition = (index: number, patch: Partial<TicketConditionClause>) => {
        setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    };

    const updateAction = (index: number, patch: Partial<TicketAutomationAction>) => {
        setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
    };

    const handleSave = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a rule name." });
            return;
        }
        try {
            if (editingId) {
                await updateMutation.mutateAsync({
                    id: editingId,
                    data: {
                        name: name.trim(),
                        trigger_type: triggerType,
                        priority: Number(priority) || 100,
                        conditions: { all: conditions },
                        actions,
                    },
                });
                notify.success("Automation rule updated");
            } else {
                await createMutation.mutateAsync({
                    name: name.trim(),
                    trigger_type: triggerType,
                    priority: Number(priority) || 100,
                    is_enabled: true,
                    conditions: { all: conditions },
                    actions,
                });
                notify.success("Automation rule added");
            }
            resetForm();
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const handleToggleEnabled = async (id: string, is_enabled: boolean) => {
        try {
            await updateMutation.mutateAsync({ id, data: { is_enabled } });
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

    const columns = useMemo<MRT_ColumnDef<TicketAutomationRule>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Name",
            },
            {
                id: "trigger",
                accessorFn: (row) =>
                    row.trigger_type === "on_create" ? "On Create" : "On Update",
                header: "Trigger",
            },
            {
                accessorKey: "priority",
                header: "Priority",
            },
            {
                id: "enabled",
                accessorFn: (row) => (row.is_enabled ? "Yes" : "No"),
                header: "Enabled",
                Cell: ({ row }) => (
                    <Switch
                        checked={row.original.is_enabled}
                        onChange={(e) => handleToggleEnabled(row.original.id, e.target.checked)}
                        size="small"
                    />
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <p className="text-sm text-gray-500 max-w-2xl">
                Automatically assign, tag, notify, or change the status of tickets when they&apos;re
                created or updated and match the conditions below. Every enabled matching rule runs, in
                priority order (lower number = runs first).
            </p>

            <div className="rounded-xl border border-gray-200 p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Rule name</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            placeholder="e.g. Escalate high priority"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Trigger</label>
                        <AppSelect
                            isBgWhite
                            fullWidth
                            value={triggerType}
                            options={TRIGGER_OPTIONS}
                            onChange={(e) => setTriggerType(e.target.value as TicketAutomationTriggerType)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-500">Priority (lower runs first)</label>
                        <AppInput
                            isBgWhite
                            fullWidth
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Conditions (all must match)</label>
                    {conditions.map((condition, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                            <AppSelect
                                isBgWhite
                                value={condition.field}
                                options={FIELD_OPTIONS}
                                onChange={(e) =>
                                    updateCondition(index, {
                                        field: e.target.value as string,
                                        value: valueOptionsForField(e.target.value as string)[0] || "",
                                    })
                                }
                            />
                            <AppSelect
                                isBgWhite
                                value={condition.op}
                                options={OP_OPTIONS}
                                onChange={(e) => updateCondition(index, { op: e.target.value as TicketConditionOp })}
                            />
                            <AppSelect
                                isBgWhite
                                value={condition.value}
                                options={valueOptionsForField(condition.field).map((v) => ({ value: v, label: v }))}
                                onChange={(e) => updateCondition(index, { value: e.target.value as string })}
                            />
                            <button
                                onClick={() => setConditions((prev) => prev.filter((_, i) => i !== index))}
                                className="text-gray-400 hover:text-red-600"
                                aria-label="Remove condition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setConditions((prev) => [...prev, emptyCondition()])}
                        className="text-xs font-medium text-[#5479EE] hover:underline"
                    >
                        + Add condition
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">Actions (run in order)</label>
                    {actions.map((action, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                            <AppSelect
                                isBgWhite
                                value={action.type}
                                options={ACTION_TYPE_OPTIONS}
                                onChange={(e) => updateAction(index, { type: e.target.value as TicketAutomationAction["type"] })}
                            />
                            {action.type === "assign" && (
                                <AppSelect
                                    isBgWhite
                                    placeholder="Select agent"
                                    value={action.assigned_agent_id || ""}
                                    options={agentOptions}
                                    onChange={(e) => updateAction(index, { assigned_agent_id: e.target.value as string })}
                                />
                            )}
                            {action.type === "tag" && (
                                <AppInput
                                    isBgWhite
                                    placeholder="tag1, tag2"
                                    value={(action.tags || []).join(", ")}
                                    onChange={(e) =>
                                        updateAction(index, {
                                            tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                        })
                                    }
                                />
                            )}
                            {action.type === "notify" && (
                                <>
                                    <AppInput
                                        isBgWhite
                                        placeholder="Notification title"
                                        value={action.title || ""}
                                        onChange={(e) => updateAction(index, { title: e.target.value })}
                                    />
                                    <AppInput
                                        isBgWhite
                                        placeholder="Notification description"
                                        value={action.description || ""}
                                        onChange={(e) => updateAction(index, { description: e.target.value })}
                                    />
                                </>
                            )}
                            {action.type === "change_status" && (
                                <AppSelect
                                    isBgWhite
                                    value={action.status || ""}
                                    options={STATUS_VALUES.map((v) => ({ value: v, label: v }))}
                                    onChange={(e) => updateAction(index, { status: e.target.value as string })}
                                />
                            )}
                            <button
                                onClick={() => setActions((prev) => prev.filter((_, i) => i !== index))}
                                className="text-gray-400 hover:text-red-600"
                                aria-label="Remove action"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => setActions((prev) => [...prev, emptyAction()])}
                        className="text-xs font-medium text-[#5479EE] hover:underline"
                    >
                        + Add action
                    </button>
                </div>

                <div className="flex justify-end gap-2">
                    {editingId && (
                        <AppButton variantStyle="outline" onClick={resetForm}>
                            Cancel
                        </AppButton>
                    )}
                    <AppButton
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        startIcon={editingId ? undefined : <Plus size={16} />}
                    >
                        {editingId ? "Save Changes" : "Add Rule"}
                    </AppButton>
                </div>
            </div>

            <SuperTable<TicketAutomationRule>
                tableId="ticket-automation-rules-table"
                columns={columns}
                data={rules}
                isLoading={isLoading}
                isError={isError}
                errorMessage="Failed to load automation rules. Please try again."
                onRetry={() => refetch()}
                renderRowActions={({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(row.original)}
                            className="text-gray-300 hover:text-gray-700"
                            aria-label="Edit rule"
                        >
                            <Pencil size={16} />
                        </button>
                        <button
                            onClick={() => setDeleteTarget({ id: row.original.id, name: row.original.name })}
                            className="text-gray-300 hover:text-red-500"
                            aria-label="Delete rule"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
                renderEmptyState={() => (
                    <EmptyState
                        icon={Zap}
                        title="No automation rules configured yet"
                        description="Rules you add run automatically when tickets are created or updated."
                    />
                )}
                features={{ columnFilters: false }}
            />

            <ConfirmationPopup
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    try {
                        await deleteMutation.mutateAsync(deleteTarget.id);
                        notify.success("Automation rule removed");
                        setDeleteTarget(null);
                    } catch (error: any) {
                        notify.error("Error", { description: error.message });
                    }
                }}
                title="Delete Automation Rule"
                description={`Are you sure you want to delete "${deleteTarget?.name ?? ""}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
