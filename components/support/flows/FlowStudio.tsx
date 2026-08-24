"use client";

// components/support/flows/FlowStudio.tsx
// Full-viewport visual editor for one automation flow (F1). @xyflow/react v12
// canvas with Controls + MiniMap + dot Background, a node palette on the
// left, a properties inspector on the right, and a Save/Validate/Publish
// toolbar on top. Client-only: loaded with next/dynamic({ssr:false}) via
// FlowStudioLoader because xyflow does not SSR.

import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    Background,
    BackgroundVariant,
    Controls,
    MiniMap,
    ReactFlow,
    ReactFlowProvider,
    applyEdgeChanges,
    applyNodeChanges,
    useReactFlow,
    type Connection,
    type EdgeChange,
    type NodeChange,
    type NodeTypes,
    type OnSelectionChangeParams,
} from "@xyflow/react";
import {
    AlertTriangle,
    ArrowLeft,
    BarChart3,
    BookOpen,
    CheckCircle2,
    Clock,
    CloudUpload,
    FlaskConical,
    HelpCircle,
    List,
    Loader2,
    MessageSquareText,
    Play,
    ShieldAlert,
    Split,
    Ticket,
    UserRound,
    X,
} from "lucide-react";
import { AppButton } from "@/components/ui/app-button";
import { AppSelect } from "@/components/ui/app-select";
import { AppTextarea } from "@/components/ui/app-textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmationPopup } from "@/components/ui/confirmation-popup";
import { notify } from "@/lib/notifications";
import { handleError } from "@/lib/utils/errorHandler";
import { usePermission } from "@/lib/hooks/usePermission";
import {
    useFlow,
    useFlowAnalytics,
    usePublishFlow,
    useSimulateFlow,
    useUnpublishFlow,
    useUpdateFlow,
    useValidateFlow,
} from "@/lib/hooks/useFlows";
import {
    FlowApiError,
    type FlowEdgeBranch,
    type FlowStatus,
    type FlowTriggerConfig,
    type SimulateFlowResult,
} from "@/lib/api/flows";
import { CORE_NODE_TYPES, FallbackNode, miniMapNodeColor } from "./FlowNodes";
import FlowPropertiesPanel, { CHANNEL_LABELS } from "./FlowPropertiesPanel";
import {
    branchesForNodeType,
    defaultNodeData,
    edgeDisplayProps,
    makeGraphId,
    toApiGraph,
    toStudioGraph,
    type StudioEdge,
    type StudioNode,
    type StudioNodeData,
} from "./flowGraph";

const DND_MIME = "application/x-supercontact-flow-node";

interface StudioIssue {
    severity: "error" | "warning";
    node_id?: string | null;
    message: string;
}

const PALETTE_ITEMS: { type: string; label: string; hint: string; icon: React.ReactNode; accent: string }[] = [
    {
        type: "send_message",
        label: "Send Message",
        hint: "Reply with a text message",
        icon: <MessageSquareText size={15} />,
        accent: "bg-[#5479EE]/10 text-[#5479EE]",
    },
    {
        type: "condition",
        label: "Condition",
        hint: "Branch on keyword / hours / channel",
        icon: <Split size={15} />,
        accent: "bg-amber-100 text-amber-600",
    },
    {
        type: "handoff",
        label: "Handoff",
        hint: "Hand over to a human agent",
        icon: <UserRound size={15} />,
        accent: "bg-emerald-100 text-emerald-600",
    },
    {
        type: "kb_answer",
        label: "KB Answer",
        hint: "Answer from the knowledge base",
        icon: <BookOpen size={15} />,
        accent: "bg-violet-100 text-violet-600",
    },
    {
        type: "menu",
        label: "Menu",
        hint: "Prompt + quick-reply options",
        icon: <List size={15} />,
        accent: "bg-sky-100 text-sky-600",
    },
    {
        type: "ticket_action",
        label: "Ticket Action",
        hint: "Create ticket / priority / tag",
        icon: <Ticket size={15} />,
        accent: "bg-orange-100 text-orange-600",
    },
    {
        type: "delay",
        label: "Delay",
        hint: "Wait, then continue the flow",
        icon: <Clock size={15} />,
        accent: "bg-slate-100 text-slate-600",
    },
];

// ---- Simulate panel helpers ------------------------------------------------

/** Small icon for one simulator trace step, keyed by the step's node type. */
function StepTypeIcon({ nodeType }: { nodeType: string }) {
    switch (nodeType) {
        case "trigger":
            return <Play size={13} className="text-[#5479EE]" fill="currentColor" />;
        case "send_message":
            return <MessageSquareText size={13} className="text-[#5479EE]" />;
        case "condition":
            return <Split size={13} className="text-amber-600" />;
        case "handoff":
            return <UserRound size={13} className="text-emerald-600" />;
        case "kb_answer":
            return <BookOpen size={13} className="text-violet-600" />;
        case "menu":
            return <List size={13} className="text-sky-600" />;
        case "ticket_action":
            return <Ticket size={13} className="text-orange-600" />;
        case "delay":
            return <Clock size={13} className="text-slate-500" />;
        default:
            return <HelpCircle size={13} className="text-gray-400" />;
    }
}

/**
 * Chip tinting for a step outcome. The outcome vocabulary belongs to the
 * backend, so this is a heuristic: negatives are tested before positives
 * ("not_found" contains "found", "no_match" contains "match").
 */
function outcomeChipClass(outcome: string): string {
    const o = outcome.toLowerCase();
    if (/error|fail|invalid/.test(o)) return "bg-red-100 text-red-700";
    if (/not_found|no_match|no-match|skip|halt|stopped|false/.test(o))
        return "bg-amber-100 text-amber-700";
    if (/sent|found|match|success|ok|created|done|true|executed|answered/.test(o))
        return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
}

function StatusBadge({ status }: { status: FlowStatus }) {
    return status === "published" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle2 size={12} /> Published
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            Draft
        </span>
    );
}

function FlowStudioInner({ flowId }: { flowId: string }) {
    const { can } = usePermission();
    const canManage = can("conversations:routing:manage");

    const { data: flow, isLoading, isError, refetch } = useFlow(canManage ? flowId : null);
    const updateMutation = useUpdateFlow();
    const validateMutation = useValidateFlow();
    const publishMutation = usePublishFlow();
    const unpublishMutation = useUnpublishFlow();
    const simulateMutation = useSimulateFlow();

    const { screenToFlowPosition, setCenter } = useReactFlow();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // ---- Studio-local state (hydrated once per flow id) --------------------
    const [nodes, setNodes] = useState<StudioNode[]>([]);
    const [edges, setEdges] = useState<StudioEdge[]>([]);
    const [name, setName] = useState("");
    const [triggerConfig, setTriggerConfig] = useState<FlowTriggerConfig>({ type: "inbound_first" });
    const [status, setStatus] = useState<FlowStatus>("draft");
    const [version, setVersion] = useState<number>(1);
    const [channelScope, setChannelScope] = useState<string[]>([]);
    const [dirty, setDirty] = useState(false);
    const [issues, setIssues] = useState<StudioIssue[]>([]);
    const [showIssues, setShowIssues] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
    const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);
    // Saving onto a PUBLISHED flow changes what customers get immediately, so
    // it goes through an explicit confirm (drafts save directly).
    const [saveLiveConfirmOpen, setSaveLiveConfirmOpen] = useState(false);
    // ---- Simulate panel (F2) ----------------------------------------------
    const [simOpen, setSimOpen] = useState(false);
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [analyticsDays, setAnalyticsDays] = useState(30);
    // Only fetched while the drawer is open - this is a reporting query,
    // not something the editor needs on every load.
    const analyticsQuery = useFlowAnalytics(flowId, analyticsDays, analyticsOpen);
    const [simMessage, setSimMessage] = useState("");
    const [simChannel, setSimChannel] = useState("");
    const [simBusinessHours, setSimBusinessHours] = useState(true);
    const [simAgentOnline, setSimAgentOnline] = useState(true);
    const [simResult, setSimResult] = useState<SimulateFlowResult | null>(null);
    // Simulation runs server-side on the SAVED graph; unsaved canvas changes
    // trigger this save-first prompt so the trace matches what's on screen.
    const [simSaveConfirmOpen, setSimSaveConfirmOpen] = useState(false);
    // The canvas mounts only after the graph is hydrated so ReactFlow's
    // initial fitView actually sees the nodes.
    const [hydrated, setHydrated] = useState(false);

    // Refs mirror state for use inside stable callbacks.
    const nodesRef = useRef<StudioNode[]>(nodes);
    nodesRef.current = nodes;
    const edgesRef = useRef<StudioEdge[]>(edges);
    edgesRef.current = edges;
    const triggerIdRef = useRef<string | null>(null);
    triggerIdRef.current = nodes.find((n) => n.type === "trigger")?.id ?? null;

    const initializedFor = useRef<string | null>(null);
    useEffect(() => {
        if (!flow || initializedFor.current === flow.id) return;
        initializedFor.current = flow.id;
        setName(flow.name ?? "");
        setTriggerConfig(flow.trigger_config ?? { type: "inbound_first" });
        setStatus(flow.status ?? "draft");
        setVersion(flow.version ?? 1);
        setChannelScope(Array.isArray(flow.channel_scope) ? flow.channel_scope : []);
        const graph = toStudioGraph(flow.graph);
        // Defensive: a flow must always have its (exactly one) trigger node.
        if (!graph.nodes.some((n) => n.type === "trigger")) {
            graph.nodes.unshift({
                id: makeGraphId("trigger"),
                type: "trigger",
                position: { x: 260, y: 40 },
                data: {},
            });
        }
        setNodes(graph.nodes);
        setEdges(graph.edges);
        setDirty(false);
        setHydrated(true);
    }, [flow]);

    // ---- nodeTypes: 4 core cards + FallbackNode for anything else ----------
    const unknownTypesKey = useMemo(() => {
        const known = new Set(Object.keys(CORE_NODE_TYPES));
        return Array.from(new Set(nodes.map((n) => n.type ?? "unknown").filter((t) => !known.has(t))))
            .sort()
            .join("|");
    }, [nodes]);

    const nodeTypes = useMemo<NodeTypes>(() => {
        const map: NodeTypes = { ...CORE_NODE_TYPES };
        for (const t of unknownTypesKey.split("|")) {
            if (t) map[t] = FallbackNode;
        }
        return map;
    }, [unknownTypesKey]);

    const hasTrigger = nodes.some((n) => n.type === "trigger");

    // ---- Canvas change handlers -------------------------------------------
    const onNodesChange = useCallback((changes: NodeChange<StudioNode>[]) => {
        const triggerId = triggerIdRef.current;
        // The trigger node is never deletable (del key, xyflow internals, ...).
        const filtered = changes.filter((c) => !(c.type === "remove" && c.id === triggerId));
        if (filtered.length === 0) return;
        if (filtered.some((c) => c.type !== "select" && c.type !== "dimensions")) {
            setDirty(true);
        }
        setNodes((nds) => applyNodeChanges(filtered, nds));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange<StudioEdge>[]) => {
        if (changes.some((c) => c.type !== "select")) setDirty(true);
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((conn: Connection) => {
        if (!conn.source || !conn.target || conn.source === conn.target) return;
        const sourceNode = nodesRef.current.find((n) => n.id === conn.source);
        const sourceType = sourceNode?.type;
        // Branching sources take their branch from the handle the user
        // dragged from: condition yes/no, kb_answer found/not_found, and
        // (F4) menu -> one of its option keys.
        const branchVocab = branchesForNodeType(sourceType, sourceNode?.data);
        let branch: FlowEdgeBranch | undefined;
        if (branchVocab.length > 0) {
            if (branchVocab.includes(conn.sourceHandle as FlowEdgeBranch)) {
                branch = conn.sourceHandle as FlowEdgeBranch;
            } else {
                // No handle to go on. Pick the first key this menu hasn't
                // routed yet - defaulting to vocab[0] every time would give
                // two edges the same option key, which the server rejects.
                const used = new Set(
                    edgesRef.current
                        .filter((e) => e.source === conn.source)
                        .map((e) => String(e.data?.branch ?? ""))
                );
                branch = branchVocab.find((b) => !used.has(String(b))) ?? branchVocab[0];
            }
        }
        const newEdge: StudioEdge = {
            id: makeGraphId("edge"),
            source: conn.source,
            target: conn.target,
            sourceHandle: conn.sourceHandle ?? undefined,
            data: branch ? { branch } : {},
            ...edgeDisplayProps(branch),
        };
        setEdges((eds) => [...eds, newEdge]);
        setDirty(true);
    }, []);

    const onSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }: OnSelectionChangeParams) => {
        setSelectedNodeId(selNodes[0]?.id ?? null);
        setSelectedEdgeId(selNodes.length === 0 ? selEdges[0]?.id ?? null : null);
    }, []);

    // Keyboard/xyflow delete flow: the trigger node itself is undeletable, and
    // edges are only removed when explicitly selected or when a non-trigger
    // endpoint of theirs is actually being deleted (so "delete trigger" never
    // silently strips the trigger's connections).
    const onBeforeDelete = useCallback(
        async ({ nodes: delNodes, edges: delEdges }: { nodes: StudioNode[]; edges: StudioEdge[] }) => {
            const triggerId = triggerIdRef.current;
            const keptNodes = delNodes.filter((n) => n.id !== triggerId);
            const deletedIds = new Set(keptNodes.map((n) => n.id));
            const keptEdges = delEdges.filter(
                (e) => e.selected || deletedIds.has(e.source) || deletedIds.has(e.target)
            );
            if (keptNodes.length === 0 && keptEdges.length === 0) return false;
            return { nodes: keptNodes, edges: keptEdges };
        },
        []
    );

    // ---- Palette: click-to-add + drag-and-drop ----------------------------
    const clickAddCount = useRef(0);
    const addNode = useCallback(
        (type: string, position?: { x: number; y: number }) => {
            if (type === "trigger" && nodesRef.current.some((n) => n.type === "trigger")) return;
            let pos = position;
            if (!pos) {
                const rect = wrapperRef.current?.getBoundingClientRect();
                const center = rect
                    ? screenToFlowPosition({
                          x: rect.left + rect.width / 2,
                          y: rect.top + rect.height / 2,
                      })
                    : { x: 260, y: 220 };
                const offset = (clickAddCount.current = (clickAddCount.current + 1) % 6);
                pos = { x: center.x - 112 + offset * 28, y: center.y - 40 + offset * 28 };
            }
            const node: StudioNode = {
                id: makeGraphId(type),
                type,
                position: pos,
                data: defaultNodeData(type),
                selected: true,
            };
            setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), node]);
            setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            setDirty(true);
        },
        [screenToFlowPosition]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            const type = event.dataTransfer.getData(DND_MIME);
            if (!type) return;
            event.preventDefault();
            const pos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
            addNode(type, { x: pos.x - 112, y: pos.y - 24 });
        },
        [addNode, screenToFlowPosition]
    );

    // ---- Property edits ----------------------------------------------------
    const onNodeDataChange = useCallback((nodeId: string, patch: Partial<StudioNodeData>) => {
        setNodes((nds) =>
            nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n))
        );
        // Editing a menu's OPTIONS retargets what its edges are allowed to
        // route. An edge left pointing at a renamed or deleted option key
        // fails server validation ("routes option keys that do not exist"),
        // which on a published flow rejects the whole save - and the author
        // has no way to see WHICH edge is at fault. Drop those edges here
        // instead, at the moment the option goes away.
        if ("options" in patch) {
            const keys = new Set(
                (Array.isArray(patch.options) ? patch.options : [])
                    .map((o) => (o && typeof o === "object" ? o.key : ""))
                    .filter((k) => typeof k === "string" && k.length > 0)
            );
            setEdges((eds) =>
                eds.filter((e) => {
                    if (e.source !== nodeId) return true;
                    const branch = e.data?.branch;
                    return !branch || keys.has(String(branch));
                })
            );
        }
        setDirty(true);
    }, []);

    const onEdgeBranchChange = useCallback((edgeId: string, branch: FlowEdgeBranch) => {
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id !== edgeId) return e;
                // Move the edge onto the matching handle only when the source
                // node actually renders that handle: condition yes/no,
                // kb_answer found/not_found, and a menu's per-option handles
                // (id = the option key). Passing node data is required for
                // the menu case - without it the edge would keep pointing at
                // the old option's handle.
                const sourceNode = nodesRef.current.find((n) => n.id === e.source);
                const isBranchHandle = branchesForNodeType(
                    sourceNode?.type,
                    sourceNode?.data
                ).includes(branch);
                return {
                    ...e,
                    sourceHandle: isBranchHandle ? branch : e.sourceHandle,
                    data: { ...e.data, branch },
                    ...edgeDisplayProps(branch),
                };
            })
        );
        setDirty(true);
    }, []);

    const onDeleteNode = useCallback((nodeId: string) => {
        if (nodeId === triggerIdRef.current) return;
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        setSelectedNodeId((current) => (current === nodeId ? null : current));
        setDirty(true);
    }, []);

    const onDeleteEdge = useCallback((edgeId: string) => {
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
        setSelectedEdgeId((current) => (current === edgeId ? null : current));
        setDirty(true);
    }, []);

    const onTriggerConfigChange = useCallback((config: FlowTriggerConfig) => {
        setTriggerConfig(config);
        setDirty(true);
    }, []);

    // ---- Toolbar actions ---------------------------------------------------
    const isBusy =
        updateMutation.isPending ||
        validateMutation.isPending ||
        publishMutation.isPending ||
        unpublishMutation.isPending ||
        simulateMutation.isPending;

    const handleSave = async (silent = false): Promise<boolean> => {
        const graph = toApiGraph(nodesRef.current, edgesRef.current);
        try {
            const result = await updateMutation.mutateAsync({
                id: flowId,
                data: {
                    name: name.trim() || "Untitled flow",
                    trigger_config: triggerConfig,
                    graph,
                },
            });
            setDirty(false);
            if (result.flow && typeof result.flow === "object") {
                if (result.flow.status === "draft" || result.flow.status === "published") {
                    setStatus(result.flow.status);
                }
                if (typeof result.flow.version === "number") setVersion(result.flow.version);
            }
            const warnings: StudioIssue[] = result.validation.map((v) => ({
                severity: "warning",
                node_id: v.node_id,
                message: v.message,
            }));
            setIssues(warnings);
            setShowIssues(warnings.length > 0);
            if (!silent) {
                notify.success(
                    status === "published" ? "Live flow updated" : "Draft saved",
                    warnings.length > 0
                        ? { description: `Saved with ${warnings.length} validation warning(s).` }
                        : status === "published"
                          ? { description: "Perubahan langsung aktif untuk pelanggan." }
                          : undefined
                );
            }
            return true;
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Save Flow") });
            return false;
        }
    };

    const handleValidate = async () => {
        // Validation runs server-side against the SAVED graph, so flush
        // unsaved canvas changes first.
        if (dirty) {
            const ok = await handleSave(true);
            if (!ok) return;
        }
        try {
            const result = await validateMutation.mutateAsync(flowId);
            if (result.valid) {
                setIssues([]);
                setShowIssues(false);
                notify.success("Flow is valid", {
                    description: "No problems found - ready to publish.",
                });
            } else {
                setIssues(
                    result.errors.map((e) => ({
                        severity: "error",
                        node_id: e.node_id,
                        message: e.message,
                    }))
                );
                setShowIssues(true);
            }
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Validate Flow") });
        }
    };

    const handlePublish = async () => {
        setPublishConfirmOpen(false);
        if (dirty) {
            const ok = await handleSave(true);
            if (!ok) return;
        }
        try {
            const result = await publishMutation.mutateAsync(flowId);
            setStatus(result?.status ?? "published");
            if (typeof result?.version === "number") setVersion(result.version);
            setIssues([]);
            setShowIssues(false);
            notify.success("Flow published", {
                description: "The flow is now live on its channels.",
            });
        } catch (error) {
            if (error instanceof FlowApiError && error.issues.length > 0) {
                setIssues(
                    error.issues.map((e) => ({
                        severity: "error",
                        node_id: e.node_id,
                        message: e.message,
                    }))
                );
                setShowIssues(true);
            }
            notify.error("Publish failed", { description: handleError(error, "Publish Flow") });
        }
    };

    const handleUnpublish = async () => {
        try {
            const result = await unpublishMutation.mutateAsync(flowId);
            setStatus(result?.status ?? "draft");
            notify.success("Flow unpublished", {
                description: "The flow no longer runs on inbound messages.",
            });
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Unpublish Flow") });
        }
    };

    // Selects + pans to one node (validation issues + simulator steps).
    const focusNode = useCallback(
        (nodeId: string) => {
            const node = nodesRef.current.find((n) => n.id === nodeId);
            if (!node) return;
            setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === node.id })));
            setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
            setSelectedNodeId(node.id);
            setSelectedEdgeId(null);
            const width = node.measured?.width ?? 224;
            const height = node.measured?.height ?? 96;
            setCenter(node.position.x + width / 2, node.position.y + height / 2, {
                zoom: 1.15,
                duration: 500,
            });
        },
        [setCenter]
    );

    // Clicking a validation issue selects + pans to the offending node.
    const focusIssue = (issue: StudioIssue) => {
        if (!issue.node_id) return;
        focusNode(issue.node_id);
    };

    // ---- Simulate panel actions -------------------------------------------
    const simChannelOptions = useMemo(() => {
        // Simulate against the flow's own channels; fall back to the F1 pair
        // if the scope is somehow empty so the panel stays usable.
        const source = channelScope.length > 0 ? channelScope : ["whatsapp", "web_widget"];
        return source.map((c) => ({ value: c, label: CHANNEL_LABELS[c] ?? c }));
    }, [channelScope]);

    const openSimulatePanel = () => {
        setSimOpen(true);
        // Keep the chosen channel only while it stays within the flow's scope.
        setSimChannel((current) =>
            simChannelOptions.some((o) => o.value === current)
                ? current
                : simChannelOptions[0]?.value ?? ""
        );
    };

    const runSimulation = async () => {
        try {
            const result = await simulateMutation.mutateAsync({
                id: flowId,
                data: {
                    message_text: simMessage.trim(),
                    channel_type: simChannel,
                    context: {
                        business_hours_open: simBusinessHours,
                        agent_online: simAgentOnline,
                    },
                },
            });
            setSimResult(result);
        } catch (error) {
            notify.error("Error", { description: handleError(error, "Simulate Flow") });
        }
    };

    // The simulator dry-runs the SERVER's saved graph, so unsaved canvas
    // changes go through a save-first prompt (otherwise the trace would not
    // match what's on screen).
    const handleRunSimulation = () => {
        if (!simMessage.trim() || !simChannel) return;
        if (dirty) {
            setSimSaveConfirmOpen(true);
            return;
        }
        void runSimulation();
    };

    const handleSaveAndSimulate = async () => {
        setSimSaveConfirmOpen(false);
        const ok = await handleSave(true);
        if (!ok) return;
        await runSimulation();
    };

    const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;
    const selectedEdge = edges.find((e) => e.id === selectedEdgeId) ?? null;
    const selectedEdgeSourceNode = selectedEdge
        ? nodes.find((n) => n.id === selectedEdge.source) ?? null
        : null;
    const selectedEdgeSourceType = selectedEdgeSourceNode?.type ?? null;

    // ---- Guard states ------------------------------------------------------
    if (!canManage) {
        return (
            <div className="flex h-[calc(100vh-52px)] flex-col items-center justify-center gap-3 px-4 text-center">
                <ShieldAlert className="h-8 w-8 text-gray-300" />
                <h1 className="text-lg font-semibold text-gray-900">Access denied</h1>
                <p className="max-w-sm text-sm text-gray-500">
                    You need the conversation routing permission to open the Flow Studio. Ask an
                    administrator if you believe you should have access.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-52px)] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#5479EE]" />
            </div>
        );
    }

    if (isError || !flow) {
        return (
            <div className="flex h-[calc(100vh-52px)] flex-col items-center justify-center gap-3 px-4 text-center">
                <AlertTriangle className="h-8 w-8 text-amber-400" />
                <h1 className="text-lg font-semibold text-gray-900">Couldn&apos;t load this flow</h1>
                <div className="flex gap-2">
                    <AppButton variantStyle="outline" onClick={() => refetch()}>
                        Retry
                    </AppButton>
                    <Link href="/support/flows">
                        <AppButton variantStyle="text">Back to flows</AppButton>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-52px)] flex-col bg-[#F7F8FB]">
            {/* ---- Toolbar ---- */}
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white px-4 py-2">
                <Link
                    href="/support/flows"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    aria-label="Back to flows"
                >
                    <ArrowLeft size={17} />
                </Link>
                <input
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        setDirty(true);
                    }}
                    placeholder="Untitled flow"
                    aria-label="Flow name"
                    className="min-w-[160px] max-w-xs flex-shrink rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-gray-800 outline-none transition-colors hover:border-gray-200 focus:border-[#5479EE] focus:bg-white"
                />
                <StatusBadge status={status} />
                <span className="text-xs text-gray-400">v{version}</span>
                {dirty && (
                    <span className="text-xs font-medium text-amber-600">Unsaved changes</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                    {issues.length > 0 && !showIssues && (
                        <button
                            type="button"
                            onClick={() => setShowIssues(true)}
                            className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                        >
                            <AlertTriangle size={12} />
                            {issues.length} issue{issues.length > 1 ? "s" : ""}
                        </button>
                    )}
                    {status === "published" ? (
                        // A published flow's saved graph is LIVE: make that
                        // honest - warning styling + an explicit confirm.
                        <AppButton
                            variantStyle="outline"
                            color="danger"
                            size="small"
                            startIcon={<AlertTriangle size={14} />}
                            onClick={() => setSaveLiveConfirmOpen(true)}
                            disabled={isBusy}
                            isLoading={updateMutation.isPending}
                        >
                            Update live flow
                        </AppButton>
                    ) : (
                        <AppButton
                            variantStyle="outline"
                            size="small"
                            onClick={() => handleSave()}
                            disabled={isBusy}
                            isLoading={updateMutation.isPending}
                        >
                            Save draft
                        </AppButton>
                    )}
                    <AppButton
                        variantStyle="outline"
                        size="small"
                        onClick={handleValidate}
                        disabled={isBusy}
                        isLoading={validateMutation.isPending}
                    >
                        Validate
                    </AppButton>
                    <AppButton
                        variantStyle="outline"
                        size="small"
                        startIcon={<FlaskConical size={14} />}
                        onClick={() => (simOpen ? setSimOpen(false) : openSimulatePanel())}
                    >
                        Simulate
                    </AppButton>
                    <AppButton
                        variantStyle="outline"
                        size="small"
                        startIcon={<BarChart3 size={14} />}
                        onClick={() => {
                            setAnalyticsOpen((open) => !open);
                            if (!analyticsOpen) setSimOpen(false);
                        }}
                    >
                        Analytics
                    </AppButton>
                    {status === "published" ? (
                        <AppButton
                            variantStyle="outline"
                            color="gray"
                            size="small"
                            onClick={handleUnpublish}
                            disabled={isBusy}
                            isLoading={unpublishMutation.isPending}
                        >
                            Unpublish
                        </AppButton>
                    ) : (
                        <AppButton
                            size="small"
                            startIcon={<CloudUpload size={15} />}
                            onClick={() => setPublishConfirmOpen(true)}
                            disabled={isBusy}
                            isLoading={publishMutation.isPending}
                        >
                            Publish
                        </AppButton>
                    )}
                </div>
            </div>

            <div className="flex min-h-0 flex-1">
                {/* ---- Palette ---- */}
                <aside className="w-56 shrink-0 space-y-2 overflow-y-auto border-r border-gray-200 bg-white p-3">
                    <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Add a step
                    </h2>
                    {!hasTrigger && (
                        <button
                            type="button"
                            onClick={() => addNode("trigger")}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(DND_MIME, "trigger");
                                e.dataTransfer.effectAllowed = "move";
                            }}
                            className="flex w-full cursor-grab items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-[#5479EE]/50 hover:bg-[#5479EE]/5 active:cursor-grabbing"
                        >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#5479EE] text-white">
                                <Play size={15} fill="currentColor" />
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-gray-800">Trigger</span>
                                <span className="block text-[11px] text-gray-500">Flow starting point</span>
                            </span>
                        </button>
                    )}
                    {PALETTE_ITEMS.map((item) => (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => addNode(item.type)}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData(DND_MIME, item.type);
                                e.dataTransfer.effectAllowed = "move";
                            }}
                            className="flex w-full cursor-grab items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-2.5 text-left shadow-sm transition-colors hover:border-[#5479EE]/50 hover:bg-[#5479EE]/5 active:cursor-grabbing"
                        >
                            <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.accent}`}
                            >
                                {item.icon}
                            </span>
                            <span>
                                <span className="block text-sm font-semibold text-gray-800">{item.label}</span>
                                <span className="block text-[11px] text-gray-500">{item.hint}</span>
                            </span>
                        </button>
                    ))}
                    <p className="px-1 pt-2 text-[11px] leading-relaxed text-gray-400">
                        Drag onto the canvas or click to add. Connect steps by dragging between the
                        round handles.
                    </p>
                </aside>

                {/* ---- Canvas ---- */}
                <div ref={wrapperRef} className="relative min-w-0 flex-1" onDragOver={onDragOver} onDrop={onDrop}>
                    {!hydrated ? (
                        <div className="flex h-full items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5479EE]" />
                        </div>
                    ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onSelectionChange={onSelectionChange}
                        onBeforeDelete={onBeforeDelete}
                        deleteKeyCode={["Delete", "Backspace"]}
                        fitView
                        fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
                        minZoom={0.2}
                        maxZoom={2}
                        proOptions={{ hideAttribution: false }}
                    >
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d6dbea" />
                        <Controls position="bottom-left" />
                        <MiniMap
                            position="bottom-right"
                            pannable
                            zoomable
                            nodeColor={miniMapNodeColor}
                            nodeStrokeWidth={2}
                        />
                    </ReactFlow>
                    )}

                    {/* ---- Validation issues overlay ---- */}
                    {showIssues && issues.length > 0 && (
                        <div className="absolute right-4 top-4 z-10 w-80 max-w-[calc(100%-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                    <AlertTriangle
                                        size={14}
                                        className={
                                            issues.some((i) => i.severity === "error")
                                                ? "text-red-500"
                                                : "text-amber-500"
                                        }
                                    />
                                    {issues.some((i) => i.severity === "error")
                                        ? "Validation errors"
                                        : "Validation warnings"}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setShowIssues(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                    aria-label="Dismiss validation issues"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                            <ul className="max-h-60 overflow-y-auto py-1">
                                {issues.map((issue, index) => (
                                    <li key={`${issue.node_id ?? "flow"}-${index}`}>
                                        <button
                                            type="button"
                                            onClick={() => focusIssue(issue)}
                                            disabled={!issue.node_id}
                                            className={`w-full px-3 py-1.5 text-left text-xs ${
                                                issue.node_id
                                                    ? "cursor-pointer hover:bg-gray-50"
                                                    : "cursor-default"
                                            }`}
                                        >
                                            <span
                                                className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${
                                                    issue.severity === "error"
                                                        ? "bg-red-500"
                                                        : "bg-amber-400"
                                                }`}
                                            />
                                            <span className="text-gray-700">{issue.message}</span>
                                            {issue.node_id && (
                                                <span className="ml-1 text-[10px] text-[#5479EE]">
                                                    (show node)
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* ---- Analytics drawer (F4b) ---- */}
                    {analyticsOpen && (
                        <div className="absolute inset-y-0 right-0 z-20 flex w-96 max-w-[calc(100%-1rem)] flex-col border-l border-gray-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <BarChart3 size={15} className="text-[#5479EE]" />
                                    Analytics
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setAnalyticsOpen(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                    aria-label="Close analytics panel"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                                <div className="flex gap-1.5">
                                    {[7, 30, 90].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => setAnalyticsDays(d)}
                                            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                                                analyticsDays === d
                                                    ? "border-[#5479EE] bg-[#5479EE]/10 text-[#3f5fd0]"
                                                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                                            }`}
                                        >
                                            {d} hari
                                        </button>
                                    ))}
                                </div>

                                {analyticsQuery.isLoading ? (
                                    <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
                                        <Loader2 size={14} className="animate-spin" />
                                        Memuat metrik…
                                    </div>
                                ) : analyticsQuery.isError ? (
                                    <p className="text-sm text-red-500">
                                        Gagal memuat metrik alur ini.
                                    </p>
                                ) : !analyticsQuery.data || analyticsQuery.data.total_runs === 0 ? (
                                    <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                                        <p className="text-sm font-medium text-gray-600">
                                            Belum ada run
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            Metrik muncul setelah alur ini dipublish dan mulai
                                            dijalankan oleh pesan masuk.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                {
                                                    label: "Selesai",
                                                    value: analyticsQuery.data.completion_rate,
                                                    tone: "text-green-700",
                                                },
                                                {
                                                    label: "Ke agen",
                                                    value: analyticsQuery.data.handoff_rate,
                                                    tone: "text-amber-700",
                                                },
                                                {
                                                    label: "Deflected",
                                                    value: analyticsQuery.data.deflection_rate,
                                                    tone: "text-[#3f5fd0]",
                                                },
                                            ].map((m) => (
                                                <div
                                                    key={m.label}
                                                    className="rounded-xl border border-gray-200 p-2.5 text-center"
                                                >
                                                    <p className={`text-lg font-bold ${m.tone}`}>
                                                        {Math.round(m.value * 100)}%
                                                    </p>
                                                    <p className="text-[11px] text-gray-500">
                                                        {m.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="text-[11px] text-gray-400">
                                            {analyticsQuery.data.total_runs} run ·{" "}
                                            {analyticsQuery.data.deflected_runs} dijawab KB tanpa
                                            perlu agen · {analyticsQuery.data.handoff_runs} berakhir
                                            di agen.
                                        </p>

                                        <div>
                                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Status run
                                            </p>
                                            <div className="space-y-1">
                                                {Object.entries(analyticsQuery.data.by_status).map(
                                                    ([st, count]) => (
                                                        <div
                                                            key={st}
                                                            className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs"
                                                        >
                                                            <span className="font-medium text-gray-600">
                                                                {st}
                                                            </span>
                                                            <span className="text-gray-500">
                                                                {count}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Per node
                                            </p>
                                            <p className="mb-2 text-[11px] text-gray-400">
                                                Klik untuk menyorot node di kanvas.
                                            </p>
                                            <ol className="space-y-1.5">
                                                {analyticsQuery.data.nodes.map((n) => (
                                                    <li key={n.node_id}>
                                                        <button
                                                            type="button"
                                                            onClick={() => focusNode(n.node_id)}
                                                            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-left hover:bg-gray-50"
                                                        >
                                                            <span className="flex items-center justify-between gap-2">
                                                                <span className="inline-flex min-w-0 items-center gap-1.5">
                                                                    <StepTypeIcon
                                                                        nodeType={n.node_type}
                                                                    />
                                                                    <span className="truncate text-xs font-medium text-gray-700">
                                                                        {n.node_type}
                                                                    </span>
                                                                </span>
                                                                <span className="shrink-0 text-[11px] text-gray-400">
                                                                    {n.total}×
                                                                </span>
                                                            </span>
                                                            <span className="mt-1 flex flex-wrap gap-1">
                                                                {Object.entries(n.outcomes).map(
                                                                    ([outcome, count]) => (
                                                                        <span
                                                                            key={outcome}
                                                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${outcomeChipClass(outcome)}`}
                                                                        >
                                                                            {outcome} {count}
                                                                        </span>
                                                                    )
                                                                )}
                                                            </span>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ---- Simulate drawer (F2) ---- */}
                    {simOpen && (
                        <div className="absolute inset-y-0 right-0 z-20 flex w-96 max-w-[calc(100%-1rem)] flex-col border-l border-gray-200 bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <FlaskConical size={15} className="text-[#5479EE]" />
                                    Simulate
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSimOpen(false)}
                                    className="text-gray-400 hover:text-gray-700"
                                    aria-label="Close simulate panel"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                                <p className="text-xs text-gray-500">
                                    Dry-run: tidak ada pesan yang benar-benar terkirim dan tidak ada
                                    tiket yang dibuat. Simulasi memakai graph yang{" "}
                                    <span className="font-medium">tersimpan di server</span>.
                                </p>
                                {dirty && (
                                    <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                        Ada perubahan belum disimpan - Anda akan diminta menyimpan
                                        sebelum simulasi dijalankan.
                                    </div>
                                )}
                                <AppTextarea
                                    isBgWhite
                                    fullWidth
                                    label="Pesan masuk (uji)"
                                    rows={3}
                                    placeholder="mis. Bagaimana cara reset password?"
                                    value={simMessage}
                                    onChange={(e) => setSimMessage(e.target.value)}
                                />
                                <AppSelect
                                    isBgWhite
                                    fullWidth
                                    label="Channel"
                                    value={simChannel}
                                    options={simChannelOptions}
                                    onChange={(e) => setSimChannel(e.target.value as string)}
                                />
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Jam kerja buka
                                        </span>
                                        <Switch
                                            checked={simBusinessHours}
                                            onCheckedChange={setSimBusinessHours}
                                            aria-label="Jam kerja buka"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Agen online
                                        </span>
                                        <Switch
                                            checked={simAgentOnline}
                                            onCheckedChange={setSimAgentOnline}
                                            aria-label="Agen online"
                                        />
                                    </div>
                                </div>
                                <AppButton
                                    fullWidth
                                    startIcon={<Play size={15} />}
                                    onClick={handleRunSimulation}
                                    disabled={isBusy || !simMessage.trim() || !simChannel}
                                    isLoading={simulateMutation.isPending}
                                >
                                    Run Simulation
                                </AppButton>

                                {simResult && (
                                    <div className="space-y-4 border-t border-gray-100 pt-4">
                                        <div>
                                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Langkah eksekusi
                                            </h3>
                                            {simResult.steps.length === 0 ? (
                                                <p className="text-xs italic text-gray-400">
                                                    Tidak ada langkah yang dijalankan.
                                                </p>
                                            ) : (
                                                <ol className="space-y-1.5">
                                                    {simResult.steps.map((step, index) => {
                                                        const nodeExists = nodes.some(
                                                            (n) => n.id === step.node_id
                                                        );
                                                        return (
                                                            <li key={`${step.node_id}-${index}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        nodeExists && focusNode(step.node_id)
                                                                    }
                                                                    disabled={!nodeExists}
                                                                    title={
                                                                        nodeExists
                                                                            ? "Tampilkan node di kanvas"
                                                                            : undefined
                                                                    }
                                                                    className={`w-full rounded-lg border border-gray-100 px-2.5 py-2 text-left transition-colors ${
                                                                        nodeExists
                                                                            ? "cursor-pointer hover:border-[#5479EE]/40 hover:bg-[#5479EE]/5"
                                                                            : "cursor-default"
                                                                    }`}
                                                                >
                                                                    <span className="flex items-center gap-2">
                                                                        <span className="w-4 shrink-0 text-[10px] font-semibold text-gray-400">
                                                                            {index + 1}
                                                                        </span>
                                                                        <StepTypeIcon nodeType={step.node_type} />
                                                                        <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-700">
                                                                            {step.node_type}
                                                                        </span>
                                                                        <span
                                                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${outcomeChipClass(step.outcome)}`}
                                                                        >
                                                                            {step.outcome || "-"}
                                                                        </span>
                                                                    </span>
                                                                    {step.detail && (
                                                                        <span className="mt-1 block pl-6 text-[11px] text-gray-500">
                                                                            {step.detail}
                                                                        </span>
                                                                    )}
                                                                </button>
                                                            </li>
                                                        );
                                                    })}
                                                </ol>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                Pesan yang akan terkirim
                                            </h3>
                                            {simResult.would_send.length === 0 ? (
                                                <p className="text-xs italic text-gray-400">
                                                    Tidak ada pesan yang akan terkirim.
                                                </p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {simResult.would_send.map((msg, index) => (
                                                        <div
                                                            key={index}
                                                            className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-[#5479EE]/10 px-3 py-2 text-sm text-gray-800"
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {simResult.halted_reason && (
                                            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                                <span className="font-semibold">Run berhenti:</span>{" "}
                                                {simResult.halted_reason}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ---- Properties panel ---- */}
                <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
                    <FlowPropertiesPanel
                        selectedNode={selectedNode}
                        selectedEdge={selectedEdge}
                        selectedEdgeSourceType={selectedEdgeSourceType}
                        selectedEdgeSourceData={selectedEdgeSourceNode?.data ?? null}
                        triggerConfig={triggerConfig}
                        channelScope={channelScope}
                        status={status}
                        onTriggerConfigChange={onTriggerConfigChange}
                        onNodeDataChange={onNodeDataChange}
                        onEdgeBranchChange={onEdgeBranchChange}
                        onDeleteNode={onDeleteNode}
                        onDeleteEdge={onDeleteEdge}
                    />
                </aside>
            </div>

            <ConfirmationPopup
                isOpen={publishConfirmOpen}
                onClose={() => setPublishConfirmOpen(false)}
                onConfirm={handlePublish}
                title="Publish this flow?"
                description={`"${name || "Untitled flow"}" will start running automatically on inbound messages for its channels. The graph is strictly validated first.`}
                confirmText="Publish"
                cancelText="Cancel"
                variant="info"
                isLoading={publishMutation.isPending}
            />

            <ConfirmationPopup
                isOpen={simSaveConfirmOpen}
                onClose={() => setSimSaveConfirmOpen(false)}
                onConfirm={() => void handleSaveAndSimulate()}
                title="Simpan perubahan sebelum simulasi?"
                description={
                    status === "published"
                        ? `Simulasi memakai graph yang tersimpan di server, sedangkan kanvas punya perubahan belum disimpan. "${name || "Untitled flow"}" sedang PUBLISHED - menyimpan berarti perubahan langsung aktif untuk pelanggan.`
                        : "Simulasi memakai graph yang tersimpan di server, sedangkan kanvas punya perubahan belum disimpan. Simpan dulu agar hasil simulasi sesuai kanvas saat ini."
                }
                confirmText="Simpan & simulasikan"
                cancelText="Batal"
                variant={status === "published" ? "warning" : "info"}
                isLoading={updateMutation.isPending || simulateMutation.isPending}
            />

            <ConfirmationPopup
                isOpen={saveLiveConfirmOpen}
                onClose={() => setSaveLiveConfirmOpen(false)}
                onConfirm={() => {
                    setSaveLiveConfirmOpen(false);
                    void handleSave();
                }}
                title="Update the live flow?"
                description={`"${name || "Untitled flow"}" is published. Perubahan langsung aktif untuk pelanggan. The previous graph is versioned automatically.`}
                confirmText="Update live flow"
                cancelText="Cancel"
                variant="warning"
                isLoading={updateMutation.isPending}
            />
        </div>
    );
}

export default function FlowStudio({ flowId }: { flowId: string }) {
    return (
        <ReactFlowProvider>
            <FlowStudioInner flowId={flowId} />
        </ReactFlowProvider>
    );
}
