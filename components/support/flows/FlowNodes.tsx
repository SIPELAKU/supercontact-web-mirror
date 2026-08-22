"use client";

// components/support/flows/FlowNodes.tsx
// Custom xyflow node cards for the Flow Studio (brand #5479EE, Tailwind).
// Four contract types (trigger / send_message / condition / handoff) plus a
// fallback card so a graph containing node types this build doesn't know
// (e.g. from a newer backend) still renders and round-trips.

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { HelpCircle, MessageSquareText, Play, Split, UserRound } from "lucide-react";
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
        default:
            return "#cbd5e1";
    }
}
