"use client";

import { useSidebar } from "@/lib/context/SidebarContext";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Building2,
  ChevronDown,
  Contact,
  CreditCard,
  FileText,
  HelpCircle,
  Home,
  Mail,
  MessageCircle,
  Server,
  Settings,
  User,
  Users,
  Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Custom Sales Icon Component with robust fallback
const SalesIcon = ({ className }: { className?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <BarChart3 className={cn("w-5 h-5", className)} />;
  }

  return (
    <img
      src="/assets/sales-icon-sb.svg"
      alt="Sales"
      width={20}
      height={20}
      className={cn("w-5 h-5", className)}
      onError={() => setHasError(true)}
      style={{ display: hasError ? "none" : "block", minWidth: "20px", minHeight: "20px" }}
    />
  );
};

// Custom Omnichannel Icon Component with robust fallback
const OmnichannelIcon = ({ className }: { className?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Users className={cn("w-5 h-5", className)} />;
  }

  return (
    <img
      src="/assets/omnichannel.svg"
      alt="Omnichannel"
      width={20}
      height={20}
      className={cn("w-5 h-5", className)}
      onError={() => setHasError(true)}
      style={{ display: hasError ? "none" : "block", minWidth: "20px", minHeight: "20px" }}
    />
  );
};

// Custom Data Intelligence Icon Component with robust fallback
const DataIntelligenceIcon = ({ className }: { className?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Users className={cn("w-5 h-5", className)} />;
  }

  return (
    <img
      src="/icons/intelligence.png"
      alt="Data Intelligence"
      width={20}
      height={20}
      className={cn("w-5 h-5", className)}
      onError={() => setHasError(true)}
      style={{ display: hasError ? "none" : "block", minWidth: "20px", minHeight: "20px" }}
    />
  );
};

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
          { name: "Product", path: "/sales/product" },
          { name: "Lead", path: "/lead-management" },
          { name: "Pipeline", path: "/sales/pipeline" },
          { name: "Quotation", path: "/sales/quotation" },
        ],
      },
      {
        name: "Smart Capture",
        icon: Target,
        path: "/smart-capture",
      },
      {
        name: "Contact",
        icon: Contact,
        path: "/contact",
      },
      {
        name: "Whatsapp Marketing",
        icon: MessageCircle,
        children: [
          { name: "Recipients", path: "/whatsapp-marketing/recipients" },
          { name: "Broadcast Template", path: "/whatsapp-marketing/template-broadcasting" },
          { name: "Broadcast Group", path: "/whatsapp-marketing/group-broadcasting" },
          { name: "Broadcasts", path: "/whatsapp-marketing/broadcasting-wa" },
        ],
      },
      {
        name: "Email Marketing",
        icon: Mail,
        children: [
          { name: "All Subscribers", path: "/email-marketing/subscribers" },
          { name: "Campaign", path: "/email-marketing/campaigns" },
          { name: "Mailing List", path: "/email-marketing/mailing-lists" },
        ],
      },
      {
        name: "Omnichannel",
        icon: OmnichannelIcon,
        children: [
          { name: "Unified Inbox", path: "/omnichannel" },
        ],
      },
      {
        name: "Data Intelligence",
        icon: DataIntelligenceIcon,
        children: [
          {
            name: "Company Search",
            path: "/data-intelligence/industry-leaders",
          },
          { name: "Saved Companies", path: "/data-intelligence/company-intelligence" },
          { name: "Individual", path: "/data-intelligence/individual" },
          { name: "Lists", path: "/data-intelligence/lists" },
          { name: "Compliance", path: "/data-intelligence/compliance/suppression" },
          { name: "Integrations", path: "/admin/integrations" },
        ],
      },
      {
        name: "Analytics",
        icon: BarChart3,
        children: [
          { name: "Dashboard", path: "/analytics/dashboard" },
          // { name: "Customer Insight", path: "/analytics/customer-insight" },
          // { name: "Report Export", path: "/analytics/report-export" },
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
        children: [{ name: "Tickets", path: "/support/tickets" }],
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
        name: "User Control",
        icon: User,
        children: [
          { name: "User", path: "/users" },
          { name: "Roles & Permissions", path: "/roles" },
          { name: "Organization Structure", path: "/organization" },
        ],
      },
      {
        name: "Billing",
        icon: CreditCard,
        path: "/subscription",
      },
      {
        name: "Settings",
        icon: Settings,
        children: [
          { name: "Mail Server", path: "/admin/mail-servers" },
          { name: "WhatsApp Account", path: "/admin/whatsapp-accounts" },
          { name: "Email Account", path: "/admin/email-accounts" },
          { name: "Integrations", path: "/admin/integrations" },
        ],
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
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[menuName] = !prev[menuName];
      return newState;
    });
  };

  const isMenuActive = (item: MenuItem): boolean => {
    if (item.path) {
      return pathname === item.path || pathname.startsWith(item.path + "/");
    }
    if (item.children) {
      return item.children.some((child) => pathname === child.path || pathname.startsWith(child.path + "/"));
    }
    return false;
  };

  const isSubItemActive = (path: string): boolean => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <>
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden",
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
                              ? "bg-[#5479EE] text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
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
                              ? "bg-[#5479EE] text-white"
                              : "text-gray-700 hover:bg-gray-100",
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          {!isCollapsed && (
                            <>
                              <span className="flex-1 text-left">
                                {item.name}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "w-4 h-4 transition-transform",
                                  isOpen ? "rotate-180" : "",
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
                                    ? "text-[#5479EE] font-medium"
                                    : "text-gray-600 hover:bg-gray-50",
                                )}
                              >
                                <div className={cn("w-2 h-2 rounded-full", isSubItemActive(subItem.path) ? "bg-[#5479EE]" : "bg-gray-400 opacity-60")} />
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
