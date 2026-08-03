"use client";

import { CONFIDENCE_TIERS_ASCENDING, TIER_LABELS } from "@/components/data-intelligence/ConfidenceBadge";

interface ConfidenceFilterProps {
    minConfidence: string | null;
    onChange: (minConfidence: string | null) => void;
}

export default function ConfidenceFilter({ minConfidence, onChange }: ConfidenceFilterProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#5479EE]">
                    <path
                        d="M12 2l2.4 6.9L21 9.3l-5.5 4.6L17.3 21 12 17l-5.3 4 1.8-7.1L3 9.3l6.6-.4z"
                        fill="currentColor"
                        opacity="0.3"
                    />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Minimum Confidence</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {CONFIDENCE_TIERS_ASCENDING.map((tier) => {
                    const isSelected = minConfidence === tier;
                    return (
                        <button
                            key={tier}
                            onClick={() => onChange(isSelected ? null : tier)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                isSelected
                                    ? "bg-[#5479EE] text-white shadow-md"
                                    : "border border-[#5479EE] bg-white text-[#5479EE] hover:bg-[#DDE4FC]"
                            }`}
                        >
                            {TIER_LABELS[tier] ?? tier}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
