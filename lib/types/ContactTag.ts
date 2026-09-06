// lib/types/ContactTag.ts
//
// Contact tags (Phase 3, spec A0.1 - the owner amendment that made tags a real
// feature and withdrew A13's "read leads.tag" fallback).
//
// A tag is a ROW, not a string in a JSONB array: `contact_tags` +
// `contact_tag_links`, mirroring the shipped `ticket_tags` / `ticket_tag_links`
// precedent. That is the whole point of the amendment - renaming "VIP" once
// renames it on every contact that carries it, which a denormalised array
// cannot do.
//
// Two consequences this file encodes:
//   * uniqueness is CASE-INSENSITIVE per tenant (`UNIQUE (company_id,
//     lower(name))`), because "VIP" and "vip" are one tag to a seller. The
//     browser de-duplicates the same way before it posts - see
//     `lib/utils/contactTags.ts` - so create-on-type reuses the existing row
//     instead of racing the server into a 409.
//   * DELETE ARCHIVES (`is_active = false`), it never removes rows: the
//     `Unit.is_active` precedent, not the `status` enum the four commercial
//     master tables use. A0.1 names the column `is_active`.
//
// API contract this file mirrors (spec A0.1). Permissions: reading the tag
// catalogue accepts EITHER `contacts` or `sales:config:manage` (the manager
// screen and the segment builder are config-gated and must not 403 for an
// admin without `contacts`); tagging a contact is `contacts`; creating,
// renaming, recolouring and archiving a tag is `sales:config:manage`:
//
//   GET    /contact-tags        ?page&limit&search&include_total
//                               &include_inactive&sort_by&sort_order
//   POST   /contact-tags        {name, color?}                      -> 201
//   PATCH  /contact-tags/{id}   {name?, color?, is_active?}
//   DELETE /contact-tags/{id}   -> archive, idempotent, 200
//   PUT    /contacts/{id}/tags  {tag_ids: [...]}  - replaces the whole set
//   POST   /contacts/tags/bulk  {contact_ids, tag_id, action: add|remove}
//   GET    /contacts            ?tag_ids=<id>&tag_ids=<id>   - AND across ids

/** What a chip needs: the id to send back, the name to print, the colour. */
export interface ContactTagBrief {
  id: string;
  name: string;
  /** `#rrggbb` or null - null renders the neutral chip. */
  color: string | null;
}

export interface ContactTag extends ContactTagBrief {
  company_id: string;
  /** Archived tags stay on the contacts that carry them; they stop being offered. */
  is_active: boolean;
  /**
   * How many contacts carry this tag - the `Unit.product_count` /
   * `PriceList.assignment_count` precedent, one grouped query for the page.
   * It is what the rename dialog counts before it commits, so a rename is
   * never a surprise across a set the user cannot see.
   */
  contact_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ContactTagCreate {
  name: string;
  color?: string | null;
}

/** Every field optional; `is_active: true` is the restore. */
export interface ContactTagUpdate {
  name?: string;
  color?: string | null;
  is_active?: boolean;
}

/**
 * The API accepts only these two (`contact_tags.py` coerces anything else
 * back to "name"), so `contact_count` is deliberately NOT sortable - the
 * column disables sorting rather than sending a key the server drops.
 */
export type ContactTagSortBy = "name" | "created_at";

export interface ContactTagListParams {
  page?: number;
  limit?: number;
  search?: string;
  include_total?: boolean;
  include_inactive?: boolean;
  /**
   * Fills `contact_count` on every row through ONE grouped query. Defaults to
   * FALSE server-side, and without it `contact_count` is null - which the
   * rename/archive confirmations read as "no contact uses this tag". The
   * manager screen must always send `true`.
   */
  include_counts?: boolean;
  sort_by?: ContactTagSortBy;
  sort_order?: "asc" | "desc";
}

export interface ContactTagListResponse {
  items: ContactTag[];
  page: number;
  limit: number;
  total: number | null;
  total_pages: number | null;
}

/** DELETE /contact-tags/{id} - archive, idempotent, 200. */
export interface ContactTagArchiveResponse {
  id: string;
  is_active: boolean;
  archived: boolean;
}

/** PUT /contacts/{id}/tags - the contact's WHOLE set, idempotent. */
export interface ContactTagsReplaceRequest {
  tag_ids: string[];
}

export interface ContactTagsReplaceResponse {
  contact_id: string;
  tags: ContactTagBrief[];
}

/**
 * POST /contacts/tags/bulk - one tag across a list of contacts, capped at the
 * same batch size the existing bulk contact endpoints use. Add and remove are
 * both idempotent: adding a tag a contact already carries is a no-op, not a
 * duplicate link (`UNIQUE (contact_id, tag_id)`).
 */
export interface ContactTagBulkRequest {
  contact_ids: string[];
  tag_id: string;
  action: "add" | "remove";
}

/**
 * Mirrors `ContactTagBulkResponse` in the API
 * (`app/schemas/contact_tag_schema.py`) FIELD FOR FIELD. There is no `updated`
 * key: `affected` is the number of links actually written or deleted,
 * `skipped` counts the contacts that already matched the requested state, and
 * `not_found` carries the ids that are not this tenant's contacts - reported
 * rather than 404-ing the whole batch, so the screen has to surface them or a
 * restricted user is told a batch fully succeeded when part of it did not.
 */
export interface ContactTagBulkResponse {
  tag_id: string;
  action: "add" | "remove";
  affected: number;
  skipped: number;
  not_found: string[];
}
