"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectEmailRequest,
  ConnectWebWidgetRequest,
  WebWidgetConfig,
  UpdateWebWidgetConfigRequest,
  UpdateAccountRequest,
  CreateConversationRequest,
  fetchAccounts,
  connectWhatsApp,
  connectEmail,
  connectWebWidget,
  fetchWebWidgetConfig,
  updateWebWidgetConfig,
  deleteAccount,
  updateAccount,
  reactivateAccount,
  refreshEmail,
  fetchInbox,
  fetchOmnichannelContacts,
  createConversation,
  fetchConversation,
  deleteConversation,
  markAsRead,
  createTicketFromConversation,
  sendMessage,
  uploadMedia,
  OmnichannelContact,
  OmnichannelContactsResponse,
} from "../api/omnichannel";

// Account Management Hooks
// includeInactive defaults to false so every existing caller (new-conversation
// picker, broadcast/template senders, etc) keeps only seeing usable accounts -
// pass true only from management UIs (AccountList) that need to show/reactivate
// deleted ones. Included in the query key so the two variants get separate cache
// entries instead of one clobbering the other.
export function useAccounts(channelType?: string, includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<Account[], Error>({
    queryKey: ['omnichannels', 'accounts', channelType, includeInactive],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchAccounts(token, channelType, includeInactive);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useOmnichannelContacts(q?: string) {
  const { token } = useAuth();
  return useQuery<OmnichannelContactsResponse, Error>({
    queryKey: ['omnichannels', 'inbox', 'contacts', q],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchOmnichannelContacts(token, q);
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useConnectWhatsApp() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectWhatsAppRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectWhatsApp(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useConnectEmail() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectEmailRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectEmail(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useConnectWebWidget() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectWebWidgetRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectWebWidget(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useWebWidgetConfig(accountId?: string) {
  const { token } = useAuth();
  return useQuery<WebWidgetConfig, Error>({
    queryKey: ['omnichannels', 'web-widget-config', accountId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      if (!accountId) throw new Error('No account id');
      return fetchWebWidgetConfig(token, accountId);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && !!accountId,
  });
}

export function useUpdateWebWidgetConfig(accountId?: string) {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWebWidgetConfigRequest) => {
      if (!token) throw new Error('No authentication token');
      if (!accountId) throw new Error('No account id');
      return updateWebWidgetConfig(token, accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'web-widget-config', accountId] });
    },
  });
}

export function useDeleteAccount() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteAccount(token, accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useUpdateAccount() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: UpdateAccountRequest }) => {
      if (!token) throw new Error('No authentication token');
      return updateAccount(token, accountId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useReactivateAccount() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => {
      if (!token) throw new Error('No authentication token');
      return reactivateAccount(token, accountId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

export function useRefreshEmail() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fullSync: boolean) => {
      if (!token) throw new Error('No authentication token');
      return refreshEmail(token, fullSync);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

// Inbox Hooks
export function useInbox(channelType?: string, status?: string) {
  const { token } = useAuth();
  return useQuery<Conversation[], Error>({
    queryKey: ['omnichannels', 'inbox', channelType, status],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchInbox(token, channelType, status);
    },
    staleTime: 1000 * 10,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });
}

export function useCreateConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateConversationRequest) => {
      if (!token) throw new Error('No authentication token');
      return createConversation(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

// Conversation Hooks
export function useConversation(conversationId: string) {
  const { token } = useAuth();
  return useQuery<ConversationWithMessages, Error>({
    queryKey: ['omnichannels', 'conversations', conversationId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchConversation(token, conversationId);
    },
    staleTime: 1000 * 5,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    enabled: !!token && !!conversationId,
  });
}

export function useDeleteConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteConversation(token, conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

export function useCreateTicketFromConversation() {
  const { token } = useAuth();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!token) throw new Error('No authentication token');
      return createTicketFromConversation(token, conversationId);
    },
  });
}

export function useMarkAsRead() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!token) throw new Error('No authentication token');
      return markAsRead(token, conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

// Message Hooks
export function useSendMessage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!token) throw new Error('No authentication token');
      return sendMessage(token, conversationId, content);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

export function useUploadMedia() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, file, content }: { conversationId: string; file: File; content?: string }) => {
      if (!token) throw new Error('No authentication token');
      return uploadMedia(token, conversationId, file, content);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
    },
  });
}
