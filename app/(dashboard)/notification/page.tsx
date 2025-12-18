"use client";

import { useState } from "react";
import BannerDashboard from "@/components/ui/banner-dashboard"

interface Notification {
  id: number;
  category: string;
  title: string;
  description: string;
  time: string;
  dateGroup: "Today" | "Yesterday";
  read: boolean;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    category: "CRM Alerts",
    title: "Kira Jaxx shared feedback on the new lead form",
    description: "Address feedback by Friday",
    time: "5 Dec 2025 at 14:00",
    dateGroup: "Today",
    read: false,
  },
  {
    id: 2,
    category: "Update",
    title: "Jane Cooper changed a deal status",
    description: "Check for updates in the pipeline",
    time: "5 Dec 2025 at 09:41",
    dateGroup: "Today",
    read: false,
  },
  {
    id: 3,
    category: "Reminder",
    title: "Sara Lema has a meeting scheduled",
    description: "Don’t forget to prepare the presentation",
    time: "5 Dec 2025 at 09:00",
    dateGroup: "Today",
    read: true,
  },
  {
    id: 4,
    category: "Mention",
    title: "Budi Santoso mentioned you",
    description: "Please check this ticket, urgent",
    time: "4 Dec 2025 at 20:07",
    dateGroup: "Yesterday",
    read: true,
  },
  {
    id: 5,
    category: "Update",
    title: "John Doe updated the project status",
    description: "Review the changes made in the last sprint",
    time: "4 Dec 2025 at 14:32",
    dateGroup: "Yesterday",
    read: true,
  },
];

const badgeStyle: Record<string, string> = {
  "CRM Alerts": "bg-cyan-100 text-cyan-700",
  Update: "bg-purple-100 text-purple-700",
  Reminder: "bg-amber-100 text-amber-700",
  Mention: "bg-emerald-100 text-emerald-700",
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [onlyUnread, setOnlyUnread] = useState(false);

  const filtered = onlyUnread
    ? notifications.filter((n) => !n.read)
    : notifications;

  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  return (
    <div className="w-full flex flex-col p-4 md:p-8 min-h-screen overflow-y-scroll">
      <BannerDashboard
        title="Notification"
        breadcrumbs={["Notification Page"]}
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
      {(["Today", "Yesterday"] as const).map((group) => {
        const groupItems = filtered.filter((n) => n.dateGroup === group);
        if (!groupItems.length) return null;

        return (
          <div key={group} className="">
            <h3 className="text-sm bg-gray-100 p-4 font-semibold text-gray-500">{group}</h3>

            <div className="">
              {groupItems.map((item) => (
                <div
                  key={item.id}
                  className={`relative border p-4 transition hover:shadow-sm cursor-pointer
                    ${item.read ? "bg-white" : "bg-indigo-50"}`}
                >
                  {!item.read && (
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-indigo-600" />
                  )}

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <div className="flex-1">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${badgeStyle[item.category]}`}
                      >
                        {item.category}
                      </span>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {item.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>

                    <p className="text-xs text-gray-400 whitespace-nowrap md:text-right">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
