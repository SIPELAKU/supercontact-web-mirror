// Pure helpers for the contact detail's Conversations table (BE-1.2,
// GET /contacts/{id}/conversations). No JSX, so they are unit-tested.

import type { SuperTableState } from "@/components/ui/super-table";
import type {
  ChannelType,
  ContactConversationQuery,
  ContactConversationSort,
} from "@/lib/types/omnichannel";
import { CHANNEL_META } from "@/components/support/workspace/workspaceHelpers";

export const CONTACT_CONVERSATION_PAGE_SIZES = [10, 25, 50];

export const INITIAL_CONTACT_CONVERSATION_QUERY: ContactConversationQuery = {
  page: 1,
  limit: CONTACT_CONVERSATION_PAGE_SIZES[0],
  sort: "created_at_desc",
};

// The only column GET /contacts/{id}/conversations can sort by.
export const CONTACT_CONVERSATION_SORT_COLUMN = "created_at";

export const CONTACT_CONVERSATION_CHANNEL_OPTIONS = (
  Object.entries(CHANNEL_META) as [ChannelType, { label: string }][]
).map(([value, meta]) => ({ value, label: meta.label }));

type TableState = Pick<SuperTableState, "pagination" | "sorting" | "filters">;

/**
 * The next API query for a table state change. A new channel filter, sort or
 * page size starts again at page 1; returns `prev` itself when nothing the API
 * reads has changed, so a re-announced state does not refetch.
 */
export function nextContactConversationQuery(
  prev: ContactConversationQuery,
  state: TableState,
): ContactConversationQuery {
  const rawChannel = state.filters?.channel_type;
  const channel_type =
    typeof rawChannel === "string" && rawChannel in CHANNEL_META ? (rawChannel as ChannelType) : undefined;

  const sortCol = state.sorting?.find((s) => s.id === CONTACT_CONVERSATION_SORT_COLUMN);
  const sort: ContactConversationSort = sortCol && !sortCol.desc ? "created_at_asc" : "created_at_desc";

  const limit = state.pagination?.pageSize ?? prev.limit;
  const restart = channel_type !== prev.channel_type || sort !== prev.sort || limit !== prev.limit;
  const page = restart ? 1 : (state.pagination?.pageIndex ?? 0) + 1;

  const next: ContactConversationQuery = { page, limit, sort, ...(channel_type ? { channel_type } : {}) };
  const same =
    next.page === prev.page &&
    next.limit === prev.limit &&
    next.sort === prev.sort &&
    next.channel_type === prev.channel_type;
  return same ? prev : next;
}
