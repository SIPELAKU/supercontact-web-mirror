"use client"

import { AppButton } from "@/components/ui/app-button"
import { useSidebar } from "@/lib/context/SidebarContext"
import { useNotifications } from "@/lib/context/NotificationsContext"
import { Bell, Menu } from "lucide-react"
import Notification from "../modal/Notification"
import ProfileDropdown from "./ProfileDropdown"
import { useState } from "react"

export default function Header() {
  const { toggleDesktop, toggleMobile } = useSidebar()
  const { unreadCount } = useNotifications()
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const notifOpen = Boolean(notifAnchorEl);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-6 h-[52px]">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <AppButton
            variantStyle="text"
            aria-label="Toggle navigation menu"
            className="h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
            onClick={() => toggleMobile()}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </AppButton>
        </div>

        <div className="hidden lg:block">
          <AppButton
            variantStyle="text"
            aria-label="Toggle sidebar"
            className="h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
            onClick={() => toggleDesktop()}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </AppButton>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AppButton
          onClick={(e) => setNotifAnchorEl(e.currentTarget)}
          variantStyle="text"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
          className="relative h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </AppButton>

        <ProfileDropdown />
      </div>
      <Notification
        anchorEl={notifAnchorEl}
        open={notifOpen}
        onClose={() => setNotifAnchorEl(null)}
      />
    </header>
  )
}
