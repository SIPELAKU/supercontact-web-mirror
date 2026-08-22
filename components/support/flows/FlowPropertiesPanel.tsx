"use client";

// components/support/flows/FlowPropertiesPanel.tsx
// Right-hand inspector of the Flow Studio: edits the selected node's data
// (or a selected edge's Ya/Tidak branch), and the flow-level trigger config
// when the trigger node is selected. All edits mutate studio-local state;
// nothing is persisted until "Save draft" in the toolbar.

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { AppInput } from "@/components/ui/app-input";
import { useConversationQueues } from "@/lib/hooks/useAgents";
import type {
    ConditionKind,
    FlowEdgeBranch,
    FlowStatus,
    FlowTriggerConfig,
    FlowTriggerType,
    MenuOption,
    TicketActionKind,
    TicketPriority,
} from "@/lib/api/flows";
import {
    BRANCH_LABEL,
    branchesForNodeType,
    type StudioEdge,
    type StudioNode,
    type StudioNodeData,
} from "./flowGraph";

export const TRIGGER_TYPE_OPTIONS: { value: FlowTriggerType; label: string }[] = [
    { value: "inbound_first", label: "First inbound message" },
    { value: "keyword", label: "Keyword match" },
    { value: "off_hours", label: "Outside business hours" },
    { value: "no_agent_online", label: "No agent online" },
];

const CONDITION_KIND_OPTIONS: { value: ConditionKind; label: string }[] = [
    { value: "keyword", label: "Keyword match" },
    { value: "business_hours", label: "Within business hours" },
    { value: "channel", label: "Channel" },
];

const TICKET_ACTION_OPTIONS: { value: TicketActionKind; label: string }[] = [
    { value: "create_ticket", label: "Create ticket" },
    { value: "set_priority", label: "Set priority" },
    { value: "add_tag", label: "Add tag" },
];

const TICKET_PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
    { value: "Urgent", label: "Urgent" },
    { value: "High", label: "High" },
    { value: "Medium", label: "Medium" },
    { value: "Low", label: "Low" },
];

const MENU_MIN_OPTIONS = 2;
const MENU_MAX_OPTIONS = 5;

// Mirrors DELAY_MINUTES_RANGE in flow_engine_service.py - the server rejects
// anything outside it, so the editor warns before the save round-trip.
const DELAY_MIN_MINUTES = 1;
const DELAY_MAX_MINUTES = 1440;

const VARIABLE_HINTS = ["{{contact_name}}", "{{company_name}}"];

export const CHANNEL_LABELS: Record<string, string> = {
    whatsapp: "WhatsApp",
    web_widget: "Web widget",
    email: "Email",
    sms: "SMS",
    messenger: "Messenger",
    instagram: "Instagram",
};

// The channels a channel-condition can branch on. Values are the raw channel
// strings the engine compares the inbound channel against. F3 widened this
// from the F1 pair to every channel the engine now runs on.
const CONDITION_CHANNEL_OPTIONS: { value: string; label: string }[] = [
    { value: "whatsapp", label: CHANNEL_LABELS.whatsapp },
    { value: "web_widget", label: CHANNEL_LABELS.web_widget },
    { value: "email", label: CHANNEL_LABELS.email },
    { value: "sms", label: CHANNEL_LABELS.sms },
    { value: "messenger", label: CHANNEL_LABELS.messenger },
    { value: "instagram", label: CHANNEL_LABELS.instagram },
];

/** Chip-style multi-keyword editor (Enter or comma adds, X removes). */
export function KeywordsInput({
    value,
    onChange,
    placeholder,
}: {
    value: string[];
    onChange: (next: string[]) => void;
    placeholder?: string;
}) {
    const [draft, setDraft] = useState("");

    const commit = () => {
        const kw = draft.trim();
        if (!kw) return;
        if (!value.some((v) => v.toLowerCase() === kw.toLowerCase())) {
            onChange([...value, kw]);
        }
        setDraft("");
    };

    return (
        <div>
            {value.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {value.map((kw) => (
                        <span
                            key={kw}
                            className="inline-flex items-center gap-1 rounded-full bg-[#5479EE]/10 px-2.5 py-0.5 text-xs font-medium text-[#3f5fd0]"
                        >
                            {kw}
                            <button
                                type="button"
                                aria-label={`Remove keyword ${kw}`}
                                onClick={() => onChange(value.filter((v) => v !== kw))}
                                className="text-[#3f5fd0]/60 hover:text-[#3f5fd0]"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            <AppInput
                isBgWhite
                fullWidth
                placeholder={placeholder ?? "Type a keyword, press Enter"}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        commit();
                    }
                }}
                onBlur={commit}
            />
        </div>
    );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h3>
            {children}
        </div>
    );
}

