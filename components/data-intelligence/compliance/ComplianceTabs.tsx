"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { label: "Suppression List", href: "/data-intelligence/compliance/suppression" },
    { label: "Data Subject Requests", href: "/data-intelligence/compliance/dsr" },
];

export default function ComplianceTabs() {
    const pathname = usePathname();

    return (
        <div className="flex gap-1 border-b border-gray-200">
            {TABS.map((tab) => {
                const active = pathname === tab.href;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                            active
                                ? "border-[#5479EE] text-[#5479EE]"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
