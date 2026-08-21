// lib/api/notifications.ts
// Notification API functions

import { logger } from "../utils/logger";
import { fetchWithTimeout } from "./api-client";

// ============================================
// Types
// ============================================

export interface NotificationData {
    id: string;
    title: string;
    description: string;
    type: string;
    is_read: boolean;
    entity_type?: string;
    entity_id?: string;
    actor_fullname?: string | null;
    created_at: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: NotificationData[];
    message?: string;
    error?: any;
}

export interface UnreadCountResponse {
    success: boolean;
    data: {
        count: number;
    };
    message?: string;
    error?: any;
}

// ============================================
// Navigation
// ============================================

/**
 * Maps a notification's entity_type to where clicking it should navigate.
 * Some entity types (task, note) don't have a standalone detail route in
 * this app today - they only exist inside a contact's detail page - and the
 * notification payload doesn't carry the parent contact_id needed to build
 * that link, so those are intentionally left unmapped (returns null, no
 * navigation) rather than guessing a wrong URL.
 *
 * Conversation notifications are split by channel: the backend tags
 * "omnichannel_conversation" for WhatsApp/SMS/Email (-> contact-first
 * Omnichannel Inbox) and "widget_conversation" / "messenger_conversation"
 * for web-widget and Messenger chats (-> Support Desk Workspace), matching
 * where each conversation actually lives in the UI.
 */
export function getNotificationRoute(notif: NotificationData): string | null {
    switch (notif.entity_type) {
        case "omnichannel_conversation":
            // WhatsApp/SMS/Email conversations. Route into the contact-first
            // Omnichannel Inbox (left: contacts, center: conversation, right:
            // contact details) rather than the standalone
            // /omnichannel/conversations/[id] page, which only renders the message
            // thread on its own with no contact list or details panel.
            return notif.entity_id ? `/omnichannel?conversation=${notif.entity_id}` : null;
        case "widget_conversation":
            // Web-widget conversations live in the Support Desk Workspace (not
            // the contact-first Omnichannel Inbox). Deep-link straight to the
            // thread; WorkspaceClient reads ?conversation=<id> and opens it.
            return notif.entity_id ? `/support/workspace?conversation=${notif.entity_id}` : "/support/workspace";
        case "messenger_conversation":
            // Messenger follows the web-widget precedent: a PSID carries no
            // phone/email contact identity, so its conversations live in the
            // Workspace too (backend conversation_notification_entity_type).
            return notif.entity_id ? `/support/workspace?conversation=${notif.entity_id}` : "/support/workspace";
        case "chat_message":
            return "/inbox";
        case "ticket":
            return "/support/tickets";
        case "pipeline":
            return "/sales/pipeline";
        case "lead":
            return "/lead-management";
        default:
            return null;
    }
}

// ============================================
// Functions
// ============================================

/**
 * Fetch list of notifications, optionally scoped to a single entity (e.g.
 * B4's automated signals feed, filtered to one Organization's alerts).
 */
export async function fetchNotifications(
    token: string,
    options?: { entityType?: string; entityId?: string; limit?: number }
): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (options?.entityType) params.set("entity_type", options.entityType);
    if (options?.entityId) params.set("entity_id", options.entityId);
    if (options?.limit) params.set("limit", String(options.limit));
    const qs = params.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications${qs ? `?${qs}` : ""}`;

    try {
        const res = await fetchWithTimeout(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            },
        });

        let json;
        try {
            json = await res.json();
        } catch (err) {
            throw new Error("Failed to parse notifications response");
        }

        if (!res.ok) {
            throw new Error(json.message || "Failed to fetch notifications");
        }

        // Standardize response structure based on the actual JSON provided:
        // { success: true, data: { notifications: [...], unread_count: 5 }, ... }
        let notifications = [];
        if (json.data && Array.isArray(json.data.notifications)) {
            notifications = json.data.notifications;
        } else if (Array.isArray(json.data)) {
            notifications = json.data;
        } else if (Array.isArray(json)) {
            notifications = json;
        }

        return {
            success: json.success !== undefined ? json.success : true,
            data: notifications,
            error: json.error || null
        };
    } catch (error: any) {
        logger.error("fetchNotifications error:", error);
        throw error;
    }
}

/**
 * Fetch unread notification count
 */
export async function fetchUnreadCount(token: string): Promise<UnreadCountResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/count`;

    try {
        const res = await fetchWithTimeout(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            },
        });

        let json;
        try {
            json = await res.json();
        } catch (err) {
            throw new Error("Failed to parse notifications count response");
        }

        if (!res.ok) {
            throw new Error(json.message || "Failed to fetch notifications count");
        }

        // Standardize response structure
        // The backend might return unread_count inside data
        let count = 0;
        if (json.unread_count !== undefined) count = json.unread_count;
        else if (json.data?.unread_count !== undefined) count = json.data.unread_count;
        else if (json.data?.count !== undefined) count = json.data.count;
        else if (json.count !== undefined) count = json.count;

        return {
            success: json.success !== undefined ? json.success : true,
            data: { count },
            error: json.error || null
        };
    } catch (error: any) {
        logger.error("fetchUnreadCount error:", error);
        throw error;
    }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(token: string, notificationId: string): Promise<{ success: boolean }> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`;

    try {
        const res = await fetchWithTimeout(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            },
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.message || "Failed to mark notification as read");
        }

        return { success: json.success !== undefined ? json.success : true };
    } catch (error: any) {
        logger.error("markNotificationAsRead error:", error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(token: string): Promise<{ success: boolean }> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`;

    try {
        const res = await fetchWithTimeout(url, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Accept": "application/json"
            },
        });

        const json = await res.json();
        if (!res.ok) {
            throw new Error(json.message || "Failed to mark all notifications as read");
        }

        return { success: json.success !== undefined ? json.success : true };
    } catch (error: any) {
        logger.error("markAllNotificationsAsRead error:", error);
        throw error;
    }
}
