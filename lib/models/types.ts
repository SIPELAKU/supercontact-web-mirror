export type LeadStatus = "New" | "Contacted" | "Qualified" | "Unqualified";

export interface Lead {
  id: string;
  lead_name: string;
  lead_status: LeadStatus;
  lead_source: LeadSource;
  created_at: string;
  assigned_to: string;
  // Nullable at runtime: a lead's contact can be SET NULL when the contact is
  // deleted, and an unassigned lead has no user. The UI must guard both.
  contact: Contact | null;
  user: User | null;
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
  is_subscriber: boolean,
  is_recipient: boolean,
  custom_fields?: Record<string, string>,
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
  ],
  mailing_lists?: { id: string; name: string }[],
  broadcast_groups?: { id: string; name: string }[],
  conversations?: {
    id: string;
    channel_type: "whatsapp" | "sms" | "email" | "web_widget";
    status: "open" | "closed" | "archived";
    last_message_at: string | null;
    last_message_preview: string | null;
  }[],
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
  custom_fields?: Record<string, string>;
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
  from_email?: string;
  smtp_region?: string;
  limit_per_minute?: number;
  limit_per_hour?: number;
  limit_per_day?: number;
  limit_per_month?: number;
}

/** The platform's own sender, offered to a tenant as a read-only choice.
 *  Carries no credentials on purpose - only what recipients will see. It is
 *  changed in the backoffice, never here. */
export type PlatformSenderOption = {
  available: boolean;
  selected: boolean;
  provider_label: string;
  from_email: string;
  from_name: string | null;
};

export type MailServerResponse = {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    mail_servers: MailServer[];
    platform_sender?: PlatformSenderOption | null;
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

export type IntegrationProvider =
    | "google_maps"
    | "llm_groq"
    | "llm_openai"
    | "llm_anthropic"
    | "social_firmographic"
    // B6: pluggable adapter stubs - reserved in the schema, no client wired
    // up yet (see supercontact-api's app/clients/{ahu_oss_npwp,
    // whatsapp_business,meta_graph}_client.py).
    | "ahu_oss_npwp"
    | "whatsapp_business"
    | "meta_graph";

export interface Integration {
  id: string;
  company_id: string;
  provider: IntegrationProvider;
  status: "Active" | "Inactive" | "Error";
  config?: Record<string, any> | null;
  api_key?: string;
  created_at: string;
  updated_at: string;
}

export type IntegrationListResponse = {
  success: boolean;
  data: {
    providers: Integration[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export type IntegrationResponse = {
  success: boolean;
  data: Integration;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export interface IntegrationConnectionLog {
  id: string;
  company_data_provider_id: string;
  is_success: boolean;
  message: string;
  error_code?: string;
  created_at: string;
  updated_at: string;
}

export type IntegrationConnectionLogResponse = {
  success: boolean;
  data: IntegrationConnectionLog | null;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
export type SmartCaptureStatus = "Draft" | "Active" | "Inactive" | "Archived";
export type SmartCaptureTarget = "email" | "whatsapp";

export interface LogStats {
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  simulated: number;
}

export interface SmartCapture {
  id: string;
  company_id: string;
  name: string;
  email_subject?: string;
  email_body?: string;
  form_title?: string;
  form_description?: string;
  target: SmartCaptureTarget;
  content_template?: string;
  status: SmartCaptureStatus;
  code: string;
  views: number;
  valid_leads: number;
  conversions: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  mail_sender_id?: string;
  mail_server_id?: string;
  files?: SmartCaptureFile[];
  form_fields?: FormField[];
  log_stats?: LogStats;
}

export interface SmartCaptureDetail extends SmartCapture {
  files: SmartCaptureFile[];
  form_fields: FormField[];
}

export interface SmartCaptureStats {
  total_views: number;
  total_valid_leads: number;
  total_conversions: number;
}

export type SmartCaptureResponse = {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    smart_captures: SmartCapture[];
    stats?: SmartCaptureStats;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export interface FormField {
  id?: string;
  smart_capture_id?: string;
  type?: string; // For creation payload
  field_type?: string; // For detail response
  name: string;
  label: string;
  required: boolean;
  sort_order: number;
  options?: string[];
  sorting_id?: string;
}

export interface SmartCaptureCreateReq {
  name: string;
  action: 'draft' | 'publish';
  email_subject?: string;
  email_body?: string;
  form_title?: string;
  form_description?: string;
  target?: SmartCaptureTarget;
  content_template?: string;
  file_ids?: string[];
  mail_sender_id?: string;
  mail_server_id?: string;
  form_fields?: FormField[];
}

export interface SmartCaptureUpdateReq extends Partial<Omit<SmartCaptureCreateReq, 'action'>> {
  action: 'draft' | 'publish';
}

export interface SmartCaptureFile {
  id: string;
  external_file_id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  sort_order: number;
}

export type SmartCaptureCreateResponse = {
  success: boolean;
  data: SmartCapture;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export type SmartCaptureDetailResponse = {
  success: boolean;
  data: SmartCapture;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export type SmartCaptureFileUploadResponse = {
  success: boolean;
  data: {
    files: SmartCaptureFile[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export interface PublicFormFieldValue {
  name: string;
  value: string;
}

export interface SmartCapturePublicSubmitReq {
  fields: PublicFormFieldValue[];
}

export type SmartCapturePublicSubmitResponse = {
  success: boolean;
  data: {
    id: string;
    smart_capture_id: string;
    fullname: string;
    email: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
export type EmailStatus = "pending" | "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed" | "unknown";
export type PhoneStatus = "valid" | "invalid" | "unknown";

export interface SmartCaptureSubmission {
  id: string;
  smart_capture_id: string;
  name: string;
  email: string;
  phone_number: string;
  custom_fields: Record<string, any>;
  phone_status: PhoneStatus;
  email_status: EmailStatus;
  error_message?: string;
  captured_at: string;
}

export type SmartCaptureSubmissionsResponse = {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    submissions: SmartCaptureSubmission[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};
