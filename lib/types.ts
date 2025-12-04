export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed-Won" | "Closed-Lost";

export interface Lead {
  id: string;
  name: string;
  status: LeadStatus;
  source: string;
  assignedTo: string;
  lastContacted: string;
}

export type LeadSource = "Web Form" | "WhatsApp" | "Manual Entry";