import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import RecentSignalsSkeleton from "./RecentSignalsSkeleton";

type RecentSignal = {
  id: number;
  title: string;
  description: string;
  timePosted: string;
  dotColor: "green" | "blue" | "orange";
};

interface RecentSignalsProps {
  isLoading: boolean;
  RECENT_SIGNALS: RecentSignal[];
}

const DOT_COLOR_MAP: Record<RecentSignal["dotColor"], string> = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  orange: "bg-orange-500",
};

export default function RecentSignals({ isLoading, RECENT_SIGNALS }: RecentSignalsProps) {
  if (isLoading) return <RecentSignalsSkeleton />;

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Typography className="text-base! font-semibold!">Recent Signals</Typography>

          <button className="text-xs font-medium text-[#5479EE] hover:underline cursor-pointer">View All</button>
        </div>

        <div className="mt-6 space-y-5">
          {RECENT_SIGNALS.map((item, index) => (
            <div key={item.id} className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="relative mt-1">
                  <span className={`block h-2.5 w-2.5 rounded-full ${DOT_COLOR_MAP[item.dotColor]}`} />

                  {index !== RECENT_SIGNALS.length - 1 && <span className="absolute left-1/2 top-3 h-10 w-0.5 -translate-x-1/2 bg-slate-200" />}
                </div>

                <div className="space-y-1">
                  <Typography className="text-sm! font-semibold!">{item.title}</Typography>
                  <Typography className="text-xs! text-slate-600!">{item.description}</Typography>
                </div>
              </div>

              <Typography className="whitespace-nowrap text-[10px]! text-slate-400!">{item.timePosted}</Typography>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
