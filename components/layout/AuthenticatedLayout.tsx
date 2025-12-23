"use client";

import { useAuth } from '@/lib/context/AuthContext';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if current route is an auth route (should be accessible without authentication)
  const isAuthRoute = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/forgot-password') ||
                     pathname?.startsWith('/new-password') ||
                     pathname?.startsWith('/email-verification');

  // Redirect unauthenticated users to login (except for auth routes)
  useEffect(() => {
    if (!loading && !isAuthenticated && !isAuthRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, isAuthRoute, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated and not on auth route, show loading while redirecting
  if (!isAuthenticated && !isAuthRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If on auth routes, don't show sidebar/topbar
  if (isAuthRoute) {
    return <main className="min-h-screen">{children}</main>;
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