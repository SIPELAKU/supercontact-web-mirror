// lib/hooks/useWaRecipients.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { fetchWithTimeout } from '@/lib/api/api-client';
import type {
  CreateWaRecipientData,
  UpdateWaRecipientData,
  WaRecipientsParams,
  WaRecipientsResponse,
} from '@/lib/types/whatsapp-marketing';

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchWaRecipients(
  token: string,
  params: WaRecipientsParams
): Promise<WaRecipientsResponse> {
  const query = new URLSearchParams();

  // required
  query.set('recipient_type', params.recipient_type);

  // optional
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/recipients?${query.toString()}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg =
      json.error?.message ||
      json.message ||
      'Failed to load recipients';
    throw new Error(msg);
  }

  return json;
}

function buildErrorFromJson(json: any, fallback: string): Error {
  const errorMessage =
    typeof json.error === 'string'
      ? json.error
      : json.error?.message || json.message || fallback;
  const error = new Error(errorMessage) as any;
  error.data = json;
  return error;
}

async function createRecipient(
  token: string,
  data: CreateWaRecipientData
): Promise<{ success: boolean; data: unknown }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to create recipient');
  return json;
}

async function updateRecipient(
  token: string,
  id: string,
  data: UpdateWaRecipientData
): Promise<{ success: boolean; data: unknown }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to update recipient');
  return json;
}

async function deleteRecipient(
  token: string,
  id: string
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to delete recipient');
  return json;
}

async function bulkDeleteRecipients(
  token: string,
  ids: string[]
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipient_ids: ids }),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to bulk delete recipients');
  return json;
}

async function duplicateRecipients(
  token: string,
  ids: string[]
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients/duplicate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ recipient_ids: ids }),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to duplicate recipients');
  return json;
}

async function deleteAllWaRecipients(
  token: string
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/recipients/all`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) throw buildErrorFromJson(json, 'Failed to delete all recipients');
  return json;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useWaRecipients(params: WaRecipientsParams) {
  return useQuery<WaRecipientsResponse>({
    queryKey: ['wa-recipients', params],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchWaRecipients(token, params);
    },
  });
}

export function useCreateWaRecipient() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: unknown }, Error, CreateWaRecipientData>({
    mutationFn: (data) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createRecipient(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}

export function useUpdateWaRecipient() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; data: unknown },
    Error,
    { id: string; data: UpdateWaRecipientData }
  >({
    mutationFn: ({ id, data }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateRecipient(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}

export function useDeleteWaRecipient() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteRecipient(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}

export function useBulkDeleteWaRecipients() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string[]>({
    mutationFn: (ids: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return bulkDeleteRecipients(token, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}

export function useDuplicateWaRecipients() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string[]>({
    mutationFn: (ids: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateRecipients(token, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}

export function useDeleteAllWaRecipients() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteAllWaRecipients(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-recipients'] });
    },
  });
}
