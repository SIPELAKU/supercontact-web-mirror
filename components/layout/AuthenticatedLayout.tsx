"use client";

import { useAuth } from '@/lib/context/AuthContext';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if current route is an auth route (should be accessible without authentication)
  const isAuthRoute = pathname === '/' ||
    pathname === '/company' ||
    pathname === '/price' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/new-password') ||
    pathname?.startsWith('/email-verification') ||
    pathname?.startsWith('/m/') ||
    pathname?.startsWith('/produk/crm-sales') ||
    pathname?.startsWith('/produk/crm-services') ||
    pathname?.startsWith('/produk/omnichannel') ||
    pathname?.startsWith('/produk/ticket') ||
    pathname?.startsWith('/solusi/keuangan') ||
    pathname?.startsWith('/solusi/tour-travel') ||
    pathname?.startsWith('/solusi/perhotelan') ||
    pathname?.startsWith('/solusi/logistik') ||
    pathname?.startsWith('/solusi/fmcg') ||
    pathname?.startsWith('/solusi/ritel') ||
    pathname?.startsWith('/solusi/outsourcing') ||
    pathname?.startsWith('/solusi/it-saas') ||
    pathname?.startsWith('/solusi/sales') ||
    pathname?.startsWith('/solusi/customer-service') ||
    pathname?.startsWith('/solusi/marketing') ||
    pathname?.startsWith('/solusi/human-resource') ||
    pathname?.startsWith('/solusi/operasional') ||
    pathname?.startsWith('/solusi/integrasi-sales-marketing') ||
    pathname?.startsWith('/blog');

  // Redirect unauthenticated users to login (except for auth routes)
  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, isAuthRoute, router]);

  // Public routes render immediately, without waiting on the client-side auth
  // check — they don't need auth state and must stay crawlable/SSR-visible
  // (waiting on `loading` here meant every public page's initial HTML was
  // just a spinner, since `loading` only resolves after hydration).
  if (isAuthRoute) {
    const showWhatsAppButton = !isAuthenticated && (pathname === '/' || pathname === '/company' || pathname === '/price');
    return (
      <main className="min-h-screen">
        {children}
        {showWhatsAppButton && <WhatsAppFloatingButton />}
      </main>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated and not on auth route, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SidebarProvider>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <Topbar />
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}