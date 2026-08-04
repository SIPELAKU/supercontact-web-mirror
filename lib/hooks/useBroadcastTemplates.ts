// lib/hooks/useBroadcastTemplates.ts
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { fetchWithTimeout } from '@/lib/api/api-client';
import type {
  BroadcastTemplatesParams,
  BroadcastTemplatesResponse,
  DuplicateBroadcastTemplatesData,
  BroadcastTemplateDetailResponse,
  BroadcastTemplateApprovalResponse,
  BroadcastTemplateCategory,
} from '@/lib/types/whatsapp-marketing';

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

async function fetchBroadcastTemplates(
  token: string,
  params: BroadcastTemplatesParams
): Promise<BroadcastTemplatesResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);
  if (params.account_id) query.set('account_id', params.account_id);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates?${query.toString()}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg =
      json.error?.message ||
      json.message ||
      'Failed to load broadcast templates';
    throw new Error(msg);
  }

  return json;
}

async function fetchBroadcastTemplateDetail(
  token: string,
  id: string
): Promise<BroadcastTemplateDetailResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/${id}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg =
      json.error?.message ||
      json.message ||
      'Failed to load broadcast template detail';
    throw new Error(msg);
  }

  return json;
}

async function duplicateBroadcastTemplates(
  token: string,
  data: DuplicateBroadcastTemplatesData
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/duplicate`,
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
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to duplicate templates');
  }
  return json;
}

async function deleteBroadcastTemplate(
  token: string,
  id: string
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to delete template');
  }
  return json;
}

async function bulkDeleteBroadcastTemplates(
  token: string,
  ids: string[]
): Promise<{ success: boolean }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ template_ids: ids }),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to bulk delete templates');
  }
  return json;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export function useBroadcastTemplates(
  params: BroadcastTemplatesParams,
  options?: { enabled?: boolean }
) {
  return useQuery<BroadcastTemplatesResponse>({
    queryKey: ['broadcast-templates', params],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcastTemplates(token, params);
    },
    enabled: options?.enabled,
  });
}

export function useBroadcastTemplateDetail(id: string) {
  return useQuery<BroadcastTemplateDetailResponse>({
    queryKey: ['broadcast-template', id],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBroadcastTemplateDetail(token, id);
    },
    enabled: !!id,
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useDuplicateBroadcastTemplates() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, DuplicateBroadcastTemplatesData>({
    mutationFn: (data) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateBroadcastTemplates(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

export function useDeleteBroadcastTemplate() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (id) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteBroadcastTemplate(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

export function useBulkDeleteBroadcastTemplates() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string[]>({
    mutationFn: (ids) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return bulkDeleteBroadcastTemplates(token, ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

async function createBroadcastTemplate(
  token: string,
  data: import('@/lib/types/whatsapp-marketing').CreateBroadcastTemplateData
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates`,
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
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to create template');
  }
  return json;
}

export function useCreateBroadcastTemplate() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: any }, Error, import('@/lib/types/whatsapp-marketing').CreateBroadcastTemplateData>({
    mutationFn: (data) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createBroadcastTemplate(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

async function updateBroadcastTemplate(
  token: string,
  id: string,
  data: import('@/lib/types/whatsapp-marketing').UpdateBroadcastTemplateData
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/${id}`,
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
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to update template');
  }
  return json;
}

export function useUpdateBroadcastTemplate() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; data: any },
    Error,
    { id: string; data: import('@/lib/types/whatsapp-marketing').UpdateBroadcastTemplateData }
  >({
    mutationFn: ({ id, data }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateBroadcastTemplate(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

// ---------------------------------------------------------------------------
// Approval: submit + manual status refresh
// ---------------------------------------------------------------------------

async function requestTemplateApproval(
  token: string,
  id: string,
  whatsapp_category: BroadcastTemplateCategory
): Promise<{ success: boolean; data: BroadcastTemplateApprovalResponse }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/${id}/approval`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ whatsapp_category }),
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to submit template for approval');
  }
  return json;
}

export function useRequestTemplateApproval() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; data: BroadcastTemplateApprovalResponse },
    Error,
    { id: string; whatsapp_category: BroadcastTemplateCategory }
  >({
    mutationFn: ({ id, whatsapp_category }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return requestTemplateApproval(token, id, whatsapp_category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}

async function syncTemplateApprovalStatus(
  token: string,
  id: string
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(
    `${process.env.NEXT_PUBLIC_API_URL}/broadcast-templates/${id}/sync-status`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to refresh approval status');
  }
  return json;
}

export function useSyncTemplateApprovalStatus() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; data: any }, Error, string>({
    mutationFn: (id) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return syncTemplateApprovalStatus(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-templates'] });
    },
  });
}
