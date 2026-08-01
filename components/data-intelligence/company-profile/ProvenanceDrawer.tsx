"use client";

import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import { X, Info } from "lucide-react";
import { GoogleAttributionTag } from "@/components/data-intelligence/GoogleAttributionTag";
import { TIER_LABELS } from "@/components/data-intelligence/ConfidenceBadge";
import { CompanyProfile360 } from "@/lib/types/company-intelligence";

interface ProvenanceDrawerProps {
    open: boolean;
    onClose: () => void;
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

// B5 compliance-lite: pure frontend consumer of A2's per-field provenance -
// no new backend, just surfaces field_provenance (already returned on both
// search and saved profiles) so a user can see where each field came from
// and when it was collected.
export default function ProvenanceDrawer({ open, onClose, fieldProvenance }: ProvenanceDrawerProps) {
    const entries = Object.entries(fieldProvenance || {});

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <div className="w-[380px] max-w-[90vw] h-full flex flex-col">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Data Sources</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Where each field on this profile came from</p>
                    </div>
                    <IconButton size="small" onClick={onClose}>
                        <X size={18} />
                    </IconButton>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-center text-sm text-gray-400 py-12">
                            <Info size={24} />
                            No per-field source data recorded for this company yet.
                        </div>
                    ) : (
                        entries.map(([field, info]) => (
                            <div key={field} className="rounded-lg border border-gray-200 p-3">
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
                        ))
                    )}
                </div>
            </div>
        </Drawer>
    );
}
