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
  CreateConversationRequest,
  fetchAccounts,
  connectWhatsApp,
  connectEmail,
  deleteAccount,
  refreshEmail,
  fetchInbox,
  createConversation,
  fetchConversation,
  deleteConversation,
  markAsRead,
  sendMessage,
  uploadMedia,
} from "../api/omnichannel";

// Account Management Hooks
export function useAccounts(channelType?: string) {
  const { token } = useAuth();
  return useQuery<Account[], Error>({
    queryKey: ['omnichannels', 'accounts', channelType],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchAccounts(token, channelType);
    },
    staleTime: 1000 * 60, // 1 minute cache
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
    mutationFn: ({ conversationId, file }: { conversationId: string; file: File }) => {
      if (!token) throw new Error('No authentication token');
      return uploadMedia(token, conversationId, file);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
    },
  });
}
