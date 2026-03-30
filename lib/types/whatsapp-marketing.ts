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
  name?: string;
  email?: string;
  phone_number?: string;
  position?: string;
  company?: string;
  address?: string;
  recipient_type: WaRecipientType;
  custom_fields?: Record<string, unknown>;
}

export type UpdateWaRecipientData = Partial<CreateWaRecipientData>;
