// components/support/flows/flowGraph.ts
// Conversion between the backend graph contract (lib/api/flows.ts FlowGraph -
// the exact shape the engine executes) and @xyflow/react canvas state.
//
// Load direction is defensive (missing/garbled fields never crash the studio);
// save direction is strict (only contract fields are emitted, so xyflow
// internals like selected/measured/dragging/sourceHandle never reach the API).

import type { Edge, Node } from "@xyflow/react";
import type {
    ConditionKind,
    FlowGraph,
    FlowGraphEdge,
    FlowGraphNode,
} from "@/lib/api/flows";

// One loose data bag shared by every node type (union of the per-type contract
// fields). Typed as a type alias (not interface) so it satisfies xyflow v12's
// `Record<string, unknown>` constraint via the implicit index signature.
export type StudioNodeData = {
    // send_message
    text?: string;
    // condition
    kind?: ConditionKind;
    keywords?: string[];
    match?: "any";
    channels?: string[];
    // handoff
    queue_id?: string | null;
    note?: string;
    // unknown node types keep whatever the backend sent
    [key: string]: unknown;
};

export type StudioEdgeData = {
    branch?: "yes" | "no";
    [key: string]: unknown;
};

export type StudioNode = Node<StudioNodeData>;
export type StudioEdge = Edge<StudioEdgeData>;

export const KNOWN_NODE_TYPES = ["trigger", "send_message", "condition", "handoff"] as const;

export const BRANCH_LABEL: Record<"yes" | "no", string> = {
    yes: "Ya",
    no: "Tidak",
};

let idCounter = 0;

/** Collision-safe-enough client-side id for new nodes/edges. */
export function makeGraphId(prefix: string): string {
    idCounter += 1;
    return `${prefix}_${Date.now().toString(36)}_${idCounter}${Math.random().toString(36).slice(2, 6)}`;
}

function toFiniteNumber(value: unknown, fallback: number): number {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/** Default data bag for a node freshly dropped from the palette. */
export function defaultNodeData(type: string): StudioNodeData {
    switch (type) {
        case "send_message":
            return { text: "" };
        case "condition":
            return { kind: "keyword", keywords: [], match: "any" };
        case "handoff":
            return { queue_id: null, note: "" };
        case "trigger":
        default:
            return {};
    }
}

/** Visual styling shared by every edge the studio renders/creates. */
export function edgeDisplayProps(branch?: "yes" | "no"): Partial<StudioEdge> {
    return {
        type: "smoothstep",
        label: branch ? BRANCH_LABEL[branch] : undefined,
        labelStyle: { fontSize: 11, fontWeight: 600, fill: branch === "no" ? "#b91c1c" : "#15803d" },
        labelBgStyle: { fill: "#ffffff", stroke: "#e5e7eb" },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
        style: { strokeWidth: 1.5, stroke: "#94a3b8" },
    };
}

/**
 * API graph -> xyflow state. Tolerates null/partial graphs: rows without an
 * id are dropped, positions are coerced to finite numbers, data defaults to
 * {}. Branch info is mirrored onto sourceHandle so condition edges visually
 * attach to their Ya/Tidak handle.
 */
export function toStudioGraph(graph: FlowGraph | null | undefined): {
    nodes: StudioNode[];
    edges: StudioEdge[];
} {
    const rawNodes = Array.isArray(graph?.nodes) ? graph!.nodes : [];
    const rawEdges = Array.isArray(graph?.edges) ? graph!.edges : [];

    const nodes: StudioNode[] = rawNodes
        .filter((n): n is FlowGraphNode => !!n && typeof n.id === "string" && n.id.length > 0)
        .map((n, index) => ({
            id: n.id,
            type: typeof n.type === "string" && n.type ? n.type : "unknown",
            position: {
                x: toFiniteNumber(n.position?.x, 80 + index * 40),
                y: toFiniteNumber(n.position?.y, 80 + index * 60),
            },
            data: (n.data && typeof n.data === "object" ? n.data : {}) as StudioNodeData,
        }));

    const nodeTypeById = new Map(nodes.map((n) => [n.id, n.type ?? "unknown"]));

    const edges: StudioEdge[] = rawEdges
        .filter(
            (e): e is FlowGraphEdge =>
                !!e &&
                typeof e.id === "string" &&
                e.id.length > 0 &&
                typeof e.source === "string" &&
                typeof e.target === "string" &&
                nodeTypeById.has(e.source) &&
                nodeTypeById.has(e.target)
        )
        .map((e) => {
            const branch = e.data?.branch === "no" ? "no" : e.data?.branch === "yes" ? "yes" : undefined;
            const fromCondition = nodeTypeById.get(e.source) === "condition";
            return {
                id: e.id,
                source: e.source,
                target: e.target,
                // Only condition nodes render branch handles; attaching a
                // branch handle id to another node type would detach the edge.
                sourceHandle: fromCondition && branch ? branch : undefined,
                data: branch ? { branch } : {},
                ...edgeDisplayProps(fromCondition ? branch : undefined),
            };
        });

    return { nodes, edges };
}

/** Serializes one node's data down to exactly the contract fields. */
function serializeNodeData(node: StudioNode): Record<string, unknown> {
    const data = node.data ?? {};
    switch (node.type) {
        case "trigger":
            // Trigger semantics live in flow.trigger_config, never on the node.
            return {};
        case "send_message":
            return { text: typeof data.text === "string" ? data.text : "" };
        case "condition": {
            const kind: ConditionKind =
                data.kind === "business_hours" || data.kind === "channel" ? data.kind : "keyword";
            if (kind === "keyword") {
                const keywords = Array.isArray(data.keywords)
                    ? data.keywords.map((k) => String(k).trim()).filter(Boolean)
                    : [];
                return { kind, keywords, match: "any" };
            }
            if (kind === "channel") {
                // Raw channel strings ("whatsapp"/"web_widget") - the engine
                // compares the inbound channel against exactly these values.
                const channels = Array.isArray(data.channels)
                    ? data.channels.map((c) => String(c).trim()).filter(Boolean)
                    : [];
                return { kind, channels };
            }
            return { kind };
        }
        case "handoff": {
            const out: Record<string, unknown> = {
                queue_id: typeof data.queue_id === "string" && data.queue_id ? data.queue_id : null,
            };
            if (typeof data.note === "string" && data.note.trim()) {
                out.note = data.note.trim();
            }
            return out;
        }
        default:
            // Unknown node type: round-trip its data untouched.
            return { ...data };
    }
}

/**
 * xyflow state -> API graph. Emits ONLY the contract fields; everything
 * xyflow bolts on (selected, measured, dragging, width/height, sourceHandle,
 * labels, styles) is stripped by constructing fresh objects.
 */
export function toApiGraph(nodes: StudioNode[], edges: StudioEdge[]): FlowGraph {
    return {
        nodes: nodes.map((n) => ({
            id: n.id,
            type: n.type ?? "unknown",
            position: {
                x: Math.round(toFiniteNumber(n.position?.x, 0)),
                y: Math.round(toFiniteNumber(n.position?.y, 0)),
            },
            data: serializeNodeData(n),
        })),
        edges: edges.map((e) => {
            const branch = e.data?.branch;
            const out: FlowGraphEdge = { id: e.id, source: e.source, target: e.target };
            if (branch === "yes" || branch === "no") {
                out.data = { branch };
            }
            return out;
        }),
    };
}
