"use client"

import { Button } from "@/components/ui/button"
import { useSidebar } from "@/lib/context/SidebarContext"
import { Bell, Menu, Moon, Sun } from "lucide-react"
import { useState } from "react"
import Notification from "../modal/Notification"
import ProfileDropdown from "./ProfileDropdown"

export default function Header() {
  const [isDark, setIsDark] = useState(false)
  const { toggleDesktop, toggleMobile } = useSidebar()
  const [openNotif, setOpenNotif] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-white px-6 h-[52px]">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 lg:hidden" 
          onClick={() => toggleMobile()}
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hidden lg:flex" 
          onClick={() => toggleDesktop()}
        >
          <Menu className="h-6 w-6 text-gray-700" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={() => setOpenNotif(!openNotif)} variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-yellow-400 rounded-full" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <ProfileDropdown />
      </div>
      <Notification
        open={openNotif}
        onClose={() => setOpenNotif(false)}
      />
    </header>
  )
}
