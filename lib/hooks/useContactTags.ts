// lib/hooks/useContactTags.ts
//
// React Query hooks for contact tags (Phase 3, spec A0.1), the
// `useCommercialContext.ts` shape.
//
// Every write invalidates `["contact-tags"]` AND `["contacts"]`: a tag is a
// SEGMENT INPUT (the `tags` criteria clause reads the contact's tag names), so
// renaming or archiving one can change which segment a contact matches and
// therefore which price list a quotation line resolves to. The contact list
// renders the chips inline, so it is stale the moment a name or colour moves.

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  archiveContactTag,
  bulkTagContacts,
  createContactTag,
  fetchContactTags,
  replaceContactTags,
  updateContactTag,
} from "@/lib/api/contact-tags";
import type {
  ContactTagBulkRequest,
  ContactTagCreate,
  ContactTagListParams,
  ContactTagUpdate,
} from "@/lib/types/ContactTag";

export const CONTACT_TAGS_KEY = "contact-tags";

function invalidateTags(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [CONTACT_TAGS_KEY] });
  // Chips are rendered inline on the contact list and the contact detail.
  queryClient.invalidateQueries({ queryKey: ["contacts"] });
  // `tags` is a segment criteria field, and a segment is a resolution level.
  queryClient.invalidateQueries({ queryKey: ["commercial-context"] });
}

/** The manager's lazy list: page / limit / search / include_inactive / sort. */
export function useContactTags(params: ContactTagListParams, options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [CONTACT_TAGS_KEY, "list", params],
    queryFn: async () => fetchContactTags(await getToken(), params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled !== false,
  });
}

const ACTIVE_TAG_PARAMS: ContactTagListParams = {
  page: 1,
  limit: 200,
  include_total: false,
  include_inactive: false,
  sort_by: "name",
  sort_order: "asc",
};

/**
 * Every ACTIVE tag in one request - the contact-detail editor's suggestions,
 * the contact list's filter chips and the segment builder's `tags` clause all
 * read this one query rather than each running their own.
 *
 * Reading the catalogue accepts EITHER `contacts` or `sales:config:manage`, so
 * a seller can tag without the config grant AND a config admin can run the
 * manager and the segment builder without holding `contacts`.
 */
export function useActiveContactTags(options?: { enabled?: boolean }) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: [CONTACT_TAGS_KEY, "list", ACTIVE_TAG_PARAMS],
    queryFn: async () => fetchContactTags(await getToken(), ACTIVE_TAG_PARAMS),
    enabled: options?.enabled !== false,
  });
}

export function useCreateContactTag() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ContactTagCreate) => createContactTag(await getToken(), data),
    onSuccess: () => invalidateTags(queryClient),
  });
}

export function useUpdateContactTag() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContactTagUpdate }) =>
      updateContactTag(await getToken(), id, data),
    onSuccess: () => invalidateTags(queryClient),
  });
}

export function useArchiveContactTag() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => archiveContactTag(await getToken(), id),
    onSuccess: () => invalidateTags(queryClient),
  });
}

/** Replaces one contact's whole set. `[]` clears it. */
export function useReplaceContactTags() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ contactId, tagIds }: { contactId: string; tagIds: string[] }) =>
      replaceContactTags(await getToken(), contactId, tagIds),
    onSuccess: () => invalidateTags(queryClient),
  });
}

/** One tag added to or removed from a list of contacts. */
export function useBulkTagContacts() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ContactTagBulkRequest) => bulkTagContacts(await getToken(), data),
    onSuccess: () => invalidateTags(queryClient),
  });
}
