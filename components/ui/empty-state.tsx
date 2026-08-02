import { LucideIcon } from "lucide-react";
import { AppButton } from "./app-button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    className?: string;
}

// Shared empty-state treatment (icon + title + description + optional CTA)
// in a dashed-border box - previously every page hand-rolled its own,
// and any SuperTable that didn't pass explicit copy fell back to MRT's
// Indonesian-language defaults in an otherwise English UI. Pass this via
// SuperTable's `renderEmptyState` prop, or render directly for non-table
// empty states.
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-12 text-center",
                className
            )}
        >
            {Icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                    <Icon size={22} />
                </div>
            )}
            <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-700">{title}</p>
                {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
            {action && (
                <AppButton
                    variantStyle="outline"
                    onClick={action.onClick}
                    startIcon={action.icon}
                    className="mt-1"
                >
                    {action.label}
                </AppButton>
            )}
        </div>
    );
}
