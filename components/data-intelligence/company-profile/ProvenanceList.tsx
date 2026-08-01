"use client";

import { Info } from "lucide-react";
import { GoogleAttributionTag } from "@/components/data-intelligence/GoogleAttributionTag";
import { TIER_LABELS } from "@/components/data-intelligence/ConfidenceBadge";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface ProvenanceListProps {
    fieldProvenance: CompanyProfile360["fieldProvenance"];
}

const FIELD_LABELS: Record<string, string> = {
    name: "Company Name",
    domain: "Domain",
    location: "Location",
    phone: "Phone",
    employee_count: "Employee Count",
    industry: "Industry",
    financial_status: "Financial Status",
    description: "Description",
};

const SOURCE_LABELS: Record<string, string> = {
    manual: "Manually entered",
    google_maps: "Google Maps",
    serpapi_with_domain: "Web search (domain-verified)",
    serpapi: "Web search",
    llm: "AI-inferred",
    groq: "AI-inferred",
};

// D3: was ProvenanceDrawer (a 380px slide-out) - now the Company 360
// profile's "Sources" tab content directly, full width and one click
// closer (no longer behind a small "View data sources" text link).
export default function ProvenanceList({ fieldProvenance }: ProvenanceListProps) {
    const entries = Object.entries(fieldProvenance || {});

    if (entries.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400">
                <Info size={24} />
                No per-field source data recorded for this company yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map(([field, info]) => (
                <div key={field} className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                            {FIELD_LABELS[field] || field}
                        </span>
                        {info?.confidence && TIER_LABELS[info.confidence] && (
                            <span className="text-[10px] uppercase tracking-wide text-gray-400">
                                {TIER_LABELS[info.confidence]}
                            </span>
                        )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-500">
                        <span>{SOURCE_LABELS[info?.source || ""] || info?.source || "Unknown source"}</span>
                        <GoogleAttributionTag source={info?.source} />
                    </div>
                    {info?.collected_at && (
                        <p className="mt-1 text-[11px] text-gray-400">
                            Collected {new Date(info.collected_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
