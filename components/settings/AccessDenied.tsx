"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <ShieldAlert className="w-10 h-10 text-gray-300 mb-4" />
      <h2 className="text-base font-semibold text-gray-800">You don't have permission to view this page</h2>
      <p className="text-sm text-gray-500 mt-1">Contact an administrator if you think this is a mistake.</p>
      <Link href="/settings" className="mt-4 text-sm text-[#5479EE] hover:underline">
        Back to Settings
      </Link>
    </div>
  );
}
