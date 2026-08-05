"use client";

import { Menu } from "lucide-react";
import { useSettingsSidebar } from "@/lib/context/SettingsSidebarContext";
import SettingsBreadcrumb from "./SettingsBreadcrumb";
import type { BreadcrumbItem } from "@/lib/types/Pipeline";

interface SettingsPageHeaderProps {
  title: React.ReactNode;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

// Deliberately not a wrapper around components/ui/page-header.tsx - that
// component is the bordered-card-with-image-slot the spec explicitly says
// to remove for Settings. Compact, no border/shadow, 8px-grid spacing.
export default function SettingsPageHeader({ title, description, breadcrumbs, actions }: SettingsPageHeaderProps) {
  const { toggleMobile } = useSettingsSidebar();

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={toggleMobile}
        aria-label="Toggle settings menu"
        className="lg:hidden mb-2 -ml-1.5 p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
      >
        <Menu className="w-5 h-5" />
      </button>
      {breadcrumbs && breadcrumbs.length > 0 && <SettingsBreadcrumb items={breadcrumbs} />}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
