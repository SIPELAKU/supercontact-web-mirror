// lib/types/whatsapp-marketing.ts

export type WaRecipientType = 'subscribers' | 'whatsapp';
// The sort keys each list endpoint accepts (API 1.154.1; the same on PROD
// 1.144.3). Unknown keys are not rejected, they fall back to the default
// order - so the tables only offer sorting on these columns and toApiSort
// only sends these.
/** GET /recipients */
export const WA_RECIPIENT_SORT_KEYS = [
  'name',
  'email',
  'phone_number',
  'company',
  'position',
  'created_at',
  'updated_at',
] as const;
/** GET /broadcasts */
export const BROADCAST_SORT_KEYS = ['name', 'status', 'total_target', 'created_at'] as const;
/** GET /broadcast-templates */
export const BROADCAST_TEMPLATE_SORT_KEYS = [
  'friendly_name',
  'language',
  'whatsapp_approval_status',
  'created_at',
  'updated_at',
] as const;
/** GET /broadcast-groups */
export const BROADCAST_GROUP_SORT_KEYS = ['name', 'recipient_count', 'created_at'] as const;
/** The `status` filter of GET /broadcasts. */
export const BROADCAST_STATUSES = ['Draft', 'In Queue', 'Sent', 'Failed'] as const;
/** GET /broadcasts/{id}/recipients */
export const BROADCAST_RECIPIENT_SORT_KEYS = [
  'name',
  'email',
  'phone_number',
  'company',
  'position',
  'address',
  'status',
  'created_at',
  'updated_at',
] as const;

export type WaRecipientSortBy = (typeof WA_RECIPIENT_SORT_KEYS)[number];
export type BroadcastTemplateSortBy = (typeof BROADCAST_TEMPLATE_SORT_KEYS)[number];
export type BroadcastGroupSortBy = (typeof BROADCAST_GROUP_SORT_KEYS)[number];
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
  /** Matches the group name. */
  search?: string;
  sort_by?: BroadcastGroupSortBy;
  sort_order?: 'asc' | 'desc';
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
  account_id?: string;
  template_id: string | null;
  action: 'send' | 'draft';
  recipient_source: 'recipient' | 'broadcast_group';
  contact_ids?: string[];
  broadcast_group_ids?: string[];
  variables?: Record<string, string>;
}

export interface UpdateBroadcastData {
  name?: string;
  account_id?: string;
  template_id?: string | null;
  action?: 'send' | 'draft';
  recipient_source?: 'recipient' | 'broadcast_group';
  contact_ids?: string[];
  broadcast_group_ids?: string[];
  variables?: Record<string, string>;
  status?: string;
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

export interface BroadcastRecipient extends WaRecipient {
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered' | string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
}

export interface BroadcastRecipientsResponse {
  success: boolean;
  data: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    recipients: BroadcastRecipient[];
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
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

export type BroadcastTemplateApprovalStatus =
  | 'Not submitted'
  | 'Received'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Paused'
  | 'Disabled';

export type BroadcastTemplateCategory = 'Marketing' | 'Utility' | 'Authentication';

/** Every approval status, in the order a template moves through them; the list filter's options. */
export const BROADCAST_TEMPLATE_APPROVAL_STATUSES: BroadcastTemplateApprovalStatus[] = [
  'Not submitted',
  'Received',
  'Pending',
  'Approved',
  'Rejected',
  'Paused',
  'Disabled',
];

/** The languages a template is written in here; the create form and the list filter. */
export const TEMPLATE_LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Indonesian', value: 'id' },
];

export type BroadcastChannel =
  | 'WhatsApp business initiated'
  | 'WhatsApp user initiated'
  | 'RCS'
  | 'SMS'
  | 'Facebook Messenger';

export interface BroadcastTemplate {
  id: string;
  account_id: string;
  provider_content_sid: string;
  friendly_name: string;
  language: string;
  variables: Record<string, any>;
  types: Record<string, any>;
  whatsapp_approval_status: BroadcastTemplateApprovalStatus;
  whatsapp_category: BroadcastTemplateCategory | null;
  whatsapp_rejection_reason: string | null;
  channel_eligibility: BroadcastChannel[];
  created_at: string;
  updated_at: string;
}

export interface BroadcastTemplateApprovalResponse {
  id: string;
  provider_content_sid: string;
  friendly_name: string;
  whatsapp_category: BroadcastTemplateCategory;
  whatsapp_approval_status: BroadcastTemplateApprovalStatus;
}

export interface BroadcastTemplatesParams {
  page?: number;
  limit?: number;
  /** Matches the template name or its SID. */
  search?: string;
  account_id?: string;
  status?: BroadcastTemplateApprovalStatus;
  /** A template language code ("id", "en"). */
  language?: string;
  sort_by?: BroadcastTemplateSortBy;
  sort_order?: 'asc' | 'desc';
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
  account_id: string;
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
