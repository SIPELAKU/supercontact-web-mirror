"use client";

import React from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const pathname = usePathname();

  // Check if current route is an auth route
  const isAuthRoute = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If user is not authenticated OR on auth routes, don't show sidebar/topbar
  if (!isAuthenticated || isAuthRoute) {
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