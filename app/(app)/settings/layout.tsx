"use client";

import { usePathname } from "next/navigation";
import { usePermission } from "@/lib/hooks/usePermission";
import { getRequiredPermission } from "@/lib/config/settingsNav";
import { SettingsSidebarProvider } from "@/lib/context/SettingsSidebarContext";
import SettingsLayout from "@/components/settings/SettingsLayout";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import SettingsContent from "@/components/settings/SettingsContent";
import AccessDenied from "@/components/settings/AccessDenied";

// Authentication itself is already handled by AuthenticatedLayout.tsx before
// this ever mounts - this guard only checks authorization (permission).
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can } = usePermission();

  const requiredPermission = getRequiredPermission(pathname);
  const allowed = !requiredPermission || can(requiredPermission);

  return (
    <SettingsSidebarProvider>
      <SettingsLayout>
        <SettingsSidebar />
        <SettingsContent>{allowed ? children : <AccessDenied />}</SettingsContent>
      </SettingsLayout>
    </SettingsSidebarProvider>
  );
}
