export type LeadStatus = "New" | "Contacted" | "Qualified" | "Unqualified";

export interface Lead {
  id: string;
  lead_name: string;
  lead_status: LeadStatus;
  lead_source: LeadSource;
  created_at: string;
  assigned_to: string;
  contact: Contact;
  user: User
  industry: string;
  company_size: string;
  office_location: string;
  tag: string;
  notes: string;
}
export interface Contact {
  id: string,
  name: string,
  email: string,
  phone_number: string,
  position: string,
  company: string,
  address: string,
  is_subscribed: boolean,
  created_at: string,
  updated_at: string,
  last_contacted?: {
    id: string,
    created_at: string,
    note: string
  },
  contact_notes: [
    {
      id: string,
      contact_id: string,
      user_fullname: string,
      note: string,
      created_at: string
    }
  ],
  contact_tasks: [
    {
      id: string,
      contact_id: string,
      assignee_id: string,
      user_fullname: string,
      task_name: string,
      description: string,
      due_date: string,
      priority: "Low" | "Medium" | "High",
      status: "todo" | "in_progress" | "done" | "archived",
      created_at: string,
      updated_at: string
    }
  ]
}
export interface Task {
  id: string;
  contact_id: string;
  assign_to: string;
  task_name: string;
  due_date: string;
  priority: "Low" | "Medium" | "High";
  user_fullname: string;
  created_at: string;
  assigned_to?: string;
  status?: "todo" | "in_progress" | "done" | "archived";
  description?: string;
  updated_at: string;
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
  id: string,
  title: string,
  content: string,
  reminder_date: string,
  reminder_time: string,
  contact_id: string,
  created_at: string,
  note: string,
  updated_at: string,
  user_fullname: string,
  user_id: string,
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
  phone_number: string;
  company: string | null;
  position: string;
  address: string | null;
}

export interface MailServer {
  id: string;
  name: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_encryption: "None" | "SSL/TLS" | "TLS(STARTTLS)";
  status: "Active" | "Inactive" | "Error";
  is_default: boolean;
  is_system_mail_server: boolean;
  priority?: number; // Optional as not in the provided example but was in my previous code
  attachment_limit_mb?: number; // Optional
  last_error?: string;
  last_tested_at?: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
  smtp_password?: string;
}

export type MailServerResponse = {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    mail_servers: MailServer[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export interface MailServerConnectionLog {
  id: string;
  mail_server_id: string;
  is_success: boolean;
  message: string;
  error_code?: string;
  created_at: string;
  updated_at: string;
}

export type MailServerConnectionLogResponse = {
  success: boolean;
  data: MailServerConnectionLog | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export type TestConnectionResponse = {
  success: boolean;
  data: {
    message: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};