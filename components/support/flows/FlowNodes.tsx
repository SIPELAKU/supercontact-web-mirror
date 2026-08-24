"use client";

// components/support/flows/FlowNodes.tsx
// Custom xyflow node cards for the Flow Studio (brand #5479EE, Tailwind).
// Eight contract types (trigger / send_message / condition / handoff /
// kb_answer / menu / ticket_action / delay) plus a fallback card so a graph
// containing node types this build doesn't know (e.g. from a newer backend)
// still renders and round-trips.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
    BookOpen,
    Clock,
    HelpCircle,
    List,
    MessageSquareText,
    Play,
    Split,
    Ticket,
    UserRound,
} from "lucide-react";
import { useConversationQueues } from "@/lib/hooks/useAgents";
import type { StudioNode } from "./flowGraph";

const BRAND = "#5479EE";

const HANDLE_CLASS =
    "!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-[#5479EE] shadow";

function CardShell({
    selected,
    accentClass,
    icon,
    title,
    subtitle,
    children,
}: {
    selected?: boolean;
    accentClass: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}) {
    return (
        <div
            className={`w-56 rounded-xl border bg-white shadow-sm transition-shadow ${
                selected ? "border-[#5479EE] ring-2 ring-[#5479EE]/25 shadow-md" : "border-gray-200"
            }`}
        >
            <div className="flex items-center gap-2 px-3 pt-2.5">
                <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${accentClass}`}
                >
                    {icon}
                </span>
                <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-gray-800">{title}</div>
                    <div className="text-[10px] uppercase tracking-wide text-gray-400">{subtitle}</div>
                </div>
            </div>
            {children}
        </div>
    );
}

const TriggerNode = memo(({ selected }: NodeProps<StudioNode>) => (
    <CardShell
        selected={selected}
        accentClass="bg-[#5479EE] text-white"
        icon={<Play size={14} fill="currentColor" />}
        title="Trigger"
        subtitle="Flow start"
    >
        <p className="px-3 pb-2.5 pt-1.5 text-xs text-gray-500">
            Starts when the flow&apos;s trigger matches an inbound message.
        </p>
        <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </CardShell>
));
TriggerNode.displayName = "TriggerNode";

const SendMessageNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const text = typeof data?.text === "string" ? data.text : "";
    return (
        <CardShell
            selected={selected}
            accentClass="bg-[#5479EE]/10 text-[#5479EE]"
            icon={<MessageSquareText size={14} />}
            title="Send Message"
            subtitle="Reply"
        >
            <div className="px-3 pb-2.5 pt-1.5">
                {text ? (
                    <p className="line-clamp-3 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-600">
                        {text}
                    </p>
                ) : (
                    <p className="text-xs italic text-gray-400">No message yet - set it in the panel.</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
        </CardShell>
    );
});
SendMessageNode.displayName = "SendMessageNode";

const CONDITION_KIND_LABEL: Record<string, string> = {
    keyword: "Keyword match",
    business_hours: "Business hours",
    channel: "Channel",
};

const ConditionNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const kind = typeof data?.kind === "string" ? data.kind : "keyword";
    const keywords = Array.isArray(data?.keywords) ? (data.keywords as string[]) : [];
    return (
        <CardShell
            selected={selected}
            accentClass="bg-amber-100 text-amber-600"
            icon={<Split size={14} />}
            title="Condition"
            subtitle={CONDITION_KIND_LABEL[kind] ?? kind}
        >
            <div className="px-3 pt-1.5 text-xs text-gray-600">
                {kind === "keyword" ? (
                    keywords.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {keywords.slice(0, 4).map((kw) => (
                                <span
                                    key={kw}
                                    className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600"
                                >
                                    {kw}
                                </span>
                            ))}
                            {keywords.length > 4 && (
                                <span className="text-[10px] text-gray-400">+{keywords.length - 4}</span>
                            )}
                        </div>
                    ) : (
                        <p className="italic text-gray-400">No keywords yet.</p>
                    )
                ) : kind === "business_hours" ? (
                    <p>Within business hours?</p>
                ) : (
                    <p>Match on conversation channel</p>
                )}
            </div>
            <div className="mt-1.5 flex justify-between border-t border-gray-100 px-4 pb-2 pt-1 text-[10px] font-semibold">
                <span className="text-green-700">Ya</span>
                <span className="text-red-600">Tidak</span>
            </div>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            <Handle
                id="yes"
                type="source"
                position={Position.Bottom}
                style={{ left: "25%" }}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-green-600 shadow"
            />
            <Handle
                id="no"
                type="source"
                position={Position.Bottom}
                style={{ left: "75%" }}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-red-500 shadow"
            />
        </CardShell>
    );
});
ConditionNode.displayName = "ConditionNode";

const HandoffNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    // Deduped by TanStack Query across every handoff node + the properties
    // panel; if the viewer can't list queues we fall back to the raw id.
    const { data: queues } = useConversationQueues(true);
    const queueId = typeof data?.queue_id === "string" ? data.queue_id : null;
    const queueName = queueId
        ? queues?.find((q) => q.id === queueId)?.name ?? `${queueId.slice(0, 8)}…`
        : null;
    const note = typeof data?.note === "string" ? data.note : "";
    return (
        <CardShell
            selected={selected}
            accentClass="bg-emerald-100 text-emerald-600"
            icon={<UserRound size={14} />}
            title="Handoff"
            subtitle="To human"
        >
            <div className="space-y-1 px-3 pb-2.5 pt-1.5 text-xs text-gray-600">
                <p>
                    Queue:{" "}
                    <span className="font-medium text-gray-800">{queueName ?? "Default (unassigned)"}</span>
                </p>
                {note && <p className="line-clamp-2 italic text-gray-400">{note}</p>}
            </div>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
        </CardShell>
    );
});
HandoffNode.displayName = "HandoffNode";

const KbAnswerNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const grounding = data?.grounding === "internal" ? "internal" : "public";
    const maxArticles = typeof data?.max_articles === "number" ? data.max_articles : null;
    const minConfidence = typeof data?.min_confidence === "number" ? data.min_confidence : null;
    return (
        <CardShell
            selected={selected}
            accentClass="bg-violet-100 text-violet-600"
            icon={<BookOpen size={14} />}
            title="KB Answer"
            subtitle="Knowledge base"
        >
            <div className="space-y-1.5 px-3 pt-1.5 text-xs text-gray-600">
                <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        grounding === "internal"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                    }`}
                >
                    {grounding === "internal" ? "Internal" : "Publik"}
                </span>
                <p className="text-[11px] text-gray-500">
                    {maxArticles !== null ? `Maks ${maxArticles} artikel` : "Maks artikel default"}
                    {minConfidence !== null ? ` · min. keyakinan ${minConfidence}` : ""}
                </p>
            </div>
            <div className="mt-1.5 flex justify-between border-t border-gray-100 px-4 pb-2 pt-1 text-[10px] font-semibold">
                <span className="text-green-700">Ketemu</span>
                <span className="text-red-600">Tidak</span>
            </div>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            <Handle
                id="found"
                type="source"
                position={Position.Bottom}
                style={{ left: "25%" }}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-green-600 shadow"
            />
            <Handle
                id="not_found"
                type="source"
                position={Position.Bottom}
                style={{ left: "75%" }}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-red-500 shadow"
            />
        </CardShell>
    );
});
KbAnswerNode.displayName = "KbAnswerNode";

const MenuNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const prompt = typeof data?.prompt === "string" ? data.prompt : "";
    const options = Array.isArray(data?.options) ? data.options : [];
    return (
        <CardShell
            selected={selected}
            accentClass="bg-sky-100 text-sky-600"
            icon={<List size={14} />}
            title="Menu"
            subtitle="Quick reply"
        >
            <div className="space-y-1.5 px-3 pb-2.5 pt-1.5">
                {prompt ? (
                    <p className="line-clamp-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-2 py-1.5 text-xs text-gray-600">
                        {prompt}
                    </p>
                ) : (
                    <p className="text-xs italic text-gray-400">No prompt yet - set it in the panel.</p>
                )}
                <p className="text-[11px] text-gray-500">
                    {options.length} opsi · balasan pelanggan dirutekan per opsi
                </p>
            </div>
            {/* One SOURCE handle per option (id = the option key), mirroring
                condition's yes/no handles. Without these the node has nothing
                to drag from and a guided tree cannot be drawn at all; their
                ids are also what lets a saved edge re-attach to the right
                option when the graph is loaded. */}
            {options.length > 0 && (
                <div className="flex justify-around border-t border-gray-100 px-2 pb-2 pt-1 text-[10px] font-semibold text-sky-700">
                    {options.map((option) => (
                        <span key={option.key} className="truncate px-0.5" title={option.label}>
                            {option.key}
                        </span>
                    ))}
                </div>
            )}
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            {options.map((option, index) => (
                <Handle
                    key={option.key}
                    id={option.key}
                    type="source"
                    position={Position.Bottom}
                    style={{ left: `${((index + 0.5) / options.length) * 100}%` }}
                    className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-white !bg-sky-500 shadow"
                />
            ))}
        </CardShell>
    );
});
MenuNode.displayName = "MenuNode";

