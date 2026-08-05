"use client";

import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/types/Pipeline";

interface SettingsBreadcrumbProps {
  items: BreadcrumbItem[];
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
            <Link href={item.href} className="hover:text-gray-700 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
