"use client";

import React from "react";
import { IcpAttributeStat, IcpEmployeeRangeStat } from "@/lib/types/icp";

interface IcpAttributeBreakdownCardProps {
    label: string;
    stat: IcpAttributeStat | IcpEmployeeRangeStat | null;
}

function isEmployeeRangeStat(
    stat: IcpAttributeStat | IcpEmployeeRangeStat
): stat is IcpEmployeeRangeStat {
    return "median" in stat;
}

export default function IcpAttributeBreakdownCard({ label, stat }: IcpAttributeBreakdownCardProps) {
    if (!stat || stat.sample_size === 0) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                <div className="mt-1 text-sm text-gray-400">No data</div>
            </div>
        );
    }

    if (isEmployeeRangeStat(stat)) {
        return (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
                <div className="mt-1 text-lg font-bold text-gray-900">
                    {stat.employee_min?.toLocaleString("id-ID")} - {stat.employee_max?.toLocaleString("id-ID")}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                    Median {stat.median?.toLocaleString("id-ID")} · from {stat.sample_size} deal
                    {stat.sample_size === 1 ? "" : "s"}
                </div>
            </div>
        );
    }

    const total = stat.distribution.reduce((sum, d) => sum + d.count, 0) || 1;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase text-gray-400">{label}</div>
            <div className="mt-1 text-lg font-bold text-gray-900">{stat.value || "—"}</div>
            <div className="mt-2 space-y-1.5">
                {stat.distribution.slice(0, 4).map((d) => (
                    <div key={d.value} className="flex items-center gap-2">
                        <span className="w-20 shrink-0 truncate text-xs text-gray-500">{d.value}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                            <div
                                className="h-1.5 rounded-full bg-[#5479EE]"
                                style={{ width: `${Math.round((d.count / total) * 100)}%` }}
                            />
                        </div>
                        <span className="w-6 shrink-0 text-right text-xs text-gray-400">{d.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
