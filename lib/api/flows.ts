// lib/api/flows.ts
// Flow Studio (F1) - CRUD + lifecycle for visual automation flows.
// Mirrors the backend /support/flows endpoints (ResponseModel `.data`
// envelope, gate conversations:routing:manage) plus the per-account
// automation-mode switch on /omnichannels/accounts.
import { fetchWithTimeout } from "./api-client";

function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
    }
    return `${baseUrl}${path}`;
}

function authHeaders(token: string): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };
}

function jsonHeaders(token: string): HeadersInit {
    return {
        ...authHeaders(token),
        "Content-Type": "application/json",
    };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FlowStatus = "draft" | "published";

// Every channel the FlowEngine runs on (F3 completed the set). Mirrors the
// backend ChannelType enum, which is what channel_scope validates against.
export type FlowChannel =
    | "whatsapp"
    | "web_widget"
    | "email"
    | "sms"
    | "messenger"
    | "instagram";

export type FlowTriggerType =
    | "inbound_first"
    | "keyword"
    | "off_hours"
    | "no_agent_online";

// Trigger semantics live on the flow (NOT on the trigger node, whose data is
// always {}). `type` drives the engine; `keywords` only applies to "keyword".
export interface FlowTriggerConfig {
    type: FlowTriggerType;
    keywords?: string[];
    [key: string]: unknown;
}

// --- Graph contract (exact - the engine executes this shape) ---------------
// Node: {id, type: "trigger"|"send_message"|"condition"|"handoff"|
//        "kb_answer"|"menu"|"ticket_action", position, data}
// Edge: {id, source, target, data?: {branch?: "yes"|"no"|"found"|"not_found"}}
// (yes/no belong to condition edges, found/not_found to kb_answer edges.)
// The studio serializes xyflow state down to exactly this (no selected/
// measured/dragging/sourceHandle fields ever reach the API).

export type FlowNodeType =
    | "trigger"
    | "send_message"
    | "condition"
    | "handoff"
    | "kb_answer"
    | "menu"
    | "ticket_action";

export type ConditionKind = "keyword" | "business_hours" | "channel";

export type FlowEdgeBranch = "yes" | "no" | "found" | "not_found";

// kb_answer: flows scoped to web_widget may only use grounding "public"
// (the backend validates this; the studio disables "internal" accordingly).
export type KbGrounding = "public" | "internal";

export interface MenuOption {
    key: string;
    label: string;
}

export type TicketActionKind = "create_ticket" | "set_priority" | "add_tag";

export type TicketPriority = "Urgent" | "High" | "Medium" | "Low";

export interface FlowGraphNode {
    id: string;
    // Typed as string (not FlowNodeType) so unknown node types coming from a
    // newer backend still round-trip through the studio untouched.
    type: string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
}

export interface FlowGraphEdge {
    id: string;
    source: string;
    target: string;
    data?: { branch?: FlowEdgeBranch };
}

export interface FlowGraph {
    nodes: FlowGraphNode[];
    edges: FlowGraphEdge[];
}

export interface FlowSummary {
    id: string;
    name: string;
    description: string | null;
    channel_scope: string[];
    trigger_config: FlowTriggerConfig | null;
    status: FlowStatus;
    version: number;
    is_active: boolean;
    updated_at: string;
}

export interface FlowDetail extends FlowSummary {
    graph: FlowGraph | null;
    created_at?: string;
}

export interface CreateFlowRequest {
    name: string;
    description?: string | null;
    channel_scope: string[];
    trigger_config: FlowTriggerConfig;
    graph?: FlowGraph;
}

export interface UpdateFlowRequest {
    name?: string;
    description?: string | null;
    channel_scope?: string[];
    trigger_config?: FlowTriggerConfig;
    graph?: FlowGraph;
}

export interface FlowValidationIssue {
    node_id?: string | null;
    message: string;
}

export interface FlowValidationResult {
    valid: boolean;
    errors: FlowValidationIssue[];
}

// PUT is lenient: it saves the draft AND returns advisory validation issues.
export interface UpdateFlowResult {
    flow: FlowDetail;
    validation: FlowValidationIssue[];
}

// One row of GET /support/flows/{id}/runs. Shape is intentionally loose - the
// runs log is a debugging surface and F1 only lists it.
export interface FlowRun {
    id: string;
    status?: string;
    channel?: string | null;
    contact_id?: string | null;
    started_at?: string;
    finished_at?: string | null;
    [key: string]: unknown;
}

// --- Simulator (F2) --------------------------------------------------------
// POST /support/flows/{id}/simulate - dry-run of the SERVER's saved graph
// against one hypothetical inbound message. Nothing is sent or created.

export interface SimulateFlowRequest {
    message_text: string;
    channel_type: string;
    context?: {
        business_hours_open?: boolean;
        agent_online?: boolean;
    };
}

export interface SimulateStep {
    node_id: string;
    node_type: string;
    outcome: string;
    detail?: string | null;
}

export interface SimulateFlowResult {
    steps: SimulateStep[];
    would_send: { text: string }[];
    halted_reason?: string | null;
}

export type AutomationMode = "legacy" | "flow";

// ---------------------------------------------------------------------------
// Error type - carries structured validation issues (publish 4xx, validate)
// so the studio can render a clickable error list instead of a flat string.
// ---------------------------------------------------------------------------

export class FlowApiError extends Error {
    issues: FlowValidationIssue[];

    constructor(message: string, issues: FlowValidationIssue[] = []) {
        super(message);
        this.name = "FlowApiError";
        this.issues = issues;
    }
}

// Defensively digs the issue list out of an error payload, whatever nesting
// the envelope used ({data: {errors}}, {errors}, {error: {errors}}).
function extractIssues(json: any): FlowValidationIssue[] {
    const raw =
        json?.data?.errors ??
        json?.errors ??
        json?.error?.errors ??
        json?.data?.validation ??
        null;
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item: any) =>
            typeof item === "string"
                ? { message: item }
                : { node_id: item?.node_id ?? null, message: String(item?.message ?? "") }
        )
        .filter((item: FlowValidationIssue) => !!item.message);
}

