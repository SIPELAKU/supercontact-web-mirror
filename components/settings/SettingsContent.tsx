"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// On desktop this column is the only thing that scrolls (see SettingsLayout).
// The layout stays mounted across settings pages, so the browser's own
// scroll-to-top on navigation doesn't reach it: reset it per page instead.
export default function SettingsContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div ref={ref} className="flex-1 min-w-0 p-6 md:p-8 lg:overflow-y-auto">
      {children}
    </div>
  );
}
