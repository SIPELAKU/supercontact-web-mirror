import {
    createMailingList,
    deleteMailingList,
    deleteMailingListSubscriber,
    fetchMailingListDetail,
    fetchMailingLists,
    updateMailingList
} from '@/lib/api';
import type {
    CreateMailingListData,
    MailingListDetailResponse,
    MailingListsResponse,
    UpdateMailingListData
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export function useMailingLists(page: number = 1, limit: number = 100) {
  return useQuery<MailingListsResponse>({
    queryKey: ['mailing-lists', page, limit],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchMailingLists(token, page, limit);
    },
  });
}

export function useMailingListDetail(mailingListId: string) {
  return useQuery<MailingListDetailResponse>({
    queryKey: ['mailing-list', mailingListId],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchMailingListDetail(token, mailingListId);
    },
    enabled: !!mailingListId,
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
