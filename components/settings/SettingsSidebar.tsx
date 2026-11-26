"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { usePermission } from "@/lib/hooks/usePermission";
import { useSettingsSidebar } from "@/lib/context/SettingsSidebarContext";
import { settingsNav, findActiveSettingsEntry } from "@/lib/config/settingsNav";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/hooks/useT";
import SettingsGroup from "./SettingsGroup";
import SettingsMenuItem from "./SettingsMenuItem";

export default function SettingsSidebar() {
  const pathname = usePathname();
  const { can } = usePermission();
  const { nav } = useT();
  const { isMobileOpen, openGroups, closeMobile, toggleGroup, openGroup } = useSettingsSidebar();

  const activeEntry = findActiveSettingsEntry(pathname);

  // Auto-expand the section containing the active route (deep-link/refresh).
  useEffect(() => {
    if (activeEntry?.section.children) openGroup(activeEntry.section.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close the mobile/tablet drawer on every navigation.
  useEffect(() => {
    closeMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Titles in the chosen language; ids and paths stay as they are.
  const visibleSections = settingsNav
    .map((section) => {
      if (section.children) {
        const children = section.children
          .filter((item) => !item.permission || can(item.permission))
          .map((item) => ({ ...item, title: nav(item.title) }));
        if (children.length === 0) return null;
        return { ...section, title: nav(section.title), children };
      }
      if (section.permission && !can(section.permission)) return null;
      return { ...section, title: nav(section.title) };
    })
    .filter((section): section is NonNullable<typeof section> => section !== null);

  const navContent = (
    <nav className="flex flex-col gap-1 p-3">
      {visibleSections.map((section) =>
        section.children ? (
          <SettingsGroup
            key={section.id}
            section={section}
            isOpen={!!openGroups[section.id]}
            onToggle={() => toggleGroup(section.id)}
            isSectionActive={activeEntry?.section.id === section.id}
            activeItemPath={activeEntry?.item?.path}
          />
        ) : (
          <SettingsMenuItem
            key={section.id}
            item={{ id: section.id, title: section.title, path: section.path!, icon: section.icon }}
            isActive={activeEntry?.section.id === section.id}
          />
        )
      )}
    </nav>
  );

  return (
    <>
      <aside
        className={cn(
          // lg: a plain column, as tall as SettingsLayout. The menu scrolls
          // inside it, with a slim scrollbar shown while the pointer is on the
          // sidebar (the hover has to be on a parent, see scrollbar-on-hover).
          "scrollbar-hover-zone fixed lg:static top-0 left-0 z-40 h-screen lg:h-full w-[260px] shrink-0",
          "flex flex-col bg-white border-r border-border transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-on-hover">{navContent}</div>
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={closeMobile} />
      )}
    </>
  );
}
