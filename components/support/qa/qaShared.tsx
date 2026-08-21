"use client";

// Shared bits for the QA review surface (Phase 8D): status pill, score bar,
// pct tone mapping, and the reviewed-agent picker (reuses the same
// /tickets/assignable-agents source the participants panel uses).

import { useState } from "react";
import { AppAutocomplete } from "@/components/ui/app-autocomplete";
import { useAssignableAgents } from "@/lib/hooks/useTickets";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { QaReviewStatus } from "@/lib/api/qa";

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------
export const pct = (score: number, max: number): number =>
    max > 0 ? Math.max(0, Math.min(100, Math.round((score / max) * 100))) : 0;

/** Traffic-light tone for a 0-100 percentage. */
export function pctTone(value: number): { bar: string; badge: string } {
    if (value >= 80) return { bar: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" };
    if (value >= 50) return { bar: "bg-amber-500", badge: "bg-amber-50 text-amber-700" };
    return { bar: "bg-red-500", badge: "bg-red-50 text-red-700" };
}

export function ScoreBar({ value, className }: { value: number; className?: string }) {
    const tone = pctTone(value);
    return (
        <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-gray-100", className)}>
            <div
                className={cn("h-full rounded-full transition-all", tone.bar)}
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export function PctBadge({ value }: { value: number }) {
    const tone = pctTone(value);
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
                tone.badge
            )}
        >
            {value}%
        </span>
    );
}

const STATUS_META: Record<QaReviewStatus, { label: string; pill: string }> = {
    draft: { label: "Draft", pill: "bg-gray-100 text-gray-600" },
    published: { label: "Published", pill: "bg-emerald-50 text-emerald-700" },
};

export function ReviewStatusPill({ status }: { status: QaReviewStatus }) {
    const meta = STATUS_META[status] ?? STATUS_META.draft;
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                meta.pill
            )}
        >
            {meta.label}
        </span>
    );
}

export const SUBJECT_TYPE_LABEL: Record<string, string> = {
    ticket: "Ticket",
    conversation: "Conversation",
};

// ---------------------------------------------------------------------------
// Agent picker
// ---------------------------------------------------------------------------
export interface QaAgentOption {
    id: string;
    name: string;
}

interface AutocompleteOption {
    value: string;
    label: string;
}

/** Searchable agent picker backed by /tickets/assignable-agents (same source
 *  the ticket participants panel uses). Controlled by {id, name} | null so a
 *  preselected agent renders its name even before the option list loads. */
export function QaAgentPicker({
    value,
    onChange,
    placeholder = "Select an agent",
    disabled,
}: {
    value: QaAgentOption | null;
    onChange: (agent: QaAgentOption | null) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    const [query, setQuery] = useState("");
    const search = useDebounce(query, 300);
    const { data: agentData, isFetching } = useAssignableAgents(search);
    const agents: { id: string; fullname: string }[] = agentData?.data || [];

    const options: AutocompleteOption[] = agents.map((a) => ({ value: a.id, label: a.fullname }));
    const currentValue: AutocompleteOption | null = value
        ? options.find((o) => o.value === value.id) || { value: value.id, label: value.name }
        : null;

    return (
        <AppAutocomplete
            isBgWhite
            options={options}
            placeholder={placeholder}
            value={currentValue}
            onChange={(_e: unknown, newValue: unknown) => {
                const opt = newValue as AutocompleteOption | null;
                onChange(opt ? { id: opt.value, name: opt.label } : null);
            }}
            onInputChange={(_e: unknown, inputValue: string) => setQuery(inputValue)}
            loading={isFetching}
            disabled={disabled}
        />
    );
}
