// How a broadcast's status looks: the same chip in the Broadcasting WA list
// and in the stats modal. The API's statuses are Draft, In Queue, Sent and
// Failed; Sending, Done and Completed are kept for older data.

export type BroadcastStatusColor = "default" | "primary" | "success" | "warning" | "error";

export function broadcastStatusChip(status: string | null | undefined): { label: string; color: BroadcastStatusColor } {
  switch ((status ?? "").trim().toLowerCase()) {
    case "draft":
      return { label: "Draft", color: "default" };
    case "in queue":
      return { label: "In Queue", color: "warning" };
    case "sending":
      return { label: "Sending", color: "primary" };
    case "sent":
    case "done":
    case "completed":
      return { label: "Sent", color: "success" };
    case "failed":
      return { label: "Failed", color: "error" };
    default:
      return { label: status || "-", color: "default" };
  }
}
