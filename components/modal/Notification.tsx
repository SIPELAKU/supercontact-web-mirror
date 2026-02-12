"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppButton } from "../ui/app-button";
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead, NotificationData } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface NotificationProps {
  open: boolean;
  onClose: () => void;
}

export default function Notification({ open, onClose }: NotificationProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { getToken, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!open || !isAuthenticated) return;
      try {
        setLoading(true);
        const token = await getToken();
        const res = await fetchNotifications(token);
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [open, isAuthenticated, getToken]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // close when click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const handleMarkAllRead = async () => {
    try {
      const token = await getToken();
      const res = await markAllNotificationsAsRead(token);
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const token = await getToken();
      const res = await markNotificationAsRead(token, id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1300]">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* modal */}
      <div
        ref={modalRef}
        className="absolute right-4 top-16 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-xl border overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Notifications</h2>
          </div>
          {notifications.filter(n => !n.is_read).length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
              {notifications.filter(n => !n.is_read).length} New
            </span>
          )}
        </div>

        {/* content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">Loading notifications...</div>
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
                  onClick={() => handleMarkRead(notif.id)}
                />
              ))}
            </>
          )}
        </div>

        {/* footer */}
        <div className="p-3 border-t">
          <Link href={"/notifications"}>
            <AppButton onClick={() => onClose()} className="w-full">
              View All Notifications
            </AppButton>
          </Link>
        </div>
      </div>
    </div>,
    document.body
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
      className={`px-4 py-3 border-b last:border-b-0 cursor-pointer ${isRead ? 'opacity-70' : 'bg-blue-50/30 hover:bg-gray-50'}`}
    >
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${tagColor}`}>
        {tag}
      </span>
      {/* <p className={`text-sm ${isRead ? 'font-normal' : 'font-semibold'} text-gray-800`}>{title}</p> */}
      {description && <p className={`text-sm ${isRead ? 'font-normal' : 'font-semibold'} text-gray-800`}>{description}</p>}
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div >
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
