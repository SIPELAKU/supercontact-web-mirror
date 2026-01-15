// Type definitions for Email Marketing module

export interface Subscriber {
  id: number;
  email: string;
  name?: string;
  company_name?: string;
  x_studio_owner_id?: [number, string];
  list_ids?: number[];
}

export interface Campaign {
  id: number;
  subject: string;
  state: 'draft' | 'in_queue' | 'sending' | 'done' | 'canceled';
  sent_date?: string;
  delivered: number;
  opened: number;
  x_studio_owner_id?: [number, string];
}

export interface CampaignDetail extends Campaign {
  body_html?: string;
  total?: number;
  sent?: number;
  failed?: number;
  received_ratio?: number;
  opened_ratio?: number;
  clicked?: number;
  bounced?: number;
  mail_template_id?: [number, string];
  contact_list_ids?: RecipientDetail[];
  mailing_domain_contacts?: RecipientDetail[];
  mail_server_id?: [number, string];
}

export interface RecipientDetail {
  id: number;
  name: string;
}

export interface MailingList {
  id: number;
  name: string;
  contact_count: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
}

export interface MailServer {
  id: number;
  name: string;
  x_studio_last_test_status: 'success' | 'failed' | 'none';
}
