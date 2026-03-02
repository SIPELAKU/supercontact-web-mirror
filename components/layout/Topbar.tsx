"use client"

import { AppButton } from "@/components/ui/app-button"
import { useSidebar } from "@/lib/context/SidebarContext"
import { Bell, Menu } from "lucide-react"
import Notification from "../modal/Notification"
import ProfileDropdown from "./ProfileDropdown"
import { useEffect, useState } from "react"
import { fetchUnreadCount } from "@/lib/api"
import { useAuth } from "@/lib/context/AuthContext"

export default function Header() {
  const { toggleDesktop, toggleMobile } = useSidebar()
  const { getToken, isAuthenticated } = useAuth()
  const [openNotif, setOpenNotif] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!isAuthenticated) return;
      try {
        const token = await getToken();
        const res = await fetchUnreadCount(token);
        if (res.success) {
          setUnreadCount(res.data.count);
        }
      } catch (err) {
        console.error("Failed to load unread count:", err);
      }
    };

    loadUnreadCount();
    // Refresh every minute
    const interval = setInterval(loadUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, getToken]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-6 h-[52px]">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <AppButton
            variantStyle="text"
            className="h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
            onClick={() => toggleMobile()}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </AppButton>
        </div>

        <div className="hidden lg:block">
          <AppButton
            variantStyle="text"
            className="h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100"
            onClick={() => toggleDesktop()}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </AppButton>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AppButton onClick={() => setOpenNotif(!openNotif)} variantStyle="text" className="relative h-9 w-9 min-w-0 p-0 text-gray-700 hover:bg-gray-100">
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
        open={openNotif}
        onClose={() => setOpenNotif(false)}
      />
    </header>
  )
}
