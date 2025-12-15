// app/page.tsx (Home)
"use client";

import { useAuth } from "@/lib/context/AuthContext";
import LeadManagement from "@/app/lead-management/page";
import LoginPage from "@/app/(auth)/login/page";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="bg-[#ECECEC]">
      <LeadManagement />
    </div>
  );
}
