"use client"

import { createContext, useContext, useEffect, useState } from "react"

const COLLAPSED_STORAGE_KEY = "sidebarCollapsed"

export type SidebarContextType = {
  isCollapsed: boolean
  isMobileOpen: boolean
  toggleDesktop: () => void
  toggleMobile: () => void
  closeMobile: () => void
  expandDesktop: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // SSR always renders expanded (matches the default below); the persisted
  // value is applied on mount, same one-frame-flash tradeoff AuthContext's
  // localStorage-backed fields already accept.
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    setIsCollapsed(localStorage.getItem(COLLAPSED_STORAGE_KEY) === "true")
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(isCollapsed))
  }, [isCollapsed])

  const toggleDesktop = () => setIsCollapsed((prev) => !prev)
  const expandDesktop = () => setIsCollapsed(false)
  const toggleMobile = () => setIsMobileOpen((prev) => !prev)
  const closeMobile = () => setIsMobileOpen(false)

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, isMobileOpen, toggleDesktop, toggleMobile, closeMobile, expandDesktop }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be inside SidebarProvider")
  return ctx
}
