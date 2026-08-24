"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  Account,
  Conversation,
  Message,
  ConversationWithMessages,
  ConnectWhatsAppRequest,
  ConnectSmsRequest,
  ConnectMessengerRequest,
  ConnectInstagramRequest,
  ConnectEmailRequest,
  ConnectWebWidgetRequest,
  WebWidgetConfig,
  UpdateWebWidgetConfigRequest,
  UpdateAccountRequest,
  CreateConversationRequest,
  OmnichannelContactInboxDetail,
  fetchAccounts,
  connectWhatsApp,
  connectSms,
  connectMessenger,
  connectInstagram,
  connectEmail,
  connectWebWidget,
  fetchWebWidgetConfig,
  updateWebWidgetConfig,
  deleteAccount,
  updateAccount,
  reactivateAccount,
  refreshEmail,
  fetchContactInboxDetail,
  fetchOmnichannelContacts,
  fetchConversationInbox,
  createConversation,
  fetchConversation,
  deleteConversation,
  markAsRead,
  createTicketFromConversation,
  sendMessage,
  uploadMedia,
  assignConversation,
  setConversationTags,
  createConversationNote,
  fetchConversationTags,
  setConversationStatus,
  setConversationPriority,
  snoozeConversation,
  transferConversation,
  fetchCannedReplies,
  createCannedReply,
  updateCannedReply,
  deleteCannedReply,
  conversationViewerHeartbeat,
  getConversationViewers,
  fetchOrganization,
  fetchOrganizationConversations,
  fetchSavedViews,
  createSavedView,
  updateSavedView,
  deleteSavedView,
  fetchConversationDraft,
  saveConversationDraft,
  deleteConversationDraft,
  OmnichannelContact,
  OmnichannelContactsResponse,
  AssignConversationRequest,
  SetConversationTagsRequest,
  CreateConversationNoteRequest,
  ConversationTagsResponse,
  SetConversationStatusRequest,
  SetConversationPriorityRequest,
  TransferConversationRequest,
  CannedReply,
  CreateCannedReplyRequest,
  UpdateCannedReplyRequest,
  ConversationInboxFilters,
  ConversationInboxResponse,
  OrganizationSummary,
  SavedView,
  CreateSavedViewRequest,
  UpdateSavedViewRequest,
  ConversationDraft,
} from "../api/omnichannel";
import { ConversationViewer, ConversationListItem } from "../types/omnichannel";

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

export function useOmnichannelContacts(
  q?: string,
  channelType?: string,
  activeWithinDays?: number,
  status?: string,
  priority?: string,
  assignedToMe?: boolean
) {
  const { token } = useAuth();
  return useQuery<OmnichannelContactsResponse, Error>({
    // channelType/activeWithinDays/status/priority/assignedToMe are part of the
    // key so each filter combo caches independently - useOmnichannelRealtime's
    // setQueriesData partial-match on the ['omnichannels','inbox','contacts']
    // prefix still reaches every variant.
    queryKey: [
      'omnichannels',
      'inbox',
      'contacts',
      q,
      channelType ?? 'all',
      activeWithinDays ?? 0,
      status ?? 'all',
      priority ?? 'all',
      assignedToMe ?? false,
    ],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchOmnichannelContacts(token, q, channelType, activeWithinDays, status, priority, assignedToMe);
    },
    staleTime: 1000 * 30, // 30 seconds
    // Long safety-net poll - useOmnichannelRealtime (WS) handles the snappy
    // path, this just backstops missed/dropped pushes.
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    enabled: !!token,
  });
}

// Conversation-FIRST queue for the Support Desk agent workspace (the flat
// conversation inbox, GET /omnichannels/inbox). Kept under the shared
// ['omnichannels','inbox', ...] key prefix so the broad invalidations fired by
// the conversation mutation hooks (useSendMessage / useSetConversationStatus /
// useSetConversationPriority / useAssignConversation / useMarkAsRead - all of
// which invalidate ['omnichannels','inbox']) also refresh this queue. The
// whole filters object is part of the key so each preset/refinement combo
// caches independently.
//
// useOmnichannelRealtime keeps the OPEN conversation live via its own targeted
// invalidation; the refetchInterval below is the queue's safety-net for
// inbound customer messages on OTHER conversations (its WS patch is scoped to
// the contact-first cache, so it can't patch this cache in place).
export function useConversationInbox(filters: ConversationInboxFilters) {
  const { token } = useAuth();
  return useQuery<ConversationInboxResponse, Error>({
    queryKey: ['omnichannels', 'inbox', 'conversations', filters],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchConversationInbox(token, filters);
    },
    staleTime: 1000 * 15,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
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

// Phase 9 Inc A: connect an SMS number (mirrors useConnectWhatsApp).
export function useConnectSms() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectSmsRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectSms(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

// Phase 9 Inc B: connect a Facebook Page for Messenger.
export function useConnectMessenger() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectMessengerRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectMessenger(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'accounts'] });
    },
  });
}

