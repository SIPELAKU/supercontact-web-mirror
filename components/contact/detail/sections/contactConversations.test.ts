import { describe, expect, it } from "vitest";
import {
  CONTACT_CONVERSATION_CHANNEL_OPTIONS,
  INITIAL_CONTACT_CONVERSATION_QUERY,
  nextContactConversationQuery,
} from "./contactConversations";

const state = (over: {
  pageIndex?: number;
  pageSize?: number;
  sorting?: { id: string; desc: boolean }[];
  filters?: Record<string, unknown>;
}) => ({
  pagination: { pageIndex: over.pageIndex ?? 0, pageSize: over.pageSize ?? 10 },
  sorting: over.sorting ?? [{ id: "created_at", desc: true }],
  filters: over.filters ?? {},
});

describe("nextContactConversationQuery", () => {
  const initial = INITIAL_CONTACT_CONVERSATION_QUERY;

  it("starts at page 1, 10 rows, newest first", () => {
    expect(initial).toEqual({ page: 1, limit: 10, sort: "created_at_desc" });
  });

  it("returns the same object when nothing the API reads changed", () => {
    expect(nextContactConversationQuery(initial, state({}))).toBe(initial);
  });

  it("moves to the page the table shows (1-based)", () => {
    expect(nextContactConversationQuery(initial, state({ pageIndex: 2 }))).toEqual({
      page: 3,
      limit: 10,
      sort: "created_at_desc",
    });
  });

  it("sends the channel filter and restarts at page 1", () => {
    const onPage3 = { ...initial, page: 3 };
    expect(
      nextContactConversationQuery(onPage3, state({ pageIndex: 2, filters: { channel_type: "web_widget" } })),
    ).toEqual({ page: 1, limit: 10, sort: "created_at_desc", channel_type: "web_widget" });
  });

  it("drops a channel value this build does not know", () => {
    expect(nextContactConversationQuery(initial, state({ filters: { channel_type: "fax" } }))).toBe(initial);
  });

  it("sorts oldest first when Created is ascending, and restarts at page 1", () => {
    const onPage2 = { ...initial, page: 2 };
    expect(
      nextContactConversationQuery(onPage2, state({ pageIndex: 1, sorting: [{ id: "created_at", desc: false }] })),
    ).toEqual({ page: 1, limit: 10, sort: "created_at_asc" });
  });

  it("falls back to newest first when the sort is cleared", () => {
    const asc = { ...initial, sort: "created_at_asc" as const };
    expect(nextContactConversationQuery(asc, state({ sorting: [] })).sort).toBe("created_at_desc");
  });

  it("restarts at page 1 on a new page size", () => {
    const onPage4 = { ...initial, page: 4 };
    expect(nextContactConversationQuery(onPage4, state({ pageIndex: 3, pageSize: 25 }))).toEqual({
      page: 1,
      limit: 25,
      sort: "created_at_desc",
    });
  });
});

describe("CONTACT_CONVERSATION_CHANNEL_OPTIONS", () => {
  it("offers every channel with the workspace label", () => {
    expect(CONTACT_CONVERSATION_CHANNEL_OPTIONS).toContainEqual({ value: "web_widget", label: "Web widget" });
    expect(CONTACT_CONVERSATION_CHANNEL_OPTIONS).toHaveLength(6);
  });
});
