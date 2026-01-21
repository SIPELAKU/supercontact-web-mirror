import {
    createMailingList,
    deleteMailingList,
    deleteMailingListSubscriber,
    fetchMailingListDetail,
    fetchMailingLists,
    updateMailingList
} from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import type {
    CreateMailingListData,
    MailingListDetailResponse,
    MailingListsResponse,
    UpdateMailingListData
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useMailingLists(page: number = 1, limit: number = 100) {
  const { token } = useAuth();

  return useQuery<MailingListsResponse>({
    queryKey: ['mailing-lists', page, limit],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchMailingLists(token, page, limit);
    },
    enabled: !!token,
  });
}

export function useMailingListDetail(mailingListId: string) {
  const { token } = useAuth();

  return useQuery<MailingListDetailResponse>({
    queryKey: ['mailing-list', mailingListId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchMailingListDetail(token, mailingListId);
    },
    enabled: !!token && !!mailingListId,
  });
}

export function useCreateMailingList() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMailingListData) => {
      if (!token) throw new Error('No authentication token');
      return createMailingList(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
    },
  });
}

export function useUpdateMailingList() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mailingListId, data }: { mailingListId: string; data: UpdateMailingListData }) => {
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
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mailingListId: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteMailingList(token, mailingListId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
    },
  });
}

export function useDeleteMailingListSubscriber() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mailingListId, subscriberId }: { mailingListId: string; subscriberId: string }) => {
      if (!token) throw new Error('No authentication token');
      return deleteMailingListSubscriber(token, mailingListId, subscriberId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mailing-list', variables.mailingListId] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}
