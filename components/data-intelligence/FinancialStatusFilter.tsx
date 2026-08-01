"use client";

import { FinancialStatus } from "@/lib/types/IndustryLeader";

interface FinancialStatusFilterProps {
    selectedStatuses: FinancialStatus[];
    onChange: (statuses: FinancialStatus[]) => void;
}

const STATUS_OPTIONS: FinancialStatus[] = [
    "Profitable",
    "Series A",
    "Series B",
    "Series C",
    "IPO",
];

export default function FinancialStatusFilter({
    selectedStatuses,
    onChange,
}: FinancialStatusFilterProps) {
    const toggleStatus = (status: FinancialStatus) => {
        if (selectedStatuses.includes(status)) {
            onChange(selectedStatuses.filter((s) => s !== status));
        } else {
            onChange([...selectedStatuses, status]);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-[#5479EE]"
                >
                    <path
                        d="M3 13h4v8H3v-8zm6-10h4v18H9V3zm6 6h4v12h-4V9z"
                        fill="currentColor"
                        opacity="0.3"
                    />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">
                    Financial Status (Reference-Based)
                </h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {STATUS_OPTIONS.map((status) => {
                    const isSelected = selectedStatuses.includes(status);
                    return (
                        <button
                            key={status}
                            onClick={() => toggleStatus(status)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${isSelected
                                    ? "bg-[#5479EE] text-white shadow-md"
                                    : "border border-[#5479EE] bg-white text-[#5479EE] hover:bg-[#DDE4FC]"
                                }`}
                        >
                            {status}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
