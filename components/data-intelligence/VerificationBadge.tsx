import { AlertTriangle, CheckCircle2, HelpCircle, XCircle, LucideIcon } from "lucide-react";

interface VerificationBadgeProps {
    status?: string | null;
    checkedAt?: string | null;
    lineType?: string | null;
    className?: string;
}

const STATUS_LABELS: Record<string, string> = {
    valid: "Valid",
    invalid: "Invalid",
    risky: "Risky",
    unknown: "Unknown",
};

const STATUS_CLASSNAMES: Record<string, string> = {
    valid: "bg-emerald-50 text-emerald-700",
    invalid: "bg-rose-50 text-rose-700",
    risky: "bg-amber-50 text-amber-700",
    unknown: "bg-gray-100 text-gray-600",
};

const STATUS_ICONS: Record<string, LucideIcon> = {
    valid: CheckCircle2,
    invalid: XCircle,
    risky: AlertTriangle,
    unknown: HelpCircle,
};

export function statusLabel(status?: string | null): string {
    if (!status) return "Unverified";
    return STATUS_LABELS[status] ?? STATUS_LABELS.unknown;
}

export function VerificationBadge({ status, checkedAt, lineType, className }: VerificationBadgeProps) {
    const label = statusLabel(status);
    const Icon = status ? STATUS_ICONS[status] ?? STATUS_ICONS.unknown : null;
    const colorClasses = status
        ? STATUS_CLASSNAMES[status] ?? STATUS_CLASSNAMES.unknown
        : "bg-gray-50 text-gray-400";
    const title = checkedAt
        ? `Verified ${new Date(checkedAt).toLocaleDateString("id-ID")}${lineType ? ` · ${lineType}` : ""}`
        : undefined;

    return (
        <span
            title={title}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${colorClasses} ${className ?? ""}`}
        >
            {Icon && <Icon size={12} className="shrink-0" />}
            {label}
        </span>
    );
}
