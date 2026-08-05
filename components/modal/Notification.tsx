"use client";

import { useEffect, useState } from "react";
import { Menu } from "@mui/material";
import { AppButton } from "../ui/app-button";
import { fetchNotifications, getNotificationRoute, NotificationData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useNotifications } from "@/lib/context/NotificationsContext";
import { notify } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function Notification({ anchorEl, open, onClose }: NotificationProps) {
  const { getToken, isAuthenticated } = useAuth();
  const { markRead, markAllRead, lastPushAt } = useNotifications();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadNotifications = async () => {
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

  useEffect(() => {
    if (open) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated]);

  // A real-time push arrived while the dropdown is open - refetch so the
  // list reflects it instead of only the header badge count.
  useEffect(() => {
    if (open && lastPushAt) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPushAt]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      notify.error("Failed to mark all as read", { description: "Please try again." });
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      notify.error("Failed to mark notification as read", { description: "Please try again." });
    }
  };

  const handleNotificationClick = (notif: NotificationData) => {
    if (!notif.is_read) handleMarkRead(notif.id);
    const route = getNotificationRoute(notif);
    if (route) {
      onClose();
      // Full page navigation (not router.push) - guarantees a fresh mount of
      // the target page even when already on it (e.g. clicking a different
      // conversation notification while already on /omnichannel), instead of
      // depending on client-side state re-syncing to a changed query param.
      window.location.href = route;
      return;
    }
    notify.info("This notification type can't be opened directly yet.");
  };

  const unreadInList = notifications.filter((n) => !n.is_read).length;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      MenuListProps={{ sx: { p: 0 } }}
      slotProps={{
        paper: {
          "aria-label": "Notifications",
          sx: {
            width: 360,
            maxWidth: "calc(100vw - 2rem)",
            borderRadius: 3,
            overflow: "hidden",
          },
        },
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Notifications</h2>
        {unreadInList > 0 && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {unreadInList} New
          </span>
        )}
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Couldn't load notifications.
            <button onClick={loadNotifications} className="block mx-auto mt-2 text-indigo-600 hover:underline">
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No notifications yet</div>
        ) : (
          <>
            <SectionLabel label="Recent" action="Mark All as Read" onAction={handleMarkAllRead} />
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                tag={notif.type || "Update"}
                tagColor={getTagColor(notif.type)}
                title={notif.title}
                description={notif.description}
                time={formatTime(notif.created_at)}
                isRead={notif.is_read}
                onClick={() => handleNotificationClick(notif)}
              />
            ))}
          </>
        )}
      </div>

      <div className="p-3 border-t">
        <Link href={"/notifications"}>
          <AppButton onClick={() => onClose()} className="w-full">
            View All Notifications
          </AppButton>
        </Link>
      </div>
    </Menu>
  );
}

function SectionLabel({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
      <span>{label}</span>
      {action && <button onClick={onAction} className="text-indigo-600 hover:underline">{action}</button>}
    </div>
  );
}

function NotificationItem({
  tag,
  tagColor,
  title,
  description,
  time,
  isRead,
  onClick,
}: {
  tag: string;
  tagColor: string;
  title: string;
  description?: string;
  time: string;
  isRead?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${isRead ? "bg-white" : "bg-indigo-50/40"}`}
    >
      {!isRead && (
        <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
      )}
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${tagColor}`}>
        {tag}
      </span>
      <p className={`text-sm ${isRead ? "font-normal" : "font-semibold"} text-gray-800 pr-4`}>{title}</p>
      {description && <p className="text-sm text-gray-500 mt-0.5 pr-4">{description}</p>}
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  );
}

function getTagColor(type: string) {
  switch (type?.toLowerCase()) {
    case 'update': return 'bg-purple-100 text-purple-700';
    case 'reminder': return 'bg-amber-100 text-amber-700';
    case 'mention': return 'bg-emerald-100 text-emerald-700';
    case 'alert': return 'bg-cyan-100 text-cyan-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function formatTime(dateString: string) {
  if (!dateString) return "";
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (e) {
    return dateString;
  }
}
