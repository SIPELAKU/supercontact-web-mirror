"use client";

import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';
import React from 'react';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

/**
 * Layout shell for public marketing routes (app/(marketing)/*). Mirrors
 * AuthenticatedLayout's former isAuthRoute branch, but skips the heavy
 * authenticated-app provider stack entirely (MUI date-pickers, React Query,
 * Notifications, Confirmation, Sidebar/Topbar) so that stack's JS never
 * ships to public marketing pages.
 */
export default function MarketingShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const showWhatsAppButton = !isAuthenticated && (pathname === '/' || pathname === '/company' || pathname === '/price');

  return (
    <main className="min-h-screen">
      {children}
      {showWhatsAppButton && <WhatsAppFloatingButton />}
    </main>
  );
}
