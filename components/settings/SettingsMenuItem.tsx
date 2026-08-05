"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { SettingsItem } from "@/lib/types/Settings";

interface SettingsMenuItemProps {
  item: SettingsItem;
  isActive: boolean;
}

export default function SettingsMenuItem({ item, isActive }: SettingsMenuItemProps) {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive ? "text-[#5479EE] font-medium bg-[#EEF2FD]" : "text-gray-600 hover:bg-gray-50",
      )}
    >
      {Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : (
        <div className={cn("w-2 h-2 rounded-full shrink-0", isActive ? "bg-[#5479EE]" : "bg-gray-400 opacity-60")} />
      )}
      <span>{item.title}</span>
    </Link>
  );
}
