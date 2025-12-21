import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Search,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  FileText,
} from "lucide-react";

export default function RecentActivityCompany() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Typography className="text-base! font-semibold!">
            Recent Activity Stream
          </Typography>

          <TextField
            size="small"
            placeholder="Search Post..."
            className="w-[200px]"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-4 w-4 text-slate-400" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                height: 34,
                fontSize: 12,
              },
            }}
          />
        </div>

        <Divider className="my-4!" />

        <div className="space-y-4">
          {/* Item 1 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1D4ED8] text-white">
                  <span className="text-sm font-semibold">in</span>
                </div>

                <div className="space-y-1">
                  <Typography className="text-sm! font-semibold!">
                    Acme Corp
                  </Typography>
                  <Typography className="text-[11px]! text-slate-500!">
                    Posted on LinkedIn • 2 hours ago
                  </Typography>
                </div>
              </div>

              <span className="rounded-full bg-green-100 px-3 py-1 text-[10px] font-semibold text-green-700">
                High Engagement
              </span>
            </div>

            <Typography className="mt-3 text-xs! leading-relaxed! text-slate-600!">
              We are thrilled to announce our Series B funding round led by
              Sequoia Capital! This milestone marks a new chapter in our journey
              to revolutionize the AI landscape. A huge thank you to our team,
              partners, and customers for believing in our vision. #Funding
              #SeriesB #AI #Growth
            </Typography>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> 1.2k
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 84
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" /> 156
                </span>
              </div>

              <button className="text-xs font-medium text-[#5479EE] hover:underline">
                View Original
              </button>
            </div>
          </div>

          {/* Item 2 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white">
                  <span className="text-sm font-semibold">X</span>
                </div>

                <div className="space-y-1">
                  <Typography className="text-sm! font-semibold!">
                    Acme Corp
                  </Typography>
                  <Typography className="text-[11px]! text-slate-500!">
                    Posted on X • 5 hours ago
                  </Typography>
                </div>
              </div>
            </div>

            <Typography className="mt-3 text-xs! leading-relaxed! text-slate-600!">
              Join us tomorrow for a live webinar on the future of generative AI
              in enterprise solutions. Register now: bit.ly/acme-webinar 🔥
            </Typography>

            {/* Attachment */}
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    Webinar Promo.png
                  </p>
                  <p className="text-[11px] text-slate-500">450kb</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" /> 342
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 89
                </span>
              </div>

              <button className="text-xs font-medium text-[#5479EE] hover:underline">
                View Original
              </button>
            </div>
          </div>

          {/* Item 3 */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F46E5] text-white">
                  <span className="text-sm font-semibold">🌐</span>
                </div>

                <div className="space-y-1">
                  <Typography className="text-sm! font-semibold!">
                    Corporate Website
                  </Typography>
                  <Typography className="text-[11px]! text-slate-500!">
                    Update Detected • 1 day ago
                  </Typography>
                </div>
              </div>

              <span className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-semibold text-indigo-700">
                Careers Page
              </span>
            </div>

            <Typography className="mt-3 text-xs! leading-relaxed! text-slate-600!">
              <span className="font-semibold text-slate-800">
                Change Detected:
              </span>{" "}
              New job listings added.
            </Typography>

            {/* Jobs list */}
            <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-slate-600">
              <li>Senior Product Manager (San Francisco)</li>
              <li>Lead Frontend Engineer (Remote)</li>
              <li>Enterprise Sales Director (London)</li>
            </ul>

            <div className="mt-4 flex items-center justify-between">
              <button className="text-xs font-medium text-[#5479EE] hover:underline">
                Analyze Hiring Trends
              </button>

              <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700">
                Visit Page <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
