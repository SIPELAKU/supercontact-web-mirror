"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resolveListHref } from "@/components/ui/super-table";
import type { BreadcrumbItem } from "@/lib/types/Pipeline";

interface SettingsBreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * A breadcrumb href is a bare path, so pressing "Daftar Harga" from a price
 * list's detail page used to land on page 1 of an unfiltered list - losing the
 * page, search, sort and filters the user had set before they clicked in.
 * That is exactly the defect `useListCursor` exists to fix, and until now only
 * `components/ui/page-header.tsx` applied it.
 *
 * Resolved in an effect with the plain href as the initial value, so the
 * server and the first client render agree and a visitor with no stored cursor
 * simply gets today's behaviour. This also fixes the Phase 1 category, unit and
 * custom-field detail routes.
 */
function useResolvedHref(href?: string) {
  const [resolved, setResolved] = useState(href);

  useEffect(() => {
    setResolved(href ? resolveListHref(href) : href);
  }, [href]);

  return resolved;
}

function BreadcrumbLink({ href, label }: { href: string; label: string }) {
  const resolved = useResolvedHref(href);
  return (
    <Link href={resolved ?? href} className="hover:text-gray-700 hover:underline">
      {label}
    </Link>
  );
}

// Compact text breadcrumb - deliberately lighter-weight than
// components/ui/page-header.tsx's bordered-card breadcrumb row, per the
// spec's "remove large page header card, compact breadcrumb + title"
// guideline. Reuses the same BreadcrumbItem[] data shape so no new contract
// is introduced, just a lighter renderer.
export default function SettingsBreadcrumb({ items }: SettingsBreadcrumbProps) {
  return (
    <nav className="flex items-center flex-wrap gap-1 text-xs text-gray-500 mb-1">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          {idx > 0 && <span className="text-gray-300">/</span>}
          {item.href ? (
            <BreadcrumbLink href={item.href} label={item.label} />
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