interface FlowPropertiesPanelProps {
    selectedNode: StudioNode | null;
    selectedEdge: StudioEdge | null;
    /** Type of the selected edge's source node (condition/kb_answer/menu enable the branch picker). */
    selectedEdgeSourceType: string | null;
    /** Data of that source node - a menu's option keys ARE its branch vocabulary. */
    selectedEdgeSourceData?: StudioNodeData | null;
    triggerConfig: FlowTriggerConfig;
    channelScope: string[];
    status: FlowStatus;
    onTriggerConfigChange: (config: FlowTriggerConfig) => void;
    onNodeDataChange: (nodeId: string, patch: Partial<StudioNodeData>) => void;
    onEdgeBranchChange: (edgeId: string, branch: FlowEdgeBranch) => void;
    onDeleteNode: (nodeId: string) => void;
    onDeleteEdge: (edgeId: string) => void;
}

export default function FlowPropertiesPanel({
    selectedNode,
    selectedEdge,
    selectedEdgeSourceType,
    selectedEdgeSourceData,
    triggerConfig,
    channelScope,
    status,
    onTriggerConfigChange,
    onNodeDataChange,
    onEdgeBranchChange,
    onDeleteNode,
    onDeleteEdge,
}: FlowPropertiesPanelProps) {
    const { data: queues, isError: queuesError } = useConversationQueues(false);

    // ---- Edge selected -----------------------------------------------------
    if (!selectedNode && selectedEdge) {
        const branch = selectedEdge.data?.branch;
        // Branching sources expose their branch vocabulary as a picker:
        // condition -> yes/no, kb_answer -> found/not_found (first entry is
        // the "positive" branch, green; second is the negative, red), and
        // menu -> its own option keys, which have no polarity.
        const isMenuSource = selectedEdgeSourceType === "menu";
        const branchChoices = branchesForNodeType(
            selectedEdgeSourceType ?? undefined,
            selectedEdgeSourceData ?? undefined
        );
        const menuOptions = Array.isArray(selectedEdgeSourceData?.options)
            ? selectedEdgeSourceData!.options!
            : [];
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Connection">
                    {branchChoices.length > 0 ? (
                        <>
                            <p className="text-sm text-gray-600">
                                {isMenuSource
                                    ? "Which menu option does this connection follow?"
                                    : selectedEdgeSourceType === "kb_answer"
                                      ? "Which outcome of the KB answer does this connection follow?"
                                      : "Which branch of the condition does this connection follow?"}
                            </p>
                            <div className={isMenuSource ? "flex flex-col gap-2" : "flex gap-2"}>
                                {branchChoices.map((b, index) => {
                                    const active = branch === b;
                                    const menuLabel = menuOptions.find(
                                        (o) => o && o.key === b
                                    )?.label;
                                    return (
                                        <button
                                            key={b}
                                            type="button"
                                            onClick={() => onEdgeBranchChange(selectedEdge.id, b)}
                                            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                                                active
                                                    ? isMenuSource
                                                        ? "border-[#5479EE] bg-[#5479EE]/10 text-[#3f5fd0]"
                                                        : index === 0
                                                          ? "border-green-600 bg-green-50 text-green-700"
                                                          : "border-red-500 bg-red-50 text-red-600"
                                                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {isMenuSource
                                                ? `${b}${menuLabel ? ` · ${menuLabel}` : ""}`
                                                : BRANCH_LABEL[b]}
                                        </button>
                                    );
                                })}
                            </div>
                            {isMenuSource && (
                                <p className="text-xs text-gray-400">
                                    Balasan pelanggan dicocokkan ke kunci opsi ini. Opsi tanpa
                                    koneksi berarti percakapan selesai di situ.
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-600">
                            A simple connection - the flow continues along it unconditionally.
                        </p>
                    )}
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteEdge(selectedEdge.id)}
                >
                    Delete connection
                </AppButton>
            </div>
        );
    }

    // ---- Nothing selected --------------------------------------------------
    if (!selectedNode) {
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Flow">
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            Channels:{" "}
                            <span className="font-medium text-gray-800">
                                {channelScope.length > 0
                                    ? channelScope.map((c) => CHANNEL_LABELS[c] ?? c).join(", ")
                                    : "None"}
                            </span>
                        </p>
                        <p>
                            Status: <span className="font-medium text-gray-800">{status}</span>
                        </p>
                    </div>
                </PanelSection>
                <PanelSection title="Tips">
                    <ul className="list-disc space-y-1.5 pl-4 text-xs text-gray-500">
                        <li>Select a node or connection to edit it here.</li>
                        <li>Drag from the left palette (or click an item) to add a step.</li>
                        <li>Connect nodes by dragging between their round handles.</li>
                        <li>Press Delete to remove the selected node or connection.</li>
                    </ul>
                </PanelSection>
            </div>
        );
    }

    const data = selectedNode.data ?? {};

    // ---- Trigger node: edits flow-level trigger_config --------------------
    if (selectedNode.type === "trigger") {
        const keywords = Array.isArray(triggerConfig.keywords) ? triggerConfig.keywords : [];
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Trigger">
                    <p className="text-xs text-gray-500">
                        The trigger decides when this flow starts for an inbound conversation on the
                        flow&apos;s channels.
                    </p>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        label="Trigger type"
                        value={triggerConfig.type ?? "inbound_first"}
                        options={TRIGGER_TYPE_OPTIONS}
                        onChange={(e) =>
                            onTriggerConfigChange({
                                ...triggerConfig,
                                type: e.target.value as FlowTriggerType,
                            })
                        }
                    />
                    {triggerConfig.type === "keyword" && (
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-gray-600">Keywords</p>
                            <KeywordsInput
                                value={keywords}
                                onChange={(next) =>
                                    onTriggerConfigChange({ ...triggerConfig, keywords: next })
                                }
                            />
                        </div>
                    )}
                </PanelSection>
                <p className="text-xs text-gray-400">
                    The trigger node cannot be deleted - every flow starts from it.
                </p>
            </div>
        );
    }

    // ---- Send Message node -------------------------------------------------
    if (selectedNode.type === "send_message") {
        const text = typeof data.text === "string" ? data.text : "";
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Send Message">
                    <AppTextarea
                        isBgWhite
                        fullWidth
                        label="Message text"
                        rows={5}
                        placeholder="Halo {{contact_name}}, terima kasih sudah menghubungi kami!"
                        value={text}
                        onChange={(e) => onNodeDataChange(selectedNode.id, { text: e.target.value })}
                    />
                    <div>
                        <p className="mb-1.5 text-xs text-gray-500">Insert a variable:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {VARIABLE_HINTS.map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    onClick={() =>
                                        onNodeDataChange(selectedNode.id, {
                                            text: text ? `${text} ${v}` : v,
                                        })
                                    }
                                    className="rounded-full border border-[#5479EE]/30 bg-[#5479EE]/5 px-2.5 py-1 font-mono text-[11px] text-[#3f5fd0] hover:bg-[#5479EE]/15"
                                >
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- Condition node ----------------------------------------------------
    if (selectedNode.type === "condition") {
        const kind: ConditionKind =
            data.kind === "business_hours" || data.kind === "channel" ? data.kind : "keyword";
        const keywords = Array.isArray(data.keywords) ? (data.keywords as string[]) : [];
        const channels = Array.isArray(data.channels) ? (data.channels as string[]) : [];
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Condition">
                    <AppSelect
                        isBgWhite
                        fullWidth
                        label="Condition type"
                        value={kind}
                        options={CONDITION_KIND_OPTIONS}
                        onChange={(e) =>
                            onNodeDataChange(selectedNode.id, {
                                kind: e.target.value as ConditionKind,
                            })
                        }
                    />
                    {kind === "keyword" && (
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-gray-600">
                                Keywords <span className="font-normal text-gray-400">(match any)</span>
                            </p>
                            <KeywordsInput
                                value={keywords}
                                onChange={(next) =>
                                    onNodeDataChange(selectedNode.id, { keywords: next, match: "any" })
                                }
                            />
                        </div>
                    )}
                    {kind === "channel" && (
                        <div>
                            <p className="mb-1.5 text-sm font-medium text-gray-600">
                                Channels <span className="font-normal text-gray-400">(match any)</span>
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {CONDITION_CHANNEL_OPTIONS.map((option) => {
                                    const selected = channels.includes(option.value);
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() =>
                                                onNodeDataChange(selectedNode.id, {
                                                    channels: selected
                                                        ? channels.filter((c) => c !== option.value)
                                                        : [...channels, option.value],
                                                })
                                            }
                                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                                selected
                                                    ? "border-[#5479EE] bg-[#5479EE]/10 text-[#3f5fd0]"
                                                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">
                                Ya when the conversation is on one of the selected channels. At least
                                one channel is required to publish.
                            </p>
                        </div>
                    )}
                    <p className="text-xs text-gray-500">
                        Connect the <span className="font-semibold text-green-700">Ya</span> handle for
                        when the condition matches, and{" "}
                        <span className="font-semibold text-red-600">Tidak</span> for when it doesn&apos;t.
                    </p>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- Handoff node ------------------------------------------------------
    if (selectedNode.type === "handoff") {
        const queueId = typeof data.queue_id === "string" ? data.queue_id : "";
        const note = typeof data.note === "string" ? data.note : "";
        const queueOptions = [
            { value: "", label: "Default (no specific queue)" },
            ...(queues ?? []).map((q) => ({ value: q.id, label: q.name })),
        ];
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Handoff to human">
                    {queuesError ? (
                        // Queue listing needs omnichannel:use; fall back to a
                        // raw id field so the node stays editable regardless.
                        <AppInput
                            isBgWhite
                            fullWidth
                            label="Queue ID (optional)"
                            placeholder="Paste a conversation-queue UUID"
                            value={queueId}
                            onChange={(e) =>
                                onNodeDataChange(selectedNode.id, {
                                    queue_id: e.target.value.trim() || null,
                                })
                            }
                        />
                    ) : (
                        <AppSelect
                            isBgWhite
                            fullWidth
                            label="Assign to queue"
                            value={queueId}
                            options={queueOptions}
                            onChange={(e) =>
                                onNodeDataChange(selectedNode.id, {
                                    queue_id: (e.target.value as string) || null,
                                })
                            }
                        />
                    )}
                    <AppTextarea
                        isBgWhite
                        fullWidth
                        label="Note for the agent"
                        rows={3}
                        placeholder="Context the agent should see when they pick this up"
                        value={note}
                        onChange={(e) => onNodeDataChange(selectedNode.id, { note: e.target.value })}
                    />
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- KB Answer node ----------------------------------------------------
    if (selectedNode.type === "kb_answer") {
        const grounding = data.grounding === "internal" ? "internal" : "public";
        const maxArticles = typeof data.max_articles === "number" ? data.max_articles : null;
        const minConfidence = typeof data.min_confidence === "number" ? data.min_confidence : null;
        const fallbackText = typeof data.fallback_text === "string" ? data.fallback_text : "";
        // Backend rule: a flow scoped to web_widget may only ground on PUBLIC
        // articles (visitors must never see internal-only content).
        const widgetScoped = channelScope.includes("web_widget");
        const groundingOptions = [
            { value: "public", label: "Publik (artikel publik saja)" },
            {
                value: "internal",
                label: "Internal (semua artikel published)",
                disabled: widgetScoped,
            },
        ];
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="KB Answer">
                    <p className="text-xs text-gray-500">
                        Answers from the knowledge base. Follow the{" "}
                        <span className="font-semibold text-green-700">Ketemu</span> handle when an
                        article is found, and <span className="font-semibold text-red-600">Tidak</span>{" "}
                        when nothing relevant is found.
                    </p>
                    <AppSelect
                        isBgWhite
                        fullWidth
                        label="Grounding"
                        value={grounding}
                        options={groundingOptions}
                        onChange={(e) =>
                            onNodeDataChange(selectedNode.id, {
                                grounding: e.target.value === "internal" ? "internal" : "public",
                            })
                        }
                    />
                    {widgetScoped && (
                        <p className="text-xs text-gray-500">
                            Flow ini mencakup channel <span className="font-medium">Web widget</span>,
                            jadi grounding wajib <span className="font-medium">Publik</span> - pengunjung
                            widget tidak boleh melihat artikel internal.
                        </p>
                    )}
                    {widgetScoped && grounding === "internal" && (
                        <p className="text-xs font-medium text-amber-600">
                            Grounding saat ini &quot;Internal&quot; tetapi flow mencakup Web widget - publish
                            akan ditolak. Ubah ke Publik.
                        </p>
                    )}
                    <AppInput
                        isBgWhite
                        fullWidth
                        type="number"
                        label="Max articles (1-5)"
                        inputProps={{ min: 1, max: 5, step: 1 }}
                        value={maxArticles ?? ""}
                        onChange={(e) => {
                            const raw = e.target.value;
                            onNodeDataChange(selectedNode.id, {
                                max_articles: raw === "" ? undefined : Number(raw),
                            });
                        }}
                    />
                    <AppInput
                        isBgWhite
                        fullWidth
                        type="number"
                        label="Min confidence (0-1)"
                        inputProps={{ min: 0, max: 1, step: 0.05 }}
                        value={minConfidence ?? ""}
                        onChange={(e) => {
                            const raw = e.target.value;
                            onNodeDataChange(selectedNode.id, {
                                min_confidence: raw === "" ? undefined : Number(raw),
                            });
                        }}
                    />
                    <AppTextarea
                        isBgWhite
                        fullWidth
                        label="Fallback text"
                        rows={3}
                        placeholder="Maaf, kami belum menemukan jawabannya. Tim kami akan segera membantu."
                        value={fallbackText}
                        onChange={(e) =>
                            onNodeDataChange(selectedNode.id, { fallback_text: e.target.value })
                        }
                    />
                    <p className="text-xs text-gray-500">
                        Fallback text dikirim ketika tidak ada artikel yang cukup relevan (cabang
                        Tidak).
                    </p>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- Menu / Quick Reply node -------------------------------------------
    if (selectedNode.type === "menu") {
        const prompt = typeof data.prompt === "string" ? data.prompt : "";
        const options: MenuOption[] = Array.isArray(data.options)
            ? (data.options as MenuOption[]).map((o) => ({
                  key: String(o?.key ?? ""),
                  label: String(o?.label ?? ""),
              }))
            : [];

        const setOptions = (next: MenuOption[]) =>
            onNodeDataChange(selectedNode.id, { options: next });

        const addOption = () => {
            if (options.length >= MENU_MAX_OPTIONS) return;
            // Auto-key: the first unused number 1..5.
            const used = new Set(options.map((o) => o.key.trim()));
            let key = String(options.length + 1);
            for (let i = 1; i <= MENU_MAX_OPTIONS; i += 1) {
                if (!used.has(String(i))) {
                    key = String(i);
                    break;
                }
            }
            setOptions([...options, { key, label: "" }]);
        };

        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Menu / Quick reply">
                    <AppTextarea
                        isBgWhite
                        fullWidth
                        label="Prompt"
                        rows={3}
                        placeholder="Silakan pilih topik bantuan:"
                        value={prompt}
                        onChange={(e) => onNodeDataChange(selectedNode.id, { prompt: e.target.value })}
                    />
                    <div>
                        <p className="mb-1.5 text-sm font-medium text-gray-600">
                            Options{" "}
                            <span className="font-normal text-gray-400">
                                ({MENU_MIN_OPTIONS}-{MENU_MAX_OPTIONS})
                            </span>
                        </p>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-14 shrink-0">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            aria-label={`Option ${index + 1} key`}
                                            placeholder="1"
                                            value={option.key}
                                            onChange={(e) =>
                                                setOptions(
                                                    options.map((o, i) =>
                                                        i === index ? { ...o, key: e.target.value } : o
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <AppInput
                                            isBgWhite
                                            fullWidth
                                            aria-label={`Option ${index + 1} label`}
                                            placeholder="Label opsi"
                                            value={option.label}
                                            onChange={(e) =>
                                                setOptions(
                                                    options.map((o, i) =>
                                                        i === index ? { ...o, label: e.target.value } : o
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        aria-label={`Remove option ${index + 1}`}
                                        disabled={options.length <= MENU_MIN_OPTIONS}
                                        onClick={() => setOptions(options.filter((_, i) => i !== index))}
                                        className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-2">
                            <AppButton
                                variantStyle="outline"
                                size="small"
                                startIcon={<Plus size={14} />}
                                disabled={options.length >= MENU_MAX_OPTIONS}
                                onClick={addOption}
                            >
                                Add option
                            </AppButton>
                        </div>
                    </div>
                    <div className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
                        Setelah prompt + opsi terkirim, run{" "}
                        <span className="font-semibold">menunggu balasan</span> pelanggan, lalu
                        dirutekan lewat koneksi milik opsi yang dipilih. Tarik garis dari titik
                        biru di bawah kartu (satu per opsi) ke langkah berikutnya. Opsi tanpa
                        koneksi berarti percakapan selesai di situ. Balasan yang tidak dikenali
                        dikirimi ulang menu satu kali; kalau tetap tidak cocok, run berhenti.
                    </div>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- Ticket Action node ------------------------------------------------
    if (selectedNode.type === "ticket_action") {
        const action: TicketActionKind =
            data.action === "set_priority" || data.action === "add_tag"
                ? data.action
                : "create_ticket";
        const priority: TicketPriority =
            data.priority === "Urgent" || data.priority === "High" || data.priority === "Low"
                ? data.priority
                : "Medium";
        const tag = typeof data.tag === "string" ? data.tag : "";
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Ticket Action">
                    <AppSelect
                        isBgWhite
                        fullWidth
                        label="Action"
                        value={action}
                        options={TICKET_ACTION_OPTIONS}
                        onChange={(e) =>
                            onNodeDataChange(selectedNode.id, {
                                action: e.target.value as TicketActionKind,
                            })
                        }
                    />
                    {action === "set_priority" && (
                        <AppSelect
                            isBgWhite
                            fullWidth
                            label="Priority"
                            value={priority}
                            options={TICKET_PRIORITY_OPTIONS}
                            onChange={(e) =>
                                onNodeDataChange(selectedNode.id, {
                                    priority: e.target.value as TicketPriority,
                                })
                            }
                        />
                    )}
                    {action === "add_tag" && (
                        <AppInput
                            isBgWhite
                            fullWidth
                            label="Tag"
                            placeholder="mis. vip, komplain, follow-up"
                            value={tag}
                            onChange={(e) =>
                                onNodeDataChange(selectedNode.id, { tag: e.target.value })
                            }
                        />
                    )}
                    <p className="text-xs text-gray-500">
                        {action === "create_ticket"
                            ? "Membuat tiket dari percakapan ini, lalu lanjut ke langkah berikutnya."
                            : action === "set_priority"
                              ? "Mengubah prioritas tiket percakapan ini, lalu lanjut ke langkah berikutnya."
                              : "Menambahkan tag ke tiket percakapan ini, lalu lanjut ke langkah berikutnya."}
                    </p>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    if (selectedNode.type === "delay") {
        const rawMinutes = Number(data.minutes);
        const minutes = Number.isFinite(rawMinutes) ? Math.round(rawMinutes) : 15;
        return (
            <div className="space-y-6 p-4">
                <PanelSection title="Delay">
                    <AppInput
                        isBgWhite
                        fullWidth
                        type="number"
                        label="Wait (minutes)"
                        value={String(minutes)}
                        onChange={(e) => {
                            const raw = e.target.value.trim();
                            // Number("") is 0, which would quietly save an
                            // out-of-range delay the server then rejects.
                            const next = raw === "" ? NaN : Number(raw);
                            onNodeDataChange(selectedNode.id, {
                                minutes: Number.isFinite(next)
                                    ? Math.max(
                                          DELAY_MIN_MINUTES,
                                          Math.min(DELAY_MAX_MINUTES, Math.round(next))
                                      )
                                    : DELAY_MIN_MINUTES,
                            });
                        }}
                    />
                    <p className="text-xs text-gray-400">
                        {DELAY_MIN_MINUTES}–{DELAY_MAX_MINUTES} menit (maks 24 jam). Nilai di
                        luar rentang otomatis disesuaikan.
                    </p>
                    <p className="text-xs text-gray-500">
                        Alur berhenti di node ini, lalu dilanjutkan otomatis setelah waktunya
                        tiba. Saat dilanjutkan, alur akan dibatalkan jika percakapan sudah
                        dipegang agen, akun dikembalikan ke bot bawaan, atau flow ini tidak lagi
                        published — jadi bot tidak pernah menyela.
                    </p>
                    <p className="text-xs text-gray-400">
                        Jatah kirim pesan per-run tetap dihitung lintas delay, tidak di-reset.
                    </p>
                </PanelSection>
                <AppButton
                    variantStyle="danger"
                    fullWidth
                    startIcon={<Trash2 size={14} />}
                    onClick={() => onDeleteNode(selectedNode.id)}
                >
                    Delete node
                </AppButton>
            </div>
        );
    }

    // ---- Unknown node type -------------------------------------------------
    return (
        <div className="space-y-6 p-4">
            <PanelSection title={`Node: ${selectedNode.type ?? "unknown"}`}>
                <p className="text-sm text-gray-600">
                    This node type isn&apos;t editable in this version of the studio. Its configuration is
                    preserved unchanged when you save.
                </p>
            </PanelSection>
            <AppButton
                variantStyle="danger"
                fullWidth
                startIcon={<Trash2 size={14} />}
                onClick={() => onDeleteNode(selectedNode.id)}
            >
                Delete node
            </AppButton>
        </div>
    );
}
