import { fetchWithTimeout } from "./api-client";
import axiosClient from "@/lib/utils/axiosClient";
import { TicketComment } from "@/lib/types/Ticket";

function getFullUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_URL is not defined");
    return `${baseUrl}${path}`;
}

async function handleResponse(res: Response, errorMessage: string) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    let json;
    try {
        json = await res.json();
    } catch {
        throw new Error(`${errorMessage} (Invalid JSON response)`);
    }
    if (!res.ok || json.success === false) {
        throw new Error(json.message || json.error?.message || json.error || errorMessage);
    }
    return json;
}

export async function fetchTicketComments(
    token: string,
    ticketId: string
): Promise<{ data: { data: TicketComment[] } }> {
    const url = getFullUrl(`/tickets/${ticketId}/comments`);
    const res = await fetchWithTimeout(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to load comments");
}

export async function createTicketComment(
    token: string,
    ticketId: string,
    data: { body: string; is_internal_note: boolean }
): Promise<{ data: TicketComment }> {
    const url = getFullUrl(`/tickets/${ticketId}/comments`);
    const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return handleResponse(res, "Failed to add comment");
}

export async function createTicketCommentWithUpload(
    ticketId: string,
    formData: FormData
): Promise<{ data: TicketComment }> {
    try {
        const res = await axiosClient.post(`/tickets/${ticketId}/comments/upload`, formData);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) {
            throw new Error(
                error.response.data.message || error.response.data.error?.message || "Failed to add comment"
            );
        }
        throw error;
    }
}

export async function updateTicketComment(
    token: string,
    ticketId: string,
    commentId: string,
    body: string
): Promise<{ data: TicketComment }> {
    const url = getFullUrl(`/tickets/${ticketId}/comments/${commentId}`);
    const res = await fetchWithTimeout(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
    });
    return handleResponse(res, "Failed to update comment");
}

export async function deleteTicketComment(
    token: string,
    ticketId: string,
    commentId: string
): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/comments/${commentId}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete comment");
}
