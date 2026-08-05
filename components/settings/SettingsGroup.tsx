"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SettingsSection } from "@/lib/types/Settings";
import SettingsMenuItem from "./SettingsMenuItem";

interface SettingsGroupProps {
  section: SettingsSection;
  isOpen: boolean;
  onToggle: () => void;
  isSectionActive: boolean;
  activeItemPath?: string;
}

export default function SettingsGroup({ section, isOpen, onToggle, isSectionActive, activeItemPath }: SettingsGroupProps) {
  const Icon = section.icon;
  const submenuId = `settings-submenu-${section.id}`;

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={submenuId}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isSectionActive ? "text-[#5479EE]" : "text-gray-700 hover:bg-gray-100",
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1 text-left">{section.title}</span>
        <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <div
        id={submenuId}
        className={cn(
          "ml-6 space-y-0.5 overflow-hidden transition-all duration-200",
          isOpen ? "mt-1 max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {section.children?.map((item) => (
          <SettingsMenuItem key={item.id} item={item} isActive={item.path === activeItemPath} />
        ))}
      </div>
    </div>
  );
}
