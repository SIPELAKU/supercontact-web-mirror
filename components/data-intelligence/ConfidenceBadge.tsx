import { Badge } from "@/components/ui/badge";

export type ConfidenceTier = "verified" | "high" | "medium" | "low" | "manual" | string;

interface ConfidenceBadgeProps {
    tier?: ConfidenceTier | null;
}

const TIER_LABELS: Record<string, string> = {
    verified: "Verified",
    high: "High Confidence",
    medium: "Medium Confidence",
    low: "Low Confidence",
    manual: "Manually Added",
};

const TIER_CLASSNAMES: Record<string, string> = {
    verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none",
    high: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none",
    medium: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none",
    low: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-none",
    manual: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none",
};

export function ConfidenceBadge({ tier }: ConfidenceBadgeProps) {
    if (!tier || !TIER_LABELS[tier]) return null;

    return (
        <Badge
            className={`rounded-full px-3 py-1 font-medium ${TIER_CLASSNAMES[tier]}`}
            variant="secondary"
        >
            {TIER_LABELS[tier]}
        </Badge>
    );
}
