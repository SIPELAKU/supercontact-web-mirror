"use client";

import { Zap } from "lucide-react";

interface CreditBalancePillProps {
    available: number | null;
    isLoading?: boolean;
}

// New UI for this product — no other module here meters usage per-action
// (the Plan/subscription page shows a flat limit, never a live balance).
// Deliberately prominent (a header pill, not tucked into settings): this is
// the first spend-per-click concept users have seen, so it needs to be
// visible before someone queues a job and gets surprised by a 402.
export function CreditBalancePill({ available, isLoading }: CreditBalancePillProps) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-[#DDE4FC] px-3.5 py-2">
            <Zap size={15} className="shrink-0 text-[#3F66E0]" />
            <span className="text-[13px] font-semibold text-[#3F3F8A]">
                {isLoading || available === null ? "—" : available.toLocaleString()} credits available
            </span>
        </div>
    );
}