async function handleResponse<T>(res: Response, errorMessage: string): Promise<T> {
    if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
    }

    let json: any;
    try {
        json = await res.json();
    } catch (err) {
        throw new FlowApiError(`${errorMessage} (Invalid JSON response)`);
    }

    if (!res.ok || json.success === false) {
        const msg =
            json.message || json.error?.message || (typeof json.error === "string" ? json.error : "") || errorMessage;
        throw new FlowApiError(msg, extractIssues(json));
    }

    return json as T;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function fetchFlows(token: string): Promise<FlowSummary[]> {
    const res = await fetchWithTimeout(getFullUrl("/support/flows"), {
        headers: authHeaders(token),
    });
    const json = await handleResponse<{ data: FlowSummary[] }>(res, "Failed to load flows");
    return Array.isArray(json.data) ? json.data : [];
}

export async function fetchFlow(token: string, id: string): Promise<FlowDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}`), {
        headers: authHeaders(token),
    });
    const json = await handleResponse<{ data: FlowDetail }>(res, "Failed to load flow");
    return json.data;
}

export async function createFlow(token: string, data: CreateFlowRequest): Promise<FlowDetail> {
    const res = await fetchWithTimeout(getFullUrl("/support/flows"), {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(data),
    });
    const json = await handleResponse<{ data: FlowDetail }>(res, "Failed to create flow");
    return json.data;
}

/**
 * PUT /support/flows/{id} - partial update. Lenient: a draft with problems
 * still saves; problems come back in a `validation` array we surface as
 * warnings, so we unwrap both the flow and the advisory list defensively.
 */
export async function updateFlow(
    token: string,
    id: string,
    data: UpdateFlowRequest
): Promise<UpdateFlowResult> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}`), {
        method: "PUT",
        headers: jsonHeaders(token),
        body: JSON.stringify(data),
    });
    const json = await handleResponse<any>(res, "Failed to save flow");
    const payload = json.data ?? {};
    const flow: FlowDetail = payload.flow ?? payload;
    const rawValidation = payload.validation ?? json.validation ?? [];
    const validation: FlowValidationIssue[] = Array.isArray(rawValidation)
        ? rawValidation
              .map((item: any) =>
                  typeof item === "string"
                      ? { message: item }
                      : { node_id: item?.node_id ?? null, message: String(item?.message ?? "") }
              )
              .filter((item: FlowValidationIssue) => !!item.message)
        : [];
    return { flow, validation };
}

export async function validateFlow(token: string, id: string): Promise<FlowValidationResult> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}/validate`), {
        method: "POST",
        headers: jsonHeaders(token),
    });
    const json = await handleResponse<{ data: FlowValidationResult }>(res, "Failed to validate flow");
    return {
        valid: json.data?.valid ?? false,
        errors: Array.isArray(json.data?.errors) ? json.data.errors : [],
    };
}

/** Strict-validates server-side; a 4xx throws FlowApiError with `.issues`. */
export async function publishFlow(token: string, id: string): Promise<FlowDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}/publish`), {
        method: "POST",
        headers: jsonHeaders(token),
    });
    const json = await handleResponse<{ data: FlowDetail }>(res, "Failed to publish flow");
    return json.data;
}

