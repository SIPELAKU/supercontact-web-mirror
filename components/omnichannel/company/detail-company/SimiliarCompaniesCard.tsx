import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import SimiliarCompaniesCardSkeleton from "./SimiliarCompaniesCardSkeleton";

interface SimiliarCompaniesCardProps {
  isLoading: boolean;
}

export default function SimiliarCompaniesCard({ isLoading }: SimiliarCompaniesCardProps) {
  if (isLoading) return <SimiliarCompaniesCardSkeleton />;

  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        <div className="p-5">
          <Typography className="text-base! font-semibold!">Similar Companies</Typography>
        </div>

        <Divider />

        <div className="px-5 py-3">
          {/* Company 1 */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F0FF] text-xs font-bold text-[#5479EE]">SF</div>
            <div className="min-w-0">
              <Typography className="text-sm! font-semibold!">Salesforce</Typography>
              <Typography className="text-[11px]! text-slate-500!">Enterprise CRM</Typography>
            </div>
          </div>

          {/* Company 2 */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF3E6] text-xs font-bold text-[#F97316]">HU</div>
            <div className="min-w-0">
              <Typography className="text-sm! font-semibold!">HubSpot</Typography>
              <Typography className="text-[11px]! text-slate-500!">Inbound Marketing</Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
