import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

export interface CompanyStatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  growth?: {
    value: number;
    unit?: "%";
  };
}

export default function CompanyStatsCard({ title, value, subtitle, growth }: CompanyStatsCardProps) {
  return (
    <Card className="flex min-h-32! min-w-[267px]! items-center shadow-lg!">
      <CardContent className="space-y-1!">
        <Typography component="p">{title}</Typography>
        <Typography variant="body1" className="text-xl! font-medium!">
          {value} {growth && <span className="text-xs text-green-500">(+{growth.value}%)</span>}
        </Typography>
        <Typography variant="body2" className="text-gray-600">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
}
