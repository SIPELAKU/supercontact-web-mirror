import { fetchWithTimeout } from "./api-client";
import {
  ConversationSlaPolicy,
  CreateConversationSlaPolicyRequest,
  UpdateConversationSlaPolicyRequest,
} from "@/lib/types/omnichannel";

// Conversation SLA policy CRUD. Shares the omnichannel base (/omnichannels) and
// its auth/error conventions: 401 -> "UNAUTHORIZED", non-2xx -> throw the parsed
// error body (handled by handleError), success -> unwrap `data`.
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/omnichannels/conversation-sla`;

export async function fetchConversationSlaPolicies(
  token: string,
  includeInactive?: boolean
): Promise<ConversationSlaPolicy[]> {
  const params = new URLSearchParams();
  if (includeInactive) params.append("include_inactive", "true");

  const res = await fetchWithTimeout(`${API_BASE}/policies?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to fetch conversation SLA policies");
  }

  // Double-nested payload: { data: { data: ConversationSlaPolicy[] } }.
  const data = json?.data?.data ?? json?.data ?? json;
  return Array.isArray(data) ? data : [];
}

export async function createConversationSlaPolicy(
  token: string,
  data: CreateConversationSlaPolicyRequest
): Promise<ConversationSlaPolicy> {
  const res = await fetchWithTimeout(`${API_BASE}/policies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to create conversation SLA policy");
  }

  return json.data || json;
}

export async function updateConversationSlaPolicy(
  token: string,
  id: string,
  data: UpdateConversationSlaPolicyRequest
): Promise<ConversationSlaPolicy> {
  const res = await fetchWithTimeout(`${API_BASE}/policies/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to update conversation SLA policy");
  }

  return json.data || json;
}

export async function deleteConversationSlaPolicy(
  token: string,
  id: string
): Promise<{ id: string; deleted: boolean }> {
  const res = await fetchWithTimeout(`${API_BASE}/policies/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = await res.json();

  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw json || new Error("Failed to delete conversation SLA policy");
  }

  return json.data || json;
}