const TICKET_ACTION_LABEL: Record<string, string> = {
    create_ticket: "Create ticket",
    set_priority: "Set priority",
    add_tag: "Add tag",
};

const TicketActionNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const action = typeof data?.action === "string" ? data.action : "create_ticket";
    const priority = typeof data?.priority === "string" ? data.priority : "";
    const tag = typeof data?.tag === "string" ? data.tag : "";
    return (
        <CardShell
            selected={selected}
            accentClass="bg-orange-100 text-orange-600"
            icon={<Ticket size={14} />}
            title="Ticket Action"
            subtitle={TICKET_ACTION_LABEL[action] ?? action}
        >
            <div className="px-3 pb-2.5 pt-1.5 text-xs text-gray-600">
                {action === "set_priority" ? (
                    <p>
                        Prioritas:{" "}
                        <span className="font-medium text-gray-800">{priority || "Medium"}</span>
                    </p>
                ) : action === "add_tag" ? (
                    tag ? (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {tag}
                        </span>
                    ) : (
                        <p className="italic text-gray-400">No tag yet - set it in the panel.</p>
                    )
                ) : (
                    <p>Buat tiket dari percakapan ini.</p>
                )}
            </div>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
        </CardShell>
    );
});
TicketActionNode.displayName = "TicketActionNode";

/** delay: pauses the run, then continues after the configured wait. */
const DelayNode = memo(({ data, selected }: NodeProps<StudioNode>) => {
    const raw = Number(data?.minutes);
    const minutes = Number.isFinite(raw) ? Math.round(raw) : 15;
    const label =
        minutes >= 60
            ? `${Math.floor(minutes / 60)} jam${minutes % 60 ? ` ${minutes % 60} mnt` : ""}`
            : `${minutes} menit`;
    return (
        <CardShell
            selected={selected}
            accentClass="bg-slate-100 text-slate-600"
            icon={<Clock size={14} />}
            title="Delay"
            subtitle={`Tunggu ${label}`}
        >
            <p className="px-3 pb-2.5 pt-1.5 text-xs text-gray-600">
                Alur berhenti di sini, lalu lanjut otomatis setelah {label}.
            </p>
            <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
            <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
        </CardShell>
    );
});
DelayNode.displayName = "DelayNode";

/** Renders any node type this build doesn't recognize (forward compat). */
const FallbackNode = memo(({ type, selected }: NodeProps<StudioNode>) => (
    <CardShell
        selected={selected}
        accentClass="bg-gray-100 text-gray-500"
        icon={<HelpCircle size={14} />}
        title={type ?? "Unknown"}
        subtitle="Unsupported node"
    >
        <p className="px-3 pb-2.5 pt-1.5 text-xs text-gray-500">
            This node type isn&apos;t editable in this version of the studio. It is preserved as-is
            when you save.
        </p>
        <Handle type="target" position={Position.Top} className={HANDLE_CLASS} />
        <Handle type="source" position={Position.Bottom} className={HANDLE_CLASS} />
    </CardShell>
));
FallbackNode.displayName = "FallbackNode";

export const CORE_NODE_TYPES = {
    trigger: TriggerNode,
    send_message: SendMessageNode,
    condition: ConditionNode,
    handoff: HandoffNode,
    kb_answer: KbAnswerNode,
    menu: MenuNode,
    ticket_action: TicketActionNode,
    delay: DelayNode,
};

export { FallbackNode };

/** MiniMap tinting per node type. */
export function miniMapNodeColor(node: { type?: string }): string {
    switch (node.type) {
        case "trigger":
            return BRAND;
        case "condition":
            return "#f59e0b";
        case "handoff":
            return "#10b981";
        case "send_message":
            return "#93aef5";
        case "kb_answer":
            return "#8b5cf6";
        case "menu":
            return "#0ea5e9";
        case "ticket_action":
            return "#f97316";
        case "delay":
            return "#64748b";
        default:
            return "#cbd5e1";
    }
}
