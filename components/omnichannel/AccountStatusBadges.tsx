import { Badge } from "@/components/ui/badge";
import { WhatsAppApprovalStatus } from "@/lib/types/omnichannel";

interface ActiveStatusBadgeProps {
  isActive: boolean;
}
export function ActiveStatusBadge({ isActive }: ActiveStatusBadgeProps) {
  const className = isActive
    ? "bg-green-100 text-green-700 hover:bg-green-200 border-none"
    : "bg-red-100 text-red-700 hover:bg-red-200 border-none";

  return (
    <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

const WHATSAPP_STATUS_LABELS: Record<WhatsAppApprovalStatus, string> = {
  pending_approval: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

interface WhatsAppStatusBadgeProps {
  status: WhatsAppApprovalStatus | null | undefined;
}
export function WhatsAppStatusBadge({ status }: WhatsAppStatusBadgeProps) {
  if (!status) return null;

  let className = "";
  switch (status) {
    case "approved":
      className = "bg-green-100 text-green-700 hover:bg-green-200 border-none";
      break;
    case "pending_approval":
      className = "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none";
      break;
    case "rejected":
      className = "bg-red-100 text-red-700 hover:bg-red-200 border-none";
      break;
  }

  return (
    <Badge className={`rounded-full px-3 py-1 font-medium ${className}`} variant="secondary">
      {WHATSAPP_STATUS_LABELS[status]}
    </Badge>
  );
}
