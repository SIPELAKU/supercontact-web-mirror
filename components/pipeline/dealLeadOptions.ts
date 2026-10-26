import type { DealLead } from "@/lib/api/pipelines";

/** One lead in the deal form's Client/Account picker. */
export interface LeadOption {
  /** The lead id - unique even when one client has several leads. */
  value: string;
  /** The client's name, shown in the input once picked. */
  label: string;
  /** Second line in the list, telling apart several leads of one client. */
  detail: string;
  contactId: string;
  assignedTo: string;
  assigneeName: string;
}

export function toLeadOption(lead: DealLead): LeadOption {
  const assigneeName = lead.user?.fullname ?? "";
  return {
    value: lead.id,
    label: lead.contact?.name || lead.contact?.company || "Unnamed client",
    detail: [lead.lead_status, assigneeName && `Assigned to ${assigneeName}`]
      .filter(Boolean)
      .join(" · "),
    contactId: lead.contact_id,
    assignedTo: lead.assigned_to ?? "",
    assigneeName,
  };
}
