"use client";

import { useSidebar } from "@/lib/context/SidebarContext";
import { usePermission } from "@/lib/hooks/usePermission";
import { sidebarNav as menuData, type MenuItem, type MenuSection } from "@/lib/config/sidebarNav";
import { useT } from "@/lib/hooks/useT";
import { cn } from "@/lib/utils";
import { Tooltip } from "@mui/material";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Finds the most-specific active match across the whole (unfiltered) menu:
// an exact match always wins outright; among prefix matches, the longest
// path wins. Prevents siblings where one path is a literal prefix of
// another (e.g. /support/tickets vs /support/tickets/dashboard) from both
// lighting up as active at once.
function findActivePath(pathname: string): string | null {
  let best: string | null = null;
  for (const section of menuData) {
    for (const item of section.items) {
      const candidates = item.path ? [item.path] : (item.children ?? []).map((c) => c.path);
      for (const path of candidates) {
        if (pathname === path) return path;
        if (pathname.startsWith(path + "/") && (!best || path.length > best.length)) {
          best = path;
        }
      }
    }
  }
  return best;
}

function findParentGroupName(activePath: string | null): string | null {
  if (!activePath) return null;
  for (const section of menuData) {
    for (const item of section.items) {
      if (item.children?.some((c) => c.path === activePath)) return item.name;
    }
  }
  return null;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile, expandDesktop } = useSidebar();
  const { can } = usePermission();
  const { nav } = useT();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const activePath = findActivePath(pathname);
  const activeGroupName = findParentGroupName(activePath);

  // Auto-expand the branch containing the active route (e.g. on deep-link
  // or hard refresh) - merges rather than replaces so it doesn't fight a
  // group the user opened manually.
  useEffect(() => {
    if (activeGroupName) {
      setOpenMenus((prev) => (prev[activeGroupName] ? prev : { ...prev, [activeGroupName]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close the mobile drawer on every navigation instead of leaving it open
  // over the destination page.
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[menuName] = !prev[menuName];
      return newState;
    });
  };

  const handleGroupClick = (menuName: string) => {
    if (isCollapsed) {
      // Collapsed groups have no path of their own to navigate to - re-expand
      // the rail and open this group instead of doing nothing.
      expandDesktop();
      setOpenMenus({ [menuName]: true });
      return;
    }
    toggleMenu(menuName);
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) return item.path === activePath;
    return item.children?.some((c) => c.path === activePath) ?? false;
  };

  const visibleMenuData: MenuSection[] = menuData
    .map((section) => {
      const items = section.items
        .map((item): MenuItem | null => {
          if (item.children) {
            const children = item.children.filter((child) => !child.permission || can(child.permission));
            if (children.length === 0) return null;
            return { ...item, children };
          }
          if (item.permission && !can(item.permission)) return null;
          return item;
        })
        .filter((item): item is MenuItem => item !== null);
      if (items.length === 0) return null;
      return { ...section, items };
    })
    .filter((section): section is MenuSection => section !== null);

  return (
    <>
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-border transition-all duration-300 overflow-hidden",
          isMobileOpen
            ? "translate-x-0 w-[280px]"
            : "-translate-x-full w-[280px] lg:translate-x-0",
          isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className={cn(
              "flex items-center px-6 py-6",
              isCollapsed && "px-4 justify-center",
            )}
          >
            {!isCollapsed ? (
              <Image
                src="/assets/sc-logo-primary.svg"
                alt="SmartSales Logo"
                width={180}
                height={60}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src="/assets/logo3d.png"
                alt="SmartSales Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {visibleMenuData.map((section) => (
              <div key={section.title} className="mb-6">
                <h3
                  className={cn(
                    "px-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider overflow-hidden whitespace-nowrap transition-all duration-300",
                    isCollapsed ? "opacity-0 max-h-0 mb-0" : "opacity-100 max-h-6",
                  )}
                >
                  {nav(section.title)}
                </h3>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isMenuActive(item);
                    const isOpen = openMenus[item.name];
                    const Icon = item.icon;
                    const submenuId = `submenu-${item.name.replace(/\s+/g, "-").toLowerCase()}`;

                    if (item.path && !item.children) {
                      const link = (
                        <Link
                          key={item.name}
                          href={item.path}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isCollapsed && "justify-center px-2",
                            isActive
                              ? "bg-[#5479EE] text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span
                            className={cn(
                              "overflow-hidden whitespace-nowrap transition-all duration-300",
                              isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[180px]",
                            )}
                          >
                            {nav(item.name)}
                          </span>
                        </Link>
                      );
                      return isCollapsed ? (
                        <Tooltip key={item.name} title={nav(item.name)} placement="right">
                          {link}
                        </Tooltip>
                      ) : (
                        link
                      );
                    }

                    // Menu item with children (collapsible)
                    const groupButton = (
                      <button
                        type="button"
                        onClick={() => handleGroupClick(item.name)}
                        aria-expanded={isOpen}
                        aria-controls={submenuId}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                          isCollapsed && "justify-center px-2",
                          isActive
                            ? "bg-[#5479EE] text-white"
                            : "text-gray-700 hover:bg-gray-100",
                        )}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span
                          className={cn(
                            "flex-1 text-left overflow-hidden whitespace-nowrap transition-all duration-300",
                            isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[140px]",
                          )}
                        >
                          {nav(item.name)}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 shrink-0 transition-transform duration-300",
                            isOpen ? "rotate-180" : "",
                            isCollapsed && "hidden",
                          )}
                        />
                      </button>
                    );

                    return (
                      <div key={item.name}>
                        {isCollapsed ? (
                          <Tooltip title={nav(item.name)} placement="right">
                            {groupButton}
                          </Tooltip>
                        ) : (
                          groupButton
                        )}

                        {/* Submenu */}
                        {/* Grid rows 0fr -> 1fr animates to the list's own
                            height; a fixed max-height cap clips long groups. */}
                        {!isCollapsed && item.children && (
                          <div
                            id={submenuId}
                            className={cn(
                              "ml-8 grid transition-all duration-300",
                              isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <div className="min-h-0 space-y-1 overflow-hidden">
                            {item.children.map((subItem) => {
                              const subActive = subItem.path === activePath;
                              return (
                                <Link
                                  key={subItem.path}
                                  href={subItem.path}
                                  aria-current={subActive ? "page" : undefined}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                    subActive
                                      ? "text-[#5479EE] font-medium"
                                      : "text-gray-600 hover:bg-gray-50",
                                  )}
                                >
                                  <div className={cn("w-2 h-2 rounded-full shrink-0", subActive ? "bg-[#5479EE]" : "bg-gray-400 opacity-60")} />
                                  <span>{nav(subItem.name)}</span>
                                </Link>
                              );
                            })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

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
  );
}
