import React from 'react';

/**
 * Layout shell for public marketing routes (app/(marketing)/*). Mirrors
 * AuthenticatedLayout's former isAuthRoute branch, but skips the heavy
 * authenticated-app provider stack entirely (MUI date-pickers, React Query,
 * Notifications, Confirmation, Sidebar/Topbar) so that stack's JS never
 * ships to public marketing pages.
 *
 * The floating WhatsApp button was removed here: the marketing pages embed the
 * Web SmartSales chat widget (see app/(marketing)/layout.tsx), whose launcher
 * bubble sits in the same bottom-right corner. Two overlapping bubbles looked
 * broken, so the widget is now the single contact affordance on public pages.
 * The authenticated app keeps its WhatsApp button (no chat widget there).
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen">{children}</main>;
}
