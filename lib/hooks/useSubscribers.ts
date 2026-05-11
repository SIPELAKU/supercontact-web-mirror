import {
  bulkDeleteSubscribers,
  createSubscriber,
  deleteAllSubscribers,

  deleteSubscriber,
  fetchSubscribers,
  fetchBulkJobs,
  actionBulkJob,
  updateSubscriber,
  duplicateSubscribers,
} from '@/lib/api';
import type {
  CreateSubscriberData,
  CreateSubscriberResponse,
  DeleteSubscriberResponse,
  SubscribersResponse,
  BulkJobsResponse
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { UpdateSubscriberData } from '@/lib/api/email-marketing/subscribers';

export function useSubscribers(page: number = 1, limit: number = 10, search?: string) {
  return useQuery<SubscribersResponse>({
    queryKey: ['subscribers', page, limit, search],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchSubscribers(token, page, limit, search);
    },
  });
}

export function useBulkJobs(page: number = 1, limit: number = 10, search?: string, target?: string[], refetchInterval: number | false = 5000, mailingListIds?: string[]) {
  return useQuery<BulkJobsResponse>({
    queryKey: ['bulkJobs', page, limit, search, target, mailingListIds],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchBulkJobs(token, page, limit, search, target, mailingListIds);
    },
    refetchInterval: refetchInterval,
  });
}

export function useActionBulkJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, action }: { jobId: string, action: 'stop' | 'continue' | 'rollback' | 'replay' }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return actionBulkJob(token, jobId, action);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulkJobs'] });
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });
}

export function useCreateSubscriber() {
  const queryClient = useQueryClient();

  return useMutation<CreateSubscriberResponse, Error, CreateSubscriberData>({
    mutationFn: (data: CreateSubscriberData) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return createSubscriber(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}

export function useDeleteSubscriber() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSubscriberResponse, Error, string>({
    mutationFn: (subscriberId: string) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return deleteSubscriber(token, subscriberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}

export function useBulkDeleteSubscribers() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSubscriberResponse, Error, string[]>({
    mutationFn: (contactIds: string[]) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return bulkDeleteSubscribers(token, contactIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}

export function useDeleteAllSubscribers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');

      return deleteAllSubscribers(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}

export function useUpdateSubscriber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriberId, data }: { subscriberId: string; data: UpdateSubscriberData }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return updateSubscriber(token, subscriberId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}

export function useDuplicateSubscribers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      target: 'subscriber' | 'mailing_list';
      contact_ids: string[];
      mailing_list_ids?: string[];
    }) => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return duplicateSubscribers(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-lists'] });
      queryClient.invalidateQueries({ queryKey: ['mailing-list'] });
    },
  });
}
