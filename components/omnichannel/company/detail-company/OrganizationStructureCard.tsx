import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Link from "next/link";

interface OrganizationStructureCardProps {
  departmentsCount?: number;
  viewAllHref?: string;
}

export default function OrganizationStructureCard({
  departmentsCount,
  viewAllHref = "/settings/organization",
}: OrganizationStructureCardProps) {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        <div className="p-5">
          <Typography className="text-base! font-semibold!">Organization Structure</Typography>
          {/* {typeof departmentsCount === "number" && (
            <Typography className="mt-1 text-xs! text-slate-500!">
              {departmentsCount} Department{departmentsCount === 1 ? "" : "s"}
            </Typography>
          )} */}
        </div>

        <Divider />

        <div className="text-center p-5">
          <Link href={viewAllHref} className="text-xs font-medium text-[#5479EE] hover:underline cursor-pointer">
            View All Departments
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
