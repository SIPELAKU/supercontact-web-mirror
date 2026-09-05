// lib/api/contact-tags.ts
//
// Contact tags (Phase 3, spec A0.1). Built on `lib/api/catalog-http.ts` like
// the other Phase 1-3 managers: no axios, no `/api/proxy`, and a thrown error
// that carries the API's `code` / `details` so a form can put `details.field`
// under the right control.
//
// `lib/api/ticket-tags.ts` is the shape precedent but is NOT reused: ticket
// tags are get-or-create by NAME at ticket-write time, contact tags are real
// rows managed under Settings with their own permission split -
//   READ_PERMS   = ("contacts", "sales:config:manage")
//   MANAGE_PERMS = ("sales:config:manage",)
// because renaming lands on every contact that carries the tag, which makes it
// a config act rather than a per-record edit.
//
// READ HAS TO ACCEPT BOTH GRANTS, not `contacts` alone: the tag manager and
// the segment criteria builder both live behind `sales:config:manage`, and a
// config admin who does not hold `contacts` would otherwise get a 403 on the
// very screen that owns the vocabulary. Attaching a tag to a contact
// (`PUT /contacts/{id}/tags`, `POST /contacts/tags/bulk`) stays on `contacts`,
// so a seller can tag without holding the config grant.
//
// DELETE ARCHIVES (`is_active = false`); nothing is physically removed.

import type {
  ContactTag,
  ContactTagArchiveResponse,
  ContactTagBulkRequest,
  ContactTagBulkResponse,
  ContactTagCreate,
  ContactTagListParams,
  ContactTagListResponse,
  ContactTagUpdate,
  ContactTagsReplaceResponse,
} from "@/lib/types/ContactTag";
import { fetchWithTimeout } from "./api-client";
import { authHeaders, buildQuery, getFullUrl, handleResponse, jsonHeaders } from "./catalog-http";

export async function fetchContactTags(
  token: string,
  params: ContactTagListParams = {}
): Promise<ContactTagListResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/contact-tags${buildQuery(params)}`), {
    headers: authHeaders(token),
  });
  const json = await handleResponse<ContactTagListResponse>(res, "Failed to load contact tags");
  return json.data;
}

export async function createContactTag(
  token: string,
  data: ContactTagCreate
): Promise<ContactTag> {
  const res = await fetchWithTimeout(getFullUrl("/contact-tags"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ContactTag>(res, "Failed to create contact tag");
  return json.data;
}

/** Rename, recolour or restore. A rename lands on every contact at once. */
export async function updateContactTag(
  token: string,
  id: string,
  data: ContactTagUpdate
): Promise<ContactTag> {
  const res = await fetchWithTimeout(getFullUrl(`/contact-tags/${id}`), {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ContactTag>(res, "Failed to update contact tag");
  return json.data;
}

/** Archive, idempotent, 200 - the links to existing contacts are left alone. */
export async function archiveContactTag(
  token: string,
  id: string
): Promise<ContactTagArchiveResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/contact-tags/${id}`), {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await handleResponse<ContactTagArchiveResponse>(res, "Failed to archive contact tag");
  return json.data;
}

/**
 * Replaces the contact's WHOLE tag set (idempotent). Clearing every tag is
 * `tag_ids: []`, not a skipped call - "no tags" is a state the server has to
 * be told about.
 */
export async function replaceContactTags(
  token: string,
  contactId: string,
  tagIds: string[]
): Promise<ContactTagsReplaceResponse> {
  const res = await fetchWithTimeout(getFullUrl(`/contacts/${contactId}/tags`), {
    method: "PUT",
    headers: jsonHeaders(token),
    body: JSON.stringify({ tag_ids: tagIds }),
  });
  const json = await handleResponse<ContactTagsReplaceResponse>(res, "Failed to save contact tags");
  return json.data;
}

/** One tag across a list of contacts; capped server-side at the bulk batch size. */
export async function bulkTagContacts(
  token: string,
  data: ContactTagBulkRequest
): Promise<ContactTagBulkResponse> {
  const res = await fetchWithTimeout(getFullUrl("/contacts/tags/bulk"), {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<ContactTagBulkResponse>(res, "Failed to tag contacts");
  return json.data;
}
