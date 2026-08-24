"use client";

// Shared loading / empty / not-found states for the public Help Center portal.
// The not-found state is deliberately generic: a disabled or unknown portal
// returns 404 from the API and we must NOT leak whether a tenant exists.

import { LifeBuoy, SearchX } from "lucide-react";
import { CircularProgress } from "@mui/material";

export function HelpLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 py-16">
      <CircularProgress size={32} thickness={4} sx={{ color: "var(--hc-brand, #4F46E5)" }} />
      <p className="text-sm text-gray-500 animate-pulse">{label}</p>
    </div>
  );
}

export function HelpNotFound({
  title = "Help center not available",
  message = "This help center doesn't exist or is no longer available.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LifeBuoy size={36} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

export function HelpEmpty({
  title = "Nothing here yet",
  message = "There's no content to show right now.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <SearchX size={28} />
      </div>
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
