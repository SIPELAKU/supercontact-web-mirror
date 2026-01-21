import {
  createSubscriber,
  deleteSubscriber,
  fetchSubscribers,
  updateSubscriber,
  UpdateSubscriberData
} from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import type {
  CreateSubscriberData,
  CreateSubscriberResponse,
  DeleteSubscriberResponse,
  SubscribersResponse
} from '@/lib/types/email-marketing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useSubscribers(page: number = 1, limit: number = 100) {
  const { token } = useAuth();

  return useQuery<SubscribersResponse>({
    queryKey: ['subscribers', page, limit],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchSubscribers(token, page, limit);
    },
    enabled: !!token,
  });
}

export function useCreateSubscriber() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<CreateSubscriberResponse, Error, CreateSubscriberData>({
    mutationFn: (data: CreateSubscriberData) => {
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
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<DeleteSubscriberResponse, Error, string>({
    mutationFn: (subscriberId: string) => {
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
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subscriberId, data }: { subscriberId: string; data: UpdateSubscriberData }) => {
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
