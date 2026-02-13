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
// Functions
// ============================================

/**
 * Fetch list of notifications
 */
export async function fetchNotifications(token: string): Promise<NotificationsResponse> {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/notifications`;

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
