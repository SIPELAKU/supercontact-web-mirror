"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

interface NotificationProps {
  open: boolean;
  onClose: () => void;
}

export default function Notification({ open, onClose }: NotificationProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* modal */}
      <div
        ref={modalRef}
        className="absolute right-4 top-16 w-[360px] max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-xl border overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Notifications</h2>
          </div>
            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">2 New</span>
        </div>

        {/* content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {/* Today */}
          <SectionLabel label="Today" action="Mark All as Read" />

          <NotificationItem
            tag="CRM Alerts"
            tagColor="bg-cyan-100 text-cyan-700"
            title="Kira Knox shared feedback on the new lead form"
            time="5 Dec 2025 at 14:00"
          />

          <NotificationItem
            tag="Update"
            tagColor="bg-purple-100 text-purple-700"
            title="Jane Cooper changed a deal status"
            time="5 Dec 2025 at 09:41"
          />

          <NotificationItem
            tag="Reminder"
            tagColor="bg-amber-100 text-amber-700"
            title="Sara Lamb has a meeting scheduled"
            time="5 Dec 2025 at 09:00"
          />

          {/* Yesterday */}
          <div className="bg-gray-50">
            <SectionLabel label="Yesterday" />
          </div>

          <NotificationItem
            tag="Mention"
            tagColor="bg-emerald-100 text-emerald-700"
            title="Budi Santoso mentioned you"
            time="4 Dec 2025 at 20:07"
          />

          <NotificationItem
            tag="Update"
            tagColor="bg-purple-100 text-purple-700"
            title="John Doe updated the project status"
            time="4 Dec 2025 at 14:32"
          />
        </div>

        {/* footer */}
        <div className="p-3 border-t">
            <Link href={"/notification"}>
                <button onClick={()=>onClose()} className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm py-2">
                    View All Notifications
                </button>
            </Link>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label, action }: { label: string; action?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500">
      <span>{label}</span>
      {action && <button className="text-indigo-600 hover:underline">{action}</button>}
    </div>
  );
}

function NotificationItem({
  tag,
  tagColor,
  title,
  time,
}: {
  tag: string;
  tagColor: string;
  title: string;
  time: string;
}) {
  return (
    <div className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer">
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${tagColor}`}>
        {tag}
      </span>
      <p className="text-sm font-medium text-gray-800">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{time}</p>
    </div>
  );
}
