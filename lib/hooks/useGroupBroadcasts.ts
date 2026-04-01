// lib/hooks/useGroupBroadcasts.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { fetchWithTimeout } from '@/lib/api/api-client';
import type {
  CreateGroupBroadcastData,
  DuplicateGroupBroadcastsData,
  GroupBroadcastsParams,
  GroupBroadcastsResponse,
  GroupBroadcastDetailResponse,
  GroupBroadcastCampaignsResponse,
} from '@/lib/types/whatsapp-marketing';

async function fetchGroupBroadcasts(
  token: string,
  params: GroupBroadcastsParams
): Promise<GroupBroadcastsResponse> {
  const query = new URLSearchParams();

  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const url = `${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups?${query.toString()}`;

  const res = await fetchWithTimeout(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg =
      json.error?.message ||
      json.message ||
      'Failed to load group broadcasts';
    throw new Error(msg);
  }

  return json;
}

async function createGroupBroadcast(
  token: string,
  data: CreateGroupBroadcastData
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg = json.error?.message || json.message || 'Failed to create group broadcast';
    throw new Error(msg);
  }

  return json;
}

export function useGroupBroadcasts(params: GroupBroadcastsParams = { page: 1, limit: 10 }) {
  return useQuery<GroupBroadcastsResponse>({
    queryKey: ['group-broadcasts', params],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchGroupBroadcasts(token, params);
    },
  });
}

export function useCreateGroupBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupBroadcastData) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createGroupBroadcast(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-broadcasts'] });
    },
  });
}

async function duplicateGroupBroadcasts(
  token: string,
  data: DuplicateGroupBroadcastsData
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg = json.error?.message || json.message || 'Failed to duplicate group broadcasts';
    throw new Error(msg);
  }

  return json;
}

export function useDuplicateGroupBroadcasts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DuplicateGroupBroadcastsData) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateGroupBroadcasts(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-broadcasts'] });
    },
  });
}

async function updateGroupBroadcast(
  token: string,
  id: string,
  data: { name: string }
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg = json.error?.message || json.message || 'Failed to update group broadcast';
    throw new Error(msg);
  }

  return json;
}

async function deleteGroupBroadcast(
  token: string,
  id: string
): Promise<{ success: boolean; data: any }> {
  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (res.status === 401) throw new Error('UNAUTHORIZED');

  if (!res.ok || !json.success) {
    const msg = json.error?.message || json.message || 'Failed to delete group broadcast';
    throw new Error(msg);
  }

  return json;
}

export function useUpdateGroupBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateGroupBroadcast(token, id, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-broadcasts'] });
    },
  });
}

export function useDeleteGroupBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteGroupBroadcast(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-broadcasts'] });
    },
  });
}

async function fetchGroupBroadcastDetail(
  token: string,
  id: string,
  params: { page?: number; limit?: number }
): Promise<GroupBroadcastDetailResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/${id}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to load group detail');
  }
  return json;
}

async function fetchGroupBroadcastCampaigns(
  token: string,
  id: string,
  params: { page?: number; limit?: number; search?: string }
): Promise<GroupBroadcastCampaignsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.search) query.set('search', params.search);

  const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/broadcast-groups/${id}/broadcasts?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || json.message || 'Failed to load campaigns');
  }
  return json;
}

export function useGroupBroadcastDetail(id: string, page = 1, limit = 10) {
  return useQuery<GroupBroadcastDetailResponse>({
    queryKey: ['group-broadcast-detail', id, page, limit],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchGroupBroadcastDetail(token, id, { page, limit });
    },
    enabled: !!id,
  });
}

export function useGroupBroadcastCampaigns(id: string, page = 1, limit = 10, search = '', enabled = true) {
  return useQuery<GroupBroadcastCampaignsResponse>({
    queryKey: ['group-broadcast-campaigns', id, page, limit, search],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchGroupBroadcastCampaigns(token, id, { page, limit, search });
    },
    enabled: !!id && enabled,
  });
}