// Phase 9 Inc C: connect an Instagram professional account for DMs.
export function useConnectInstagram() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConnectInstagramRequest) => {
      if (!token) throw new Error('No authentication token');
      return connectInstagram(token, data);
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
export function useContactInboxDetail(contactKey: string | null) {
  const { token } = useAuth();
  return useQuery<OmnichannelContactInboxDetail | null, Error>({
    queryKey: ['omnichannels', 'inbox', 'contact-detail', contactKey],
    queryFn: async () => {
      if (!token) throw new Error('No authentication token');
      if (!contactKey) return null;
      try {
        return await fetchContactInboxDetail(token, contactKey);
      } catch {
        // 404 = the contact has no omnichannel conversations yet - render
        // zero counts rather than an error state.
        return null;
      }
    },
    staleTime: 1000 * 30,
    enabled: !!token && !!contactKey,
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
    // Long safety-net poll - useOmnichannelRealtime (WS) handles the snappy
    // path, this just backstops missed/dropped pushes.
    refetchInterval: 60000,
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

export function useAssignConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: AssignConversationRequest }) => {
      if (!token) throw new Error('No authentication token');
      return assignConversation(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      // Assignment also shows up on the inbox list row (OmnichannelContact.assigned_user_*).
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox', 'contacts'] });
    },
  });
}

export function useSetConversationTags() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SetConversationTagsRequest }) => {
      if (!token) throw new Error('No authentication token');
      return setConversationTags(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
    },
  });
}

export function useSetConversationStatus() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SetConversationStatusRequest }) => {
      if (!token) throw new Error('No authentication token');
      return setConversationStatus(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      // Status drives the inbox Status filter (server-side), so a change can
      // move the row in/out of the currently filtered list - refresh it.
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

export function useSetConversationPriority() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: SetConversationPriorityRequest }) => {
      if (!token) throw new Error('No authentication token');
      return setConversationPriority(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      // Priority drives the inbox Priority filter (server-side) - refresh it.
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

export function useSnoozeConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, snoozedUntil }: { conversationId: string; snoozedUntil: string }) => {
      if (!token) throw new Error('No authentication token');
      return snoozeConversation(token, conversationId, snoozedUntil);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      // Snoozing moves the conversation to `snoozed` status, so it drops out of
      // the currently filtered open queue - refresh the inbox.
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
    },
  });
}

export function useTransferConversation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: TransferConversationRequest }) => {
      if (!token) throw new Error('No authentication token');
      return transferConversation(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
      // A transfer reassigns the conversation, so it can move in/out of the
      // "assigned to me" view and updates the inbox row's assignee.
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'inbox', 'contacts'] });
    },
  });
}

// Conversation collision presence. Heartbeat-polling (not a WS subscription),
// mirroring lib/hooks/useTicketPresence.ts exactly: on each ~20s tick it POSTs
// a heartbeat then GETs the current viewers (the response already excludes the
// caller). Presence is best-effort, so errors are swallowed silently. Pass a
// null conversationId (no conversation open) to idle the hook.
const CONVERSATION_PRESENCE_INTERVAL_MS = 20000;

export function useConversationViewers(conversationId: string | null) {
  const { getToken } = useAuth();
  const [viewers, setViewers] = useState<ConversationViewer[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setViewers([]);
      return;
    }
    let cancelled = false;

    const tick = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await conversationViewerHeartbeat(token, conversationId);
        const res = await getConversationViewers(token, conversationId);
        if (!cancelled) setViewers(res.data.data || []);
      } catch {
        // presence is best-effort, never surface an error toast for it
      }
    };

    tick();
    intervalRef.current = setInterval(tick, CONVERSATION_PRESENCE_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [conversationId, getToken]);

  return { viewers };
}

export function useCreateConversationNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: CreateConversationNoteRequest }) => {
      if (!token) throw new Error('No authentication token');
      return createConversationNote(token, conversationId, data);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'conversations', conversationId] });
    },
  });
}