export async function unpublishFlow(token: string, id: string): Promise<FlowDetail> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}/unpublish`), {
        method: "POST",
        headers: jsonHeaders(token),
    });
    const json = await handleResponse<{ data: FlowDetail }>(res, "Failed to unpublish flow");
    return json.data;
}

export async function deleteFlow(token: string, id: string): Promise<void> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}`), {
        method: "DELETE",
        headers: authHeaders(token),
    });
    await handleResponse<unknown>(res, "Failed to delete flow");
}

/**
 * Condense one simulated step's `detail` object into a short line for the
 * trace. The backend sends a per-node-type dict (minutes, priority, tag,
 * grounding, note, ...), so only the keys worth showing an author are
 * surfaced, in a stable order, and anything unrecognized is ignored rather
 * than dumped as JSON.
 */
function summarizeStepDetail(detail: unknown): string | null {
    if (typeof detail === "string") return detail.trim() || null;
    if (!detail || typeof detail !== "object") return null;
    const d = detail as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof d.minutes === "number") parts.push(`${d.minutes} menit`);
    if (typeof d.priority === "string") parts.push(`prioritas: ${d.priority}`);
    if (typeof d.tag === "string" && d.tag) parts.push(`tag: ${d.tag}`);
    if (typeof d.grounding === "string") parts.push(`sumber: ${d.grounding}`);
    if (Array.isArray(d.articles) && d.articles.length > 0) {
        parts.push(`${d.articles.length} artikel`);
    }
    if (typeof d.trigger === "string") parts.push(`trigger: ${d.trigger}`);
    if (typeof d.note === "string" && d.note) parts.push(d.note);
    return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * POST /support/flows/{id}/simulate - dry-run against the flow's SAVED graph
 * (unsaved studio changes are invisible to it; the studio saves first).
 * Unwraps defensively so a missing/odd field never crashes the panel.
 */
export async function simulateFlow(
    token: string,
    id: string,
    data: SimulateFlowRequest
): Promise<SimulateFlowResult> {
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}/simulate`), {
        method: "POST",
        headers: jsonHeaders(token),
        body: JSON.stringify(data),
    });
    const json = await handleResponse<{ data: any }>(res, "Failed to simulate flow");
    const payload = json.data ?? {};
    const steps: SimulateStep[] = Array.isArray(payload.steps)
        ? payload.steps
              .filter((s: any) => !!s && typeof s === "object")
              .map((s: any) => ({
                  node_id: String(s.node_id ?? ""),
                  node_type: String(s.node_type ?? "unknown"),
                  outcome: String(s.outcome ?? ""),
                  // The backend always sends `detail` as an OBJECT, so a
                  // string-only guard silently dropped it for every step.
                  // Summarize the human-useful keys instead.
                  detail: summarizeStepDetail(s.detail),
              }))
        : [];
    const wouldSend: { text: string }[] = Array.isArray(payload.would_send)
        ? payload.would_send
              .map((m: any) =>
                  typeof m === "string" ? { text: m } : { text: String(m?.text ?? "") }
              )
              .filter((m: { text: string }) => !!m.text)
        : [];
    return {
        steps,
        would_send: wouldSend,
        halted_reason:
            typeof payload.halted_reason === "string" && payload.halted_reason
                ? payload.halted_reason
                : null,
    };
}

export async function fetchFlowRuns(token: string, id: string, limit = 20): Promise<FlowRun[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    const res = await fetchWithTimeout(getFullUrl(`/support/flows/${id}/runs?${params.toString()}`), {
        headers: authHeaders(token),
    });
    const json = await handleResponse<{ data: any }>(res, "Failed to load flow runs");
    // The endpoint returns {data: {flow_id, runs: [...]}} - unwrap `runs`,
    // tolerating a bare array or a nested `data` fallback defensively.
    const outer = json.data ?? [];
    const list = Array.isArray(outer)
        ? outer
        : Array.isArray(outer?.runs)
          ? outer.runs
          : outer?.data;
    return Array.isArray(list) ? list : [];
}

/**
 * PATCH /omnichannels/accounts/{accountId}/automation-mode {mode}.
 * Flips one account between the legacy rule-bot/answer-bot and the flow
 * engine (mutually exclusive so a contact never gets double auto-replies).
 */
export async function updateAutomationMode(
    token: string,
    accountId: string,
    mode: AutomationMode
): Promise<void> {
    const res = await fetchWithTimeout(getFullUrl(`/omnichannels/accounts/${accountId}/automation-mode`), {
        method: "PATCH",
        headers: jsonHeaders(token),
        body: JSON.stringify({ mode }),
    });
    await handleResponse<unknown>(res, "Failed to update automation mode");
}
