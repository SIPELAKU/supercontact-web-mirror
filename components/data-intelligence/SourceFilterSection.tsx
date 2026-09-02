"use client";

import { SOURCE_GROUP_OPTIONS } from "@/lib/data/source-groups";

interface SourceFilterSectionProps {
    // EXACT source values (google_maps, serpapi, ...) - the workspace keeps
    // these in FilterCriteria.sourcesSaved and sends them verbatim as the
    // `sources` query param of GET /my-target-companies.
    selectedSources: string[];
    onChange: (sources: string[]) => void;
}

// Saved-tab "Source" facet: the user picks display GROUPS (Maps, Web, AI,
// Import, ...), never raw provider identifiers - each pick toggles that
// group's whole set of exact values in/out of the selection.
export default function SourceFilterSection({
    selectedSources,
    onChange,
}: SourceFilterSectionProps) {
    const isGroupSelected = (values: string[]) =>
        values.some((value) => selectedSources.includes(value));

    const toggleGroup = (values: string[]) => {
        if (isGroupSelected(values)) {
            onChange(selectedSources.filter((s) => !values.includes(s)));
        } else {
            // De-dupe defensively - a value can only enter via its group, but
            // a hand-edited `f` URL param could hold partial overlaps.
            onChange([
                ...selectedSources.filter((s) => !values.includes(s)),
                ...values,
            ]);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            {SOURCE_GROUP_OPTIONS.map((option) => {
                const isSelected = isGroupSelected(option.values);
                const Icon = option.icon;
                return (
                    <button
                        key={option.label}
                        onClick={() => toggleGroup(option.values)}
                        title={option.values.join(", ")}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                                ? "bg-[#5479EE] text-white shadow-md"
                                : "border border-[#5479EE] bg-white text-[#5479EE] hover:bg-[#DDE4FC]"
                        }`}
                    >
                        <Icon size={13} className="shrink-0" />
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
