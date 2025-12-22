"use client";

import { useSidebar } from "@/lib/context/SidebarContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  ChevronDown,
  FileText,
  HelpCircle,
  Home,
  Mail,
  Power,
  Server
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Custom Sales Icon Component
const SalesIcon = ({ className }: { className?: string }) => (
  <Image
    src="/assets/sales-icon-sb.svg"
    alt="Sales Icon"
    width={20}
    height={20}
    className={className}
  />
);

// Custom Omnichannel Icon Component
const OmnichannelIcon = ({ className }: { className?: string }) => (
  <Image
    src="/assets/omnichannel.svg"
    alt="Omnichannel Icon"
    width={20}
    height={20}
    className={className}
  />
);

type MenuSubItem = {
  name: string;
  path: string;
};

type MenuItem = {
  name: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuSubItem[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuData: MenuSection[] = [
  {
    title: "HOME",
    items: [
      {
        name: "Home",
        icon: Home,
        path: "/dashboard",
      },
    ],
  },
  {
    title: "APPS",
    items: [
      {
        name: "Sales",
        icon: SalesIcon,
        children: [
          { name: "Dashboard", path: "/sales/dashboard" },
          { name: "Lead", path: "/lead-management" },
          { name: "Pipeline", path: "/sales/pipeline" },
          { name: "Quotation", path: "/sales/quotation" },
        ],
      },
      {
        name: "Email Marketing",
        icon: Mail,
        children: [
          { name: "Mailing List", path: "/email-marketing/mailing-list" },
          { name: "Subscribers", path: "/email-marketing/subscribers" },
        ],
      },
      {
        name: "Omnichannel",
        icon: OmnichannelIcon,
        children: [
          { name: "Company Intelligence", path: "/omnichannel/company-intelligence" },
          { name: "Unified Inbox", path: "/omnichannel/unified-inbox" },
        ],
      },
      {
        name: "Analytics",
        icon: BarChart3,
        children: [
          { name: "Dashboard", path: "/analytics/dashboard" },
          { name: "Customer Insight", path: "/analytics/customer-insight" },
          { name: "Report Export", path: "/analytics/report-export" },
        ],
      },
      {
        name: "Notes",
        icon: FileText,
        path: "/notes",
      },
      {
        name: "Support",
        icon: HelpCircle,
        children: [
          { name: "Tickets", path: "/support/tickets" },
        ],
      },
    ],
  },
  {
    title: "ADMIN",
    items: [
      {
        name: "Company Profile",
        icon: Building2,
        path: "/admin/company-profile",
      },
      {
        name: "Mail Servers",
        icon: Server,
        path: "/admin/mail-servers",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      // Close all other menus and toggle the clicked one
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[menuName] = !prev[menuName];
      return newState;
    });
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) {
      return pathname === item.path;
    }
    if (item.children) {
      return item.children.some(child => pathname === child.path);
    }
    return false;
  };

  const isSubItemActive = (path: string): boolean => {
    return pathname === path;
  };

  return (
    <>
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden",
          isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px] lg:translate-x-0",
          isCollapsed ? "lg:w-[80px]" : "lg:w-[280px]"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center px-6 py-6 border-b border-gray-200",
            isCollapsed && "px-4 justify-center"
          )}>
            {!isCollapsed ? (
              <Image
                src="/assets/sc-logo.png"
                alt="SuperContact Logo"
                width={180}
                height={60}
                className="object-contain"
                priority
              />
            ) : (
              <Image
                src="/assets/sc-logo.png"
                alt="SuperContact Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            {menuData.map((section) => (
              <div key={section.title} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = isMenuActive(item);
                    const isOpen = openMenus[item.name];
                    const Icon = item.icon;

                    if (item.path && !item.children) {
                      // Simple menu item without children
                      return (
                        <Link
                          key={item.name}
                          href={item.path}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isCollapsed && "justify-center px-2",
                            isActive
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                      );
                    }

                    // Menu item with children (collapsible)
                    return (
                      <div key={item.name}>
                        <button
                          onClick={() => !isCollapsed && toggleMenu(item.name)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            isCollapsed && "justify-center px-2",
                            isActive
                              ? "bg-blue-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">{item.name}</span>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 transition-transform",
                                  isOpen ? "rotate-180" : ""
                                )}
                              />
                            </>
                          )}
                        </button>

                        {/* Submenu */}
                        {!isCollapsed && isOpen && item.children && (
                          <div className="mt-1 ml-8 space-y-1">
                            {item.children.map((subItem) => (
                              <Link
                                key={subItem.path}
                                href={subItem.path}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                                  isSubItemActive(subItem.path)
                                    ? "bg-blue-50 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                )}
                              >
                                <div className="w-2 h-2 rounded-full bg-current opacity-60" />
                                <span>{subItem.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-lg bg-blue-50",
              isCollapsed && "justify-center"
            )}>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">M</span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Muhammad...</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate">Administrator</p>
                      <span className="px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">+2</span>
                    </div>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                    <Power className="w-4 h-4" />
                  </button>
                </>
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
  );
}
