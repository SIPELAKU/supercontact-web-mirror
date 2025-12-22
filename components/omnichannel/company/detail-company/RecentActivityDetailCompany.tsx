"use client";

import { RecentActivityItem } from "@/lib/type/Company";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter } from "next/navigation";
import RecentActivityDetailCompanySkeleton from "./RecentActivityDetailCompanySkeleton";

interface RecentActivityDetailCompanyProps {
  isLoading: boolean;
  RECENT_ACTIVITY_DETAIL_COMPANY: RecentActivityItem[];
}

const SOURCE_ICON_MAP = {
  linkedin: {
    label: "in",
    className: "bg-[#1D4ED8] text-white",
  },
  x: {
    label: "X",
    className: "bg-black text-white",
  },
  website: {
    label: "🌐",
    className: "bg-[#4F46E5] text-white",
  },
} as const;

const BADGE_TONE_MAP = {
  green: "bg-green-100 text-green-700",
  indigo: "bg-indigo-100 text-indigo-700",
} as const;

export default function RecentActivityDetailCompany({ isLoading, RECENT_ACTIVITY_DETAIL_COMPANY }: RecentActivityDetailCompanyProps) {
  const router = useRouter();

  const currentPath = usePathname();

  if (isLoading) return <RecentActivityDetailCompanySkeleton />;
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Typography className="text-base! font-semibold!">Recent Activity Stream</Typography>

          <button className="text-xs font-medium text-[#5479EE] hover:underline cursor-pointer" onClick={() => router.push("/omnichannel/company-intelligence/activity/1")}>
            View All
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {RECENT_ACTIVITY_DETAIL_COMPANY.map((item) => {
            const icon = SOURCE_ICON_MAP[item.source];

            return (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${icon.className}`}>
                      <span className="text-sm font-semibold">{icon.label}</span>
                    </div>

                    <div className="space-y-1">
                      <Typography className="text-sm! font-semibold!">{item.companyName}</Typography>
                      <Typography className="text-[11px]! text-slate-500!">{item.meta}</Typography>
                    </div>
                  </div>

                  {/* Badge */}
                  {item.badge && <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${BADGE_TONE_MAP[item.badge.tone]}`}>{item.badge.label}</span>}
                </div>

                <Typography className="mt-3! text-xs! leading-relaxed! text-slate-600!">{item.content}</Typography>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
