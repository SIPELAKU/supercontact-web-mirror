"use client";

import { X } from "lucide-react";
import { FilterCriteria, DEFAULT_FILTER_CRITERIA } from "@/lib/types/IndustryLeader";
import { TIER_LABELS } from "@/components/data-intelligence/ConfidenceBadge";

interface Chip {
    key: string;
    label: string;
    onRemove: () => void;
}

function buildChips(
    criteria: FilterCriteria,
    onChange: (c: FilterCriteria) => void,
    mode: "discover" | "saved"
): Chip[] {
    const chips: Chip[] = [];

    criteria.industries.forEach((industry) =>
        chips.push({
            key: `industry-${industry}`,
            label: industry,
            onRemove: () =>
                onChange({ ...criteria, industries: criteria.industries.filter((i) => i !== industry) }),
        })
    );
    criteria.locations.forEach((location) =>
        chips.push({
            key: `location-${location}`,
            label: location,
            onRemove: () =>
                onChange({ ...criteria, locations: criteria.locations.filter((l) => l !== location) }),
        })
    );

    if (mode === "discover") {
        criteria.kabupaten.forEach((kabupaten) =>
            chips.push({
                key: `kabupaten-${kabupaten}`,
                label: kabupaten,
                onRemove: () =>
                    onChange({ ...criteria, kabupaten: criteria.kabupaten.filter((k) => k !== kabupaten) }),
            })
        );
        const defaultRange = DEFAULT_FILTER_CRITERIA.employeeRange;
        if (
            criteria.employeeRange.min !== defaultRange.min ||
            criteria.employeeRange.max !== defaultRange.max
        ) {
            chips.push({
                key: "employee-range",
                label: `${criteria.employeeRange.min}-${criteria.employeeRange.max} employees`,
                onRemove: () => onChange({ ...criteria, employeeRange: defaultRange }),
            });
        }
        criteria.financialStatuses.forEach((status) =>
            chips.push({
                key: `status-${status}`,
                label: status,
                onRemove: () =>
                    onChange({
                        ...criteria,
                        financialStatuses: criteria.financialStatuses.filter((s) => s !== status),
                    }),
            })
        );
        if (criteria.hasPhone) {
            chips.push({ key: "has-phone", label: "Has Phone", onRemove: () => onChange({ ...criteria, hasPhone: false }) });
        }
        if (criteria.hasDomain) {
            chips.push({ key: "has-domain", label: "Has Website", onRemove: () => onChange({ ...criteria, hasDomain: false }) });
        }
        if (criteria.excludeSaved) {
            chips.push({
                key: "exclude-saved",
                label: "Exclude Already Saved",
                onRemove: () => onChange({ ...criteria, excludeSaved: false }),
            });
        }
        if (criteria.minConfidence) {
            chips.push({
                key: "min-confidence",
                label: `Min: ${TIER_LABELS[criteria.minConfidence] || criteria.minConfidence}`,
                onRemove: () => onChange({ ...criteria, minConfidence: null }),
            });
        }
    }

    return chips;
}

interface ActiveFilterChipsProps {
    mode: "discover" | "saved";
    filterCriteria: FilterCriteria;
    onChange: (criteria: FilterCriteria) => void;
}

// Removable chips summarizing whatever's active in CompanyFilterRail -
// lets a user see and undo filters without opening the rail, and answers
// "why am I seeing these results" at a glance.
export default function ActiveFilterChips({ mode, filterCriteria, onChange }: ActiveFilterChipsProps) {
    const chips = buildChips(filterCriteria, onChange, mode);
    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
                <button
                    key={chip.key}
                    onClick={chip.onRemove}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FD] px-3 py-1 text-xs font-medium text-[#5479EE] hover:bg-[#DDE4FC]"
                >
                    {chip.label}
                    <X size={12} />
                </button>
            ))}
            <button
                onClick={() => onChange(DEFAULT_FILTER_CRITERIA)}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 hover:underline"
            >
                Clear all
            </button>
        </div>
    );
}
