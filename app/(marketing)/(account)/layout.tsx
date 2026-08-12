import React from "react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
      <main className="min-h-screen flex justify-center bg-[#F5F5FA] font-sans">
        {children}
      </main>
  );
}
