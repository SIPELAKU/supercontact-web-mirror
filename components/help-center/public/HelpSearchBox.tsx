"use client";

// Search box used on the portal home (and prefilled on the search results
// page). Submitting navigates to /help/{slug}/search?q=... so results are a
// linkable, indexable page.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function HelpSearchBox({
  slug,
  initialQuery = "",
  placeholder = "Search for answers...",
  autoFocus = false,
}: {
  slug: string;
  initialQuery?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/help/${encodeURIComponent(slug)}/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search the help center"
          className="w-full h-14 pl-12 pr-28 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--hc-brand,#4F46E5)]/25 focus:border-[var(--hc-brand,#4F46E5)] transition-all placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-xl text-white text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--hc-brand, #4F46E5)" }}
        >
          Search
        </button>
      </div>
    </form>
  );
}
