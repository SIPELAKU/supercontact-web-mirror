"use client"

import { usePathname } from "next/navigation"
import { useSidebar } from "@/lib/context/SidebarContext"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { navigation } from "../../lib/data/sidebar-navigation"
import { Avatar, AvatarFallback } from "@/components/ui-mui/avatar"
// import Logout from "@/public/icons/logout.svg"
// import IconSc from '@/public/icons/sc.png'

export default function Sidebar() {
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <>
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-border transition-all duration-300 overflow-hidden",
          isMobileOpen ? "translate-x-0 w-54" : "-translate-x-full w-54 lg:translate-x-0",
          isCollapsed ? "lg:w-[62px]" : "lg:w-54"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center px-6 py-6 ${ isCollapsed ? 40 : 160 }`}>
            <Image
              src={"/icons/sc.png"}
              width="250"
              height="250"
              alt="SuperContact Logo"
              priority
            />
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors h-[42px]",

                    isCollapsed
                      ? "justify-center px-0"
                      : "px-3 gap-3",

                    isActive
                      ? "bg-[#5479EE] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Image
                    src={isActive ? item.activeIcon : item.icon}
                    alt={item.name}
                    width={22}
                    height={22}
                  />
                  {!isCollapsed && (
                    <span className="whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-border">
            <div
              className={cn(
                "flex items-center rounded-lg bg-blue-50 p-2",
                isCollapsed && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8 bg-blue-600">
                <AvatarFallback className="text-white bg-[#5479EE]">M</AvatarFallback>
              </Avatar>

              {!isCollapsed && (
                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-sm font-medium truncate">Muhamm...</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Adminis... +2
                  </p>
                </div>
              )}

              {!isCollapsed && (
                <Image
                  src={"/icons/logout.svg"}
                  alt="Logout"
                  width={22}
                  height={22}
                  className="shrink-0 cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={closeMobile}
        />
      )}
    </>
  )
}
