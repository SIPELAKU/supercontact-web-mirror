import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { ExternalLink, FileText, MessageCircle, Share2, ThumbsUp } from "lucide-react";

import InputSearch from "@/components/ui/input-search";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DUMMY_ACTIVITIES } from "@/lib/data/recent-activity-item";
import { useMemo } from "react";

export default function RecentActivityCompany() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const searchQuery = searchParams.get("q")?.toLowerCase() ?? "";

  const filteredRecentActivity = useMemo(() => {
    return DUMMY_ACTIVITIES.filter((item) => {
      const content = item.content?.toLowerCase() ?? "";
      const matchesSearch = searchQuery ? content.includes(searchQuery) : true;

      return matchesSearch;
    });
  }, [searchQuery]);

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Typography className="text-base! font-semibold!">Recent Activity Stream</Typography>

          <InputSearch placeholder="Search Post..." searchParams={searchParams} handleSearch={handleSearch} />
        </div>

        <Divider className="my-4!" />

        <div className="space-y-4">
          {filteredRecentActivity.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white">
                    <span className="text-sm font-semibold">{item.platform === "linkedin" ? "in" : item.platform === "x" ? "X" : "🌐"}</span>
                  </div>

                  <div className="space-y-1">
                    <Typography className="text-sm! font-semibold!">{item.companyName}</Typography>
                    <Typography className="text-[11px]! text-slate-500!">
                      {item.postedText} • {item.time}
                    </Typography>
                  </div>
                </div>

                {item.badge && <span className={`rounded-full px-3 py-1 text-[10px] font-semibold ${item.badge.bg} ${item.badge.color}`}>{item.badge.label}</span>}
              </div>

              {/* Content */}
              <Typography className="mt-3 text-xs! leading-relaxed! text-slate-600!">{item.content}</Typography>

              {/* Jobs */}
              {item.jobs && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-slate-600">
                  {item.jobs.map((job, idx) => (
                    <li key={idx}>{job}</li>
                  ))}
                </ul>
              )}

              {/* Attachment */}
              {item.attachment && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                      <FileText className="h-4 w-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">{item.attachment.name}</p>
                      <p className="text-[11px] text-slate-500">{item.attachment.size}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                {item.stats && (
                  <div className="flex items-center gap-5 text-[11px] text-slate-500">
                    {item.stats.likes && (
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" /> {item.stats.likes}
                      </span>
                    )}
                    {item.stats.comments && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" /> {item.stats.comments}
                      </span>
                    )}
                    {item.stats.shares && (
                      <span className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" /> {item.stats.shares}
                      </span>
                    )}
                  </div>
                )}

                <button className="flex items-center gap-1 text-xs font-medium text-[#5479EE] hover:underline">
                  View Original
                  {item.platform === "website" && <ExternalLink className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
