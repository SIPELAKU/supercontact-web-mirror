"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { IcpScoreComponent } from "@/lib/types/icp";

interface IcpScoreBreakdownProps {
    components: IcpScoreComponent[];
}

// The concrete UI for F10's "transparent scoring, not a black box"
// requirement - shows exactly which attributes contributed to a
// lookalike's match_score, and by how much.
export default function IcpScoreBreakdown({ components }: IcpScoreBreakdownProps) {
    if (components.length === 0) {
        return <p className="text-xs text-gray-400">No scoring dimensions were set on this profile.</p>;
    }

    return (
        <div className="space-y-2">
            {components.map((c) => (
                <div key={c.dimension} className="flex items-center gap-3 text-sm">
                    {c.matched ? (
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    ) : (
                        <XCircle size={16} className="shrink-0 text-gray-300" />
                    )}
                    <span className="w-32 shrink-0 text-gray-600">{c.label}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                        <div
                            className={`h-1.5 rounded-full ${c.matched ? "bg-emerald-500" : "bg-gray-300"}`}
                            style={{ width: `${Math.round(c.contribution * 100)}%` }}
                        />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs text-gray-400">
                        {Math.round(c.contribution * 100)}%
                    </span>
                </div>
            ))}
        </div>
    );
}
