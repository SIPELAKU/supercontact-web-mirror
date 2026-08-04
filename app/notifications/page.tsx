"use client";

import { useEffect, useState } from "react";
import BannerDashboard from "@/components/ui/banner-dashboard"
import PageHeader from "@/components/ui/page-header";
import { fetchNotifications, getNotificationRoute, NotificationData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useNotifications } from "@/lib/context/NotificationsContext";
import { notify } from "@/lib/notifications";
import { format, isToday, isYesterday } from "date-fns";

interface Notification {
    id: string;
    category: string;
    title: string;
    description: string;
    time: string;
    status: 'unread' | 'read';
    created_at: string;
}

// badge style based on type
const badgeStyle: Record<string, string> = {
    "CRM Alerts": "bg-cyan-100 text-cyan-700",
    Update: "bg-purple-100 text-purple-700",
    Reminder: "bg-amber-100 text-amber-700",
    Mention: "bg-emerald-100 text-emerald-700",
    Alert: "bg-cyan-100 text-cyan-700",
};



export default function NotificationPage() {
    const { getToken, isAuthenticated } = useAuth();
    const { markRead, markAllRead } = useNotifications();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [onlyUnread, setOnlyUnread] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!isAuthenticated) return;
            try {
                setLoading(true);
                setError(false);
                const token = await getToken();
                const res = await fetchNotifications(token);
                if (res.success) {
                    setNotifications(res.data);
                }
            } catch (err) {
                console.error("Failed to load notifications:", err);
                setError(true);
                notify.error("Failed to load notifications", { description: "Please try again." });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isAuthenticated, getToken]);

    const filtered = onlyUnread
        ? notifications.filter((n) => !n.is_read)
        : notifications;

    const groupNotifications = (notifs: NotificationData[]) => {
        const groups: Record<string, NotificationData[]> = {
            "Today": [],
            "Yesterday": [],
            "Older": []
        };

        if (Array.isArray(notifs)) {
            notifs.forEach(n => {
                const date = new Date(n.created_at);
                if (isToday(date)) groups["Today"].push(n);
                else if (isYesterday(date)) groups["Yesterday"].push(n);
                else groups["Older"].push(n);
            });
        }

        return groups;
    };

    const grouped = groupNotifications(filtered);

    const markAllAsRead = async () => {
        try {
            await markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            notify.error("Failed to mark all as read", { description: "Please try again." });
        }
    };

    const handleNotificationClick = async (notif: NotificationData) => {
        if (!notif.is_read) {
            try {
                await markRead(notif.id);
                setNotifications((prev) => prev.map((n) =>
                    n.id === notif.id ? { ...n, is_read: true } : n
                ));
            } catch (err) {
                notify.error("Failed to mark notification as read", { description: "Please try again." });
            }
        }

        const route = getNotificationRoute(notif);
        if (route) {
            // Full page navigation (not router.push) - guarantees a fresh mount of
            // the target page even when already on it.
            window.location.href = route;
            return;
        }
        notify.info("This notification type can't be opened directly yet.");
    };

    return (
        <div className="w-full flex flex-col p-4 md:p-8 min-h-screen overflow-y-scroll">
            <PageHeader
                title="Notification"
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Notification" }]}
            />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between py-8">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <button
                        type="button"
                        onClick={() => setOnlyUnread(!onlyUnread)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${onlyUnread ? "bg-indigo-600" : "bg-gray-300"}`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${onlyUnread ? "translate-x-6" : "translate-x-1"}`}
                        />
                    </button>
                    Only show unread
                </label>

                <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 hover:underline self-start md:self-auto"
                >
                    Mark All as Read
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <p className="text-gray-500">Loading notifications...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
                    <p className="text-red-500">Couldn't load notifications.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm text-indigo-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
                    <p className="text-gray-500">No notifications found</p>
                </div>
            ) : (
                (["Today", "Yesterday", "Older"] as const).map((group) => {
                    const groupItems = grouped[group];
                    if (!groupItems || groupItems.length === 0) return null;

                    return (
                        <div key={group} className="mb-6">
                            <h3 className="text-sm bg-gray-50 p-4 font-semibold text-gray-500 rounded-t-lg border-x border-t">{group}</h3>

                            <div className="border-x border-b rounded-b-lg overflow-hidden">
                                {groupItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`relative border-b last:border-b-0 p-4 transition hover:shadow-sm cursor-pointer
                        ${item.is_read ? "bg-white" : "bg-indigo-50/40"}`}
                                    >
                                        {!item.is_read && (
                                            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                                        )}

                                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                            <div className="flex-1">
                                                <span
                                                    className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full mb-2 ${badgeStyle[item.type] || "bg-gray-100 text-gray-600"}`}
                                                >
                                                    {item.type || "Update"}
                                                </span>
                                                <h4 className="text-sm font-semibold text-gray-800">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 whitespace-nowrap">
                                                    {format(new Date(item.created_at), "d MMM yyyy 'at' HH:mm")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
