export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed - Won" | "Closed - Lost";

export interface Lead {
  id: string;
  lead_name: string;
  status: LeadStatus;
  source: string;
  assigned_to: string;
  last_contacted: string;
}

export type leadResponse = {
  success: boolean;
  data: {
    total: number;
    page: number;
    leads: Lead[];
  };
  error: string | null;
};
export type LeadSource = "Web Form" | "WhatsApp" | "Manual Entry";