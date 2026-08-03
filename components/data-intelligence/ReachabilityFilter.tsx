"use client";

interface ReachabilityFilterProps {
    hasPhone: boolean;
    hasDomain: boolean;
    excludeSaved: boolean;
    onChange: (values: { hasPhone: boolean; hasDomain: boolean; excludeSaved: boolean }) => void;
}

const OPTIONS: Array<{
    key: "hasPhone" | "hasDomain" | "excludeSaved";
    label: string;
}> = [
    { key: "hasPhone", label: "Has Phone Number" },
    { key: "hasDomain", label: "Has Website" },
    { key: "excludeSaved", label: "Exclude Already Saved" },
];

export default function ReachabilityFilter({
    hasPhone,
    hasDomain,
    excludeSaved,
    onChange,
}: ReachabilityFilterProps) {
    const values = { hasPhone, hasDomain, excludeSaved };

    const toggle = (key: "hasPhone" | "hasDomain" | "excludeSaved") => {
        onChange({ ...values, [key]: !values[key] });
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
                        d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.85 21 3 13.15 3 3.5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z"
                        fill="currentColor"
                        opacity="0.3"
                    />
                </svg>
                <h3 className="text-base font-semibold text-gray-800">Reachability</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {OPTIONS.map((option) => {
                    const isSelected = values[option.key];
                    return (
                        <button
                            key={option.key}
                            onClick={() => toggle(option.key)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                isSelected
                                    ? "bg-[#5479EE] text-white shadow-md"
                                    : "border border-[#5479EE] bg-white text-[#5479EE] hover:bg-[#DDE4FC]"
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
