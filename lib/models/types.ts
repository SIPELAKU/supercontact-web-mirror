export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Closed - Won" | "Closed - Lost";

export interface Lead {
  id: string;
  lead_name: string;
  lead_status: LeadStatus;
  lead_source: string;
  created_at: string;
  assigned_to: string;
  contact: Contact;
  user: User
}
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  last_contacted: LastContactedLeads;
  company: string;
  job_title: string;
  address: string;
} 
interface LastContactedLeads {
  id: string;
  created_at: string;
  note: string;
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

export interface Note {
    id: number,
    title:string,
    content: string,
    date: string,
    time: string,
}

export type SortOrder = "asc" | "desc" | "";

export interface BannerDashboardProps {
  title: string;
  breadcrumbs?: string[];
  pathname?: string;
}

export interface ContactReq {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  address: string;
} 