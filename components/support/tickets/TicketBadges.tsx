import { Badge } from "@/components/ui/badge";
import { TicketPriority, TicketStatus } from "@/lib/types/Ticket";

interface StatusBadgeProps {
    status: TicketStatus;
}
export function TicketStatusBadge({ status }: StatusBadgeProps) {
    let variant = "secondary";
    let className = "";

    switch (status) {
        case "Open":
            className = "bg-blue-100 text-blue-700 hover:bg-blue-200 border-none";
            break;
        case "Pending":
            className = "bg-amber-100 text-amber-800 hover:bg-amber-200 border-none";
            break;
        case "On-hold":
            className = "bg-slate-100 text-slate-700 hover:bg-slate-200 border-none";
            break;
        case "In Progress":
            className = "bg-green-100 text-green-700 hover:bg-green-200 border-none";
            break;
        case "Solved":
            className = "bg-emerald-600 text-white hover:bg-emerald-700 border-none";
            break;
        case "Closed":
            className = "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none";
            break;
    }

    return (
        <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
            {status}
        </Badge>
    );
}

interface PriorityBadgeProps {
    priority: TicketPriority;
}
export function TicketPriorityBadge({ priority }: PriorityBadgeProps) {
    let className = "";

    switch (priority) {
        case "Urgent":
            className = "bg-red-600 text-white hover:bg-red-700 border-none";
            break;
        case "High":
            className = "bg-red-100 text-red-700 hover:bg-red-200 border-none";
            break;
        case "Medium":
            className = "bg-orange-100 text-orange-700 hover:bg-orange-200 border-none";
            break;
        case "Low":
            className = "bg-blue-50 text-blue-600 hover:bg-blue-100 border-none";
            break;
    }

    return (
        <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
            {priority}
        </Badge>
    );
}

// Re-export both from a single file or keep them here if small enough
