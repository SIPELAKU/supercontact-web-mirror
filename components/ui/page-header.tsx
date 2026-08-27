"use client";
import { useEffect, useState } from "react";
import { PageHeaderProps } from "@/lib/types/Pipeline";
import { cn } from "@/lib/utils";
import { resolveListHref } from "@/components/ui/super-table";
import Image from "next/image";
import Link from "next/link";

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
    <Link
      href={resolved ?? href}
      className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
    >
      {label}
    </Link>
  );
}
// import LogoHeader from "@/assets/icons/headicon.png"

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  image,
  imageWidth = 160,
  imageHeight = 160,
  className,
  actions,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5 mb-6 animate-in fade-in slide-in-from-top-1 duration-300",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          {/* Breadcrumbs at the top */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav
              className="flex items-center gap-2 mb-1"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                  {item.href ? (
                    <BreadcrumbLink href={item.href} label={item.label} />
                  ) : (
                    <span className="text-sm text-gray-400">{item.label}</span>
                  )}

                  {i < breadcrumbs.length - 1 && (
                    <span className="text-gray-300 text-xs">•</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm mt-1">
              {description}
            </p>
          )}
        </div>

        {/* actions takes precedence over the illustration image - a header
            shows one or the other, not both. */}
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">{actions}</div>
        ) : (
          image && (
            <div className="hidden sm:block">
              <Image
                src={image}
                width={imageWidth}
                height={imageHeight}
                alt="Header illustration"
                className="object-contain"
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}