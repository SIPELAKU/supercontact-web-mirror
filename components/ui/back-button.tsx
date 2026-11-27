"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { resolveListHref } from "@/components/ui/super-table";
import { cn } from "@/lib/utils";

/**
 * A breadcrumb href is a bare path, so pressing "Contacts" from a contact
 * detail page used to land on page 1 of an unfiltered list - losing the page,
 * search, sort and filters the user had set before they clicked in.
 *
 * SuperTable parks the list's real URL under its pathname (useListCursor);
 * this hands it back. Resolved in an effect with the plain href as the initial
 * value, so the server and the first client render agree and a visitor with no
 * stored cursor simply gets today's behaviour.
 */
export function useResolvedHref(href?: string) {
  const [resolved, setResolved] = useState(href);

  useEffect(() => {
    setResolved(href ? resolveListHref(href) : href);
  }, [href]);

  return resolved;
}

const BACK_CLASS =
  "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700";

type BackButtonProps = {
  /** Tooltip and screen-reader text. */
  label?: string;
  className?: string;
} & (
  | { href: string; onClick?: never }
  /** For pages that must ask first (e.g. unsaved changes) before leaving. */
  | { onClick: () => void; href?: never }
);

/**
 * The one back control for a page header: a square arrow left of the title.
 * Used by PageHeader and SettingsPageHeader so every detail/sub page goes back
 * the same way.
 */
export function BackButton({ href, onClick, label = "Back", className }: BackButtonProps) {
  const resolved = useResolvedHref(href);

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label={label} title={label} className={cn(BACK_CLASS, className)}>
        <ArrowLeft className="h-4 w-4" />
      </button>
    );
  }

  return (
    <Link href={resolved ?? href!} aria-label={label} title={label} className={cn(BACK_CLASS, className)}>
      <ArrowLeft className="h-4 w-4" />
    </Link>
  );
}