// Conversation tag catalog (suggestions for the tag picker) - company-wide,
// not conversation-scoped, so it gets its own top-level query key.
export function useConversationTags() {
  const { token } = useAuth();
  return useQuery<ConversationTagsResponse, Error>({
    queryKey: ['omnichannels', 'conversation-tags'],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchConversationTags(token);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
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

// Canned Replies Hooks
// includeInactive is part of the key so the composer's active-only picker and
// the settings page's full listing cache independently (mirrors useAccounts).
export function useCannedReplies(includeInactive?: boolean) {
  const { token } = useAuth();
  return useQuery<CannedReply[], Error>({
    queryKey: ['omnichannels', 'canned-replies', includeInactive ?? false],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchCannedReplies(token, includeInactive);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateCannedReply() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCannedReplyRequest) => {
      if (!token) throw new Error('No authentication token');
      return createCannedReply(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'canned-replies'] });
    },
  });
}

export function useUpdateCannedReply() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCannedReplyRequest }) => {
      if (!token) throw new Error('No authentication token');
      return updateCannedReply(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'canned-replies'] });
    },
  });
}

export function useDeleteCannedReply() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteCannedReply(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'canned-replies'] });
    },
  });
}

// Organization Hooks (workspace context panel)
// Both queries idle (enabled:false) when no crmCompanyId is present, so the
// panel can call them unconditionally and render nothing when the contact
// isn't linked to a company.
export function useOrganization(crmCompanyId?: string | null) {
  const { token } = useAuth();
  return useQuery<OrganizationSummary, Error>({
    queryKey: ['omnichannels', 'organizations', crmCompanyId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      if (!crmCompanyId) throw new Error('No organization id');
      return fetchOrganization(token, crmCompanyId);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token && !!crmCompanyId,
  });
}

export function useOrganizationConversations(crmCompanyId?: string | null, limit = 50) {
  const { token } = useAuth();
  return useQuery<ConversationListItem[], Error>({
    queryKey: ['omnichannels', 'organizations', crmCompanyId, 'conversations', limit],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      if (!crmCompanyId) throw new Error('No organization id');
      return fetchOrganizationConversations(token, crmCompanyId, limit);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && !!crmCompanyId,
  });
}

// Saved Views Hooks (named, optionally-shared queue filter presets).
export function useSavedViews(resource = 'conversation') {
  const { token } = useAuth();
  return useQuery<SavedView[], Error>({
    queryKey: ['omnichannels', 'saved-views', resource],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      return fetchSavedViews(token, resource);
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useCreateSavedView() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSavedViewRequest) => {
      if (!token) throw new Error('No authentication token');
      return createSavedView(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'saved-views'] });
    },
  });
}

export function useUpdateSavedView() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSavedViewRequest }) => {
      if (!token) throw new Error('No authentication token');
      return updateSavedView(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'saved-views'] });
    },
  });
}

export function useDeleteSavedView() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteSavedView(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['omnichannels', 'saved-views'] });
    },
  });
}

// Reply Draft Hooks (composer autosave).
// Kept under an independent ['omnichannels','drafts', id] key (NOT nested under
// the conversation key) so the broad conversation invalidations fired on every
// message send / status change don't churn or race the composer's own draft
// GET while the agent is typing. The composer manages hydration/autosave
// explicitly; the mutations keep the cache in sync via setQueryData.
export function useConversationDraft(conversationId: string | null) {
  const { token } = useAuth();
  return useQuery<ConversationDraft, Error>({
    queryKey: ['omnichannels', 'drafts', conversationId],
    queryFn: () => {
      if (!token) throw new Error('No authentication token');
      if (!conversationId) return { body: '' };
      return fetchConversationDraft(token, conversationId);
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
    enabled: !!token && !!conversationId,
  });
}

export function useSaveConversationDraft() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: string; body: string }) => {
      if (!token) throw new Error('No authentication token');
      return saveConversationDraft(token, conversationId, body);
    },
    onSuccess: (data, { conversationId }) => {
      queryClient.setQueryData(['omnichannels', 'drafts', conversationId], data);
    },
  });
}

export function useDeleteConversationDraft() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!token) throw new Error('No authentication token');
      return deleteConversationDraft(token, conversationId);
    },
    onSuccess: (_, conversationId) => {
      queryClient.setQueryData(['omnichannels', 'drafts', conversationId], { body: '' });
    },
  });
}
