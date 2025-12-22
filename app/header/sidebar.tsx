"use client";

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
  Server,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
        icon: BarChart3,
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
          { name: "Mailing List", path: "/mailing-list" },
          { name: "Subscribers", path: "/subscribers" },
        ],
      },
      {
        name: "Omnichannel",
        icon: Users,
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
    <aside className="w-[280px] h-screen fixed flex flex-col bg-white border-r border-gray-200 py-6 text-gray-700 overflow-y-auto z-10">
      {/* Logo */}
      <div className="flex items-center px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">SuperContact</h1>
            <p className="text-xs text-gray-500">Smart Relationship Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        {menuData.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-2 mb-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>

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
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                }

                // Menu item with children (collapsible)
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.name}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          isOpen ? "rotate-180" : ""
                        )}
                      />
                    </button>

                    {/* Submenu */}
                    {isOpen && item.children && (
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
      <div className="px-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">M</span>
          </div>
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
        </div>
      </div>
    </aside>
  );
}
