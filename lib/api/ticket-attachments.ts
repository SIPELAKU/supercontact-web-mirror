import { fetchWithTimeout } from "./api-client";
import axiosClient from "@/lib/utils/axiosClient";
import { TicketAttachment } from "@/lib/types/Ticket";

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

export async function uploadTicketAttachments(
    ticketId: string,
    files: File[]
): Promise<{ data: { data: TicketAttachment[] } }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
        const res = await axiosClient.post(`/tickets/${ticketId}/attachments`, formData);
        return res.data;
    } catch (error: any) {
        if (error.response?.data) {
            throw new Error(
                error.response.data.message || error.response.data.error?.message || "Failed to upload attachment"
            );
        }
        throw error;
    }
}

export async function deleteTicketAttachment(
    token: string,
    ticketId: string,
    attachmentId: string
): Promise<any> {
    const url = getFullUrl(`/tickets/${ticketId}/attachments/${attachmentId}`);
    const res = await fetchWithTimeout(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    return handleResponse(res, "Failed to delete attachment");
}
