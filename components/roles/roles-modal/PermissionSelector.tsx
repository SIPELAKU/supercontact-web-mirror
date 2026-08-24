"use client";

import { AppInput } from "@/components/ui/app-input";
import { Poppins } from "next/font/google";
import { usePermissionCatalog } from "@/lib/hooks/usePermissionCatalog";
import { groupPermissions, formatPermissionLabel } from "@/lib/constants/permissions";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

interface PermissionSelectorProps {
  // The permission strings currently selected on the role.
  selected: string[];
  // Called when a checkbox is toggled; the parent owns the selection array so
  // save behavior is unchanged from the previous flat-list implementation.
  onToggle: (permission: string, checked: boolean) => void;
}

// Server-driven, domain-grouped permission checkbox list shared by the Add and
// Edit role modals. Fetches the authoritative catalog (falling back to the
// bundled constant) and renders it in labeled sections grouped by domain.
export default function PermissionSelector({ selected, onToggle }: PermissionSelectorProps) {
  const { permissions, isLoading, isFallback } = usePermissionCatalog();
  const groups = groupPermissions(permissions);

  return (
    <div className="space-y-5">
      {isLoading && (
        <p className={`text-[11px] text-gray-400 ${poppins.className}`}>Loading permissions...</p>
      )}
      {isFallback && !isLoading && (
        <p className={`text-[11px] text-amber-600 ${poppins.className}`}>
          Showing the built-in permission list (couldn&apos;t reach the live catalog).
        </p>
      )}

      {groups.map(({ group, items }) => (
        <div key={group} className="space-y-3">
          <h3
            className={`text-[11px] font-bold uppercase tracking-wider text-[#5479EE] ${poppins.className}`}
          >
            {group}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 ps-3">
            {items.map((permission) => (
              <div key={permission} className="flex items-center justify-between">
                <h2 className={`text-sm text-[#374151] ${poppins.className}`}>
                  {formatPermissionLabel(permission)}
                </h2>
                <AppInput
                  type="checkbox"
                  isBgWhite
                  checked={selected.includes(permission)}
                  onChange={(e) => onToggle(permission, e.target.checked)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
