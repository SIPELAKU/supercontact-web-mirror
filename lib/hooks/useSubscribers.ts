import {
  createSubscriber,
  deleteSubscriber,
  fetchSubscribers,
  updateSubscriber,
  UpdateSubscriberData
} from '@/lib/api';
import type {
  CreateSubscriberData,
  CreateSubscriberResponse,
  DeleteSubscriberResponse,
  SubscribersResponse
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';

export function useSubscribers(page: number = 1, limit: number = 100) {
  return useQuery<SubscribersResponse>({
    queryKey: ['subscribers', page, limit],
    queryFn: () => {
      const token = Cookies.get('access_token');
      if (!token) throw new Error('No authentication token');
      return fetchSubscribers(token, page, limit);
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
