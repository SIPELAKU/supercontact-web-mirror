// lib/api/chat.ts
import { fetchWithTimeout } from "./api-client";

// Types matching the API Documentation

export interface ChatUser {
    user_id: string; // uuid
    user_fullname: string;
    user_avatar_initial: string;
    user_avatar: string | null;
    user_position: string;
    last_message_preview: string;
    last_message_time: string; // datetime
    unread_count: number;
    email: string;
    phone: string;
    about: string;
}

export interface NewChatUser {
    id: string; // uuid
    fullname: string;
    avatar_initial: string;
    avatar: string | null;
    position: string;
    email: string;
    phone: string;
    about: string;
}

export interface ChatMessage {
    id: string; // uuid
    sender_id: string; // uuid
    receiver_id: string; // uuid
    message: string;
    type: "Text" | "Image" | "Voice" | "File";
    media_url: string | null;
    media_file_id: string | null;
    is_read: boolean;
    pinned_expires_at: string | null; // datetime or null
    created_at: string; // datetime
}

export interface SendMessagePayload {
    receiver_id: string;
    message: string;
    type?: "Text" | "Image" | "Voice" | "File";
    media_url?: string | null;
    media_file_id?: string | null;
}

// API Functions

// 1. Get My Inbox
export async function fetchInbox(
    token: string,
    page: number = 1,
    limit: number = 20
): Promise<{ data: ChatUser[] }> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/inbox?${params.toString()}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to fetch inbox");
    return res.json();
}

// 2. Get User List for New Chat
export async function fetchUsers(
    token: string,
    page: number = 1,
    limit: number = 20,
    search?: string
): Promise<{ data: NewChatUser[] }> {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    if (search) params.append("search", search);

    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/users?${params.toString()}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

// 3. Get Messages
export async function fetchMessages(
    token: string,
    targetId: string
): Promise<{ data: ChatMessage[] }> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${targetId}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
}

// 4. Send Text Message
export async function sendMessage(
    token: string,
    payload: SendMessagePayload
): Promise<{ data: ChatMessage }> {
    const res = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            type: "Text", // Default type
            media_url: null,
            media_file_id: null,
            ...payload,
        }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
}

// 5. Send Files (Upload)
export async function sendAttachment(
    token: string,
    receiverId: string,
    files: File[],
    message?: string
): Promise<{ data: ChatMessage[] }> {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (message) formData.append("message", message);

    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/upload/${receiverId}`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }, // Content-Type is auto-set by FormData
            body: formData,
        }
    );
    if (!res.ok) throw new Error("Failed to upload files");
    return res.json();
}

// 6. Mark as Read
export async function markAsRead(
    token: string,
    otherUserId: string
): Promise<void> {
    await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/read/${otherUserId}`,
        {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}

// 7. Pin Message
export async function pinMessage(
    token: string,
    messageId: string,
    duration: "24h" | "7d" | "30d"
): Promise<void> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/pin/${messageId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ duration }),
        }
    );
    if (!res.ok) throw new Error("Failed to pin message");
}

// 8. Unpin Message
export async function unpinMessage(
    token: string,
    messageId: string
): Promise<void> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/pin/${messageId}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to unpin message");
}

// 9. Delete Messages multiple messages by message ID
export async function deleteMessagesMultiple(
    token: string,
    messageIds: string[]
): Promise<void> {
    const params = new URLSearchParams();
    messageIds.forEach((id) => params.append("message_ids", id));

    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/messages?${params.toString()}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to delete messages");
}

// 10. Delete entire conversation
export async function deleteConversation(
    token: string,
    parent_id: string
): Promise<void> {
    const res = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/conversation/${parent_id}`,
        {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    if (!res.ok) throw new Error("Failed to delete conversation");
}
