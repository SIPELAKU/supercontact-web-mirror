export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed - Won" | "Closed - Lost";

export interface Lead {
  id: string;
  lead_name: string;
  lead_status: LeadStatus;
  lead_source: string;
  created_at: string;
  assigned_to: string;
  last_contacted: string;
  contact: Contact;
  user: User
}
interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
} 
interface User {
  id: string;
  fullname: string; 
  email: string;
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

export type BannerDashboardProps = {
  pathname: string
}

export interface Contact {
    id: number,
    name: string,
    email: string,
    phone: string,
    posisi: string,
    company: string,
}

export interface Note {
    id: number,
    title:string,
    content: string,
    date: string,
    time: string,
}

export type SortOrder = "asc" | "desc" | "";