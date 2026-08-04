import { Badge } from "@/components/ui/badge";
import { BroadcastTemplateApprovalStatus, BroadcastTemplateCategory } from "@/lib/types/whatsapp-marketing";

interface ApprovalStatusBadgeProps {
    status: BroadcastTemplateApprovalStatus;
}
export function TemplateApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
    let className = "";

    switch (status) {
        case "Not submitted":
            className = "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none";
            break;
        case "Received":
            className = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none";
            break;
        case "Pending":
            className = "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none";
            break;
        case "Approved":
            className = "bg-green-100 text-green-700 hover:bg-green-200 border-none";
            break;
        case "Rejected":
            className = "bg-red-100 text-red-700 hover:bg-red-200 border-none";
            break;
        case "Paused":
            className = "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none";
            break;
        case "Disabled":
            className = "bg-slate-200 text-slate-700 hover:bg-slate-300 border-none";
            break;
    }

    return (
        <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
            {status}
        </Badge>
    );
}

interface CategoryBadgeProps {
    category: BroadcastTemplateCategory | null;
}
export function TemplateCategoryBadge({ category }: CategoryBadgeProps) {
    if (!category) return null;
    return (
        <Badge
            className="rounded-full px-3 py-1 font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 border-none"
            variant="secondary"
        >
            {category}
        </Badge>
    );
}
