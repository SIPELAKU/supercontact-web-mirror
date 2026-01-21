// Type definitions for Email Marketing module

// Subscriber/Contact types
export interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  position: string;
  company: string;
  address: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscribersResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    contacts: Subscriber[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateSubscriberData {
  target: 'subscriber' | 'mailing_list';
  type_request: 'manual' | 'import';
  new_contact?: {
    name: string;
    email: string;
    phone_number: string;
    position: string;
    company: string;
    address: string;
  };
  contact_ids?: string[];
  mailing_list_ids?: string[];
}

export interface CreateSubscriberResponse {
  success: boolean;
  data: {
    subscriber_count: number;
    subscribers: Subscriber[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface DeleteSubscriberResponse {
  success: boolean;
  data: {
    id: string;
    deleted: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Mailing List types
export interface MailingList {
  id: string;
  name: string;
  subscriber_count: number;
  created_at: string;
  updated_at: string;
}

export interface MailingListsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    mailing_lists: MailingList[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface MailingListDetailResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    subscriber_count: number;
    created_at: string;
    updated_at: string;
    subscribers: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
      contacts: Subscriber[];
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateMailingListData {
  name: string;
}

export interface UpdateMailingListData {
  name: string;
}

// Campaign types
export interface Campaign {
  id: string;
  user_fullname: string;
  subject: string;
  html_content: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignsResponse {
  success: boolean;
  data: {
    campaigns: Campaign[];
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CampaignDetailResponse {
  success: boolean;
  data: Campaign;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface CreateCampaignData {
  recipient_source: 'mailing_list' | 'contact';
  subject: string;
  html_content: string;
  action: 'send' | 'draft';
  contact_ids?: string[];
  mailing_list_ids?: string[];
}

export interface UpdateCampaignData {
  recipient_source: 'mailing_list' | 'contact';
  subject: string;
  html_content: string;
  action: 'send' | 'draft';
  contact_ids?: string[];
  mailing_list_ids?: string[];
}

export interface Contact {
  id: number;
  name: string;
  email: string;
}
