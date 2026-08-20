"use client";

// Lightweight branded shell for the public Help Center portal. Deliberately NOT
// MarketingShell (which carries SmartSales' own nav/footer + dogfooded widget).
//
// Responsibilities:
//  - Fetch the tenant config by slug (cached; shared by every page).
//  - Apply the tenant brand_color / accent_color as CSS custom properties so
//    child pages can reference var(--hc-brand) / var(--hc-accent).
//  - Render the branded header (logo + display name, linking back to home).
//  - Gate the whole portal: a 404 config (disabled / unknown tenant) renders a
//    clean "not found" instead of children, and never leaks tenant existence.

import Link from "next/link";
import { useHelpConfig } from "@/lib/hooks/useHelpCenter";
import { safeHref } from "@/lib/utils/markdown";
import { HelpLoading, HelpNotFound } from "./HelpStates";

const DEFAULT_BRAND = "#4F46E5";
const DEFAULT_ACCENT = "#6366F1";

export default function HelpShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const { data: config, isLoading, error } = useHelpConfig(slug);

  if (isLoading) {
    return <HelpLoading label="Loading help center..." />;
  }

  // Any failure to resolve the portal (404 disabled/unknown, or other) renders
  // the generic not-found - never surface API detail to a public visitor.
  if (error || !config) {
    return <HelpNotFound />;
  }

  const brand = config.brand_color || DEFAULT_BRAND;
  const accent = config.accent_color || DEFAULT_ACCENT;

  return (
    <div
      className="min-h-screen flex flex-col bg-gray-50 text-gray-900"
      style={
        {
          "--hc-brand": brand,
          "--hc-accent": accent,
        } as React.CSSProperties
      }
    >
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link
            href={`/help/${encodeURIComponent(slug)}`}
            className="flex items-center gap-3 min-w-0"
          >
            {config.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.logo_url}
                alt={config.display_name}
                className="h-8 w-auto max-w-[160px] object-contain"
              />
            ) : (
              <span
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold"
                style={{ backgroundColor: brand }}
              >
                {config.display_name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            )}
            <span className="font-semibold text-gray-900 truncate">
              {config.display_name}
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span>
            &copy; {new Date().getFullYear()} {config.display_name}
          </span>
          {config.support_contact_url && safeHref(config.support_contact_url) && (
            <a
              href={safeHref(config.support_contact_url)!}
              className="font-medium hover:underline"
              style={{ color: brand }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contact support
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}
