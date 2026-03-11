import {
  createMailingList,
  deleteMailingList,
  deleteMailingListSubscriber,
  fetchMailingListCampaigns,
  fetchMailingListDetail,
  fetchMailingLists,
  updateMailingList,
  bulkDeleteMailingListSubscribers,
  deleteAllMailingListSubscribers
} from '@/lib/api';

import type {
  CreateMailingListData,
  MailingListDetailResponse,
  MailingListsResponse,
  UpdateMailingListData
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export function useMailingLists(page: number = 1, limit: number = 10, search?: string) {
  return useQuery<MailingListsResponse>({
    queryKey: ['mailing-lists', page, limit, search],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchMailingLists(token, page, limit, search);
    },
  });
}

export function useMailingListDetail(mailingListId: string, page: number = 1, limit: number = 10, search?: string) {
  return useQuery<MailingListDetailResponse>({
    queryKey: ['mailing-list', mailingListId, page, limit, search],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchMailingListDetail(token, mailingListId, page, limit, search);
    },
    enabled: !!mailingListId,
  });
}

export function useMailingListCampaigns(mailingListId: string, page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ['mailing-list-campaigns', mailingListId, page, limit],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchMailingListCampaigns(token, mailingListId, page, limit);
    },
    enabled: !!mailingListId && enabled,
  });
}

export function useCreateMailingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMailingListData) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createMailingList(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
    },
  });
}

export function useUpdateMailingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mailingListId, data }: { mailingListId: string; data: UpdateMailingListData }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateMailingList(token, mailingListId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list', variables.mailingListId] });
    },
  });
}

export function useDeleteMailingList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mailingListId: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteMailingList(token, mailingListId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
    },
  });
}

export function useDeleteMailingListSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mailingListId, subscriberId }: { mailingListId: string; subscriberId: string }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteMailingListSubscriber(token, mailingListId, subscriberId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mailing-list', variables.mailingListId] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

export function useBulkDeleteMailingListSubscribers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mailingListId, contactIds }: { mailingListId: string; contactIds: string[] }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return bulkDeleteMailingListSubscribers(token, mailingListId, contactIds);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mailing-list', variables.mailingListId] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}
export function useDeleteAllMailingListSubscribers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mailingListId: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteAllMailingListSubscribers(token, mailingListId);
    },
    onSuccess: (_, mailingListId) => {
      queryClient.invalidateQueries({ queryKey: ['mailing-list', mailingListId] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

