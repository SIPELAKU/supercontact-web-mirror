import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface CompanyActivityStatCardProps {
  title: string;
  value: string;
  description: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon: React.ReactNode;
}

export default function CompanyActivityStatCard({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  icon,
}: CompanyActivityStatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
        ? "text-red-600"
        : "text-gray-500";

  return (
    <Card className="rounded-2xl! border border-slate-200 shadow-sm!">
      <CardContent className="flex items-start justify-between gap-4 p-5!">
        <div className="space-y-1">
          <Typography className="text-xs! text-slate-500!">
            {title}
          </Typography>

          <Typography className="text-xl! font-semibold! text-slate-900!">
            {value}
          </Typography>

          <div className="flex items-center gap-1 text-[11px]">
            {trendValue && (
              <span className={trendColor}>{trendValue}</span>
            )}
            <span className="text-slate-500">{description}</span>
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
