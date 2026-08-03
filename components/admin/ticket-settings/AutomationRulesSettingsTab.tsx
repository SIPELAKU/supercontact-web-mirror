"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Switch } from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import { notify } from "@/lib/notifications";
import {
    useTicketAutomationRules,
    useCreateTicketAutomationRule,
    useUpdateTicketAutomationRule,
    useDeleteTicketAutomationRule,
} from "@/lib/hooks/useTicketAutomationRules";
import { useAssignableAgents } from "@/lib/hooks/useTickets";
import {
    TicketAutomationAction,
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
    const { data, isLoading } = useTicketAutomationRules();
    const rules = data?.data?.data || [];
    const { data: agentsData } = useAssignableAgents();
    const agentOptions = ((agentsData?.data || agentsData || []) as any[]).map((a) => ({
        value: a.id,
        label: a.fullname,
    }));

    const createMutation = useCreateTicketAutomationRule();
    const updateMutation = useUpdateTicketAutomationRule();
    const deleteMutation = useDeleteTicketAutomationRule();

    const [name, setName] = useState("");
    const [triggerType, setTriggerType] = useState<TicketAutomationTriggerType>("on_create");
    const [priority, setPriority] = useState("100");
    const [conditions, setConditions] = useState<TicketConditionClause[]>([emptyCondition()]);
    const [actions, setActions] = useState<TicketAutomationAction[]>([emptyAction()]);

    const resetForm = () => {
        setName("");
        setTriggerType("on_create");
        setPriority("100");
        setConditions([emptyCondition()]);
        setActions([emptyAction()]);
    };

    const updateCondition = (index: number, patch: Partial<TicketConditionClause>) => {
        setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    };

    const updateAction = (index: number, patch: Partial<TicketAutomationAction>) => {
        setActions((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
    };

    const handleCreate = async () => {
        if (!name.trim()) {
            notify.warning("Validation Error", { description: "Please enter a rule name." });
            return;
        }
        try {
            await createMutation.mutateAsync({
                name: name.trim(),
                trigger_type: triggerType,
                priority: Number(priority) || 100,
                is_enabled: true,
                conditions: { all: conditions },
                actions,
            });
            notify.success("Automation rule added");
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

    const handleDelete = async (id: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            notify.success("Automation rule removed");
        } catch (error: any) {
            notify.error("Error", { description: error.message });
        }
    };

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

                <div className="flex justify-end">
                    <AppButton onClick={handleCreate} disabled={createMutation.isPending} startIcon={<Plus size={16} />}>
                        Add Rule
                    </AppButton>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                    <TableHead>
                        <TableRow className="bg-[#EEF2FD]!">
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Trigger</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Priority</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600 }}>Enabled</TableCell>
                            <TableCell sx={{ color: "#6B7280", fontWeight: 600, textAlign: "right" }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : rules.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <p className="text-gray-500">No automation rules configured yet.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rules.map((rule) => (
                                <TableRow key={rule.id} hover>
                                    <TableCell>{rule.name}</TableCell>
                                    <TableCell>
                                        {rule.trigger_type === "on_create" ? "On Create" : "On Update"}
                                    </TableCell>
                                    <TableCell>{rule.priority}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={rule.is_enabled}
                                            onChange={(e) => handleToggleEnabled(rule.id, e.target.checked)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <button
                                            onClick={() => handleDelete(rule.id)}
                                            className="text-gray-300 hover:text-red-500"
                                            aria-label="Delete rule"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
