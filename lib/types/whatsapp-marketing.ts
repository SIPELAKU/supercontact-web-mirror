// lib/types/whatsapp-marketing.ts

export type WaRecipientType = 'subscribers' | 'whatsapp';
export type WaRecipientSortBy = 'name' | 'created_at';
export type WaRecipientSortOrder = 'asc' | 'desc';

export interface WaRecipient {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  position: string;
  company: string;
  address: string;
  recipient_type: WaRecipientType;
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WaRecipientsParams {
  recipient_type: WaRecipientType;
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: WaRecipientSortBy;
  sort_order?: WaRecipientSortOrder;
}

export interface WaRecipientsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    recipients: WaRecipient[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CreateWaRecipientData {
  target: 'recipient' | 'broadcast_group';
  type_request: 'manual' | 'from_contacts';
  new_contact?: {
    name?: string;
    email?: string;
    phone_number?: string;
    position?: string;
    company?: string;
    address?: string;
    custom_fields?: Record<string, unknown>;
  };
  contact_ids?: string[];
  broadcast_group_ids?: string[];
}

export interface UpdateWaRecipientData {
  name?: string;
  email?: string;
  phone_number?: string;
  position?: string;
  company?: string;
  address?: string;
  custom_fields?: Record<string, unknown>;
}


export interface GroupBroadcast {
  id: string;
  name: string;
  recipient_count: number;
  created_at: string;
  updated_at: string;
}

export interface GroupBroadcastsParams {
  page?: number;
  limit?: number;
}

export interface GroupBroadcastsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    broadcast_groups: GroupBroadcast[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
export interface BulkCreateWaRecipientData {
  target: 'recipient' | 'broadcast_group';
  new_contacts: Array<{
    name: string;
    email?: string;
    phone_number?: string;
    position?: string;
    company?: string;
    address?: string;
    custom_fields?: Record<string, unknown>;
    [key: string]: any;
  }>;
  broadcast_group_ids?: string[];
}

export interface BulkCreateWaRecipientResponse {
  success: boolean;
  data?: {
    recipient_count: number;
    recipients: WaRecipient[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CreateGroupBroadcastData {
  name: string;
}

export interface DuplicateGroupBroadcastsData {
  broadcast_group_ids: string[];
}

export interface DeleteGroupBroadcastsData {
  broadcast_group_ids: string[];
}

export interface GroupBroadcastDetail {
  id: string;
  name: string;
  recipient_count: number;
  created_at: string;
  updated_at: string;
  recipients: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    recipients: WaRecipient[];
  };
}

export interface GroupBroadcastDetailResponse {
  success: boolean;
  data: GroupBroadcastDetail;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface CreateBroadcastData {
  name: string;
  template_id: string | null;
  action: 'draft' | 'send';
  recipient_source: 'recipient' | 'broadcast_group';
  broadcast_group_ids?: string[];
  contact_ids?: string[];
  variables: Record<string, string>;
}

export interface BroadcastCampaign {
  id: string;
  user_fullname: string;
  name: string;
  status: string;
  total_target: number;
  account_id: string;
  template_id: string;
  template_content?: {
    provider_content_sid: string;
    friendly_name: string;
    language: string;
    variables: Record<string, any>;
    types: Record<string, any>;
  };
  recipient_source: 'recipient' | 'broadcast_group';
  broadcast_group_ids: string[];
  contact_ids: string[];
  variables: Record<string, any>;
  sent_at: string;
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BroadcastsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    broadcasts: BroadcastCampaign[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface GroupBroadcastCampaignsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    broadcasts: BroadcastCampaign[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface BroadcastTemplate {
  id: string;
  provider_content_sid: string;
  friendly_name: string;
  language: string;
  variables: Record<string, any>;
  types: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BroadcastTemplatesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface BroadcastTemplatesResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    templates: BroadcastTemplate[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface DuplicateBroadcastTemplatesData {
  template_ids: string[];
}

export interface BroadcastTemplateDetailResponse {
  success: boolean;
  data: BroadcastTemplate;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type BroadcastTemplateType =
  | 'twilio/text'
  | 'twilio/media'
  | 'twilio/location'
  | 'twilio/list-picker'
  | 'twilio/call-to-action'
  | 'twilio/quick-reply'
  | 'twilio/card'
  | 'twilio/carousel'
  | 'twilio/catalog'
  | 'twilio/pay'
  | 'twilio/flows'
  | 'whatsapp/card'
  | 'whatsapp/authentication'
  | 'whatsapp/flows';

export interface CreateBroadcastTemplateData {
  friendly_name: string;
  language: string;
  variables?: Record<string, string>;
  types: Partial<Record<BroadcastTemplateType, any>>;
}

export interface UpdateBroadcastTemplateData {
  friendly_name?: string;
  language?: string;
  variables?: Record<string, string>;
  types?: Partial<Record<BroadcastTemplateType, any>>;
}
