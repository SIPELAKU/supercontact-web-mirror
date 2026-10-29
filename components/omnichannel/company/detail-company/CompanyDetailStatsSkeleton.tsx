import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

/** Stat cards while their numbers load, the same size as CompanyStatsCard. */
export default function CompanyDetailStatsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="flex min-h-32! min-w-[267px]! items-center shadow-lg!" aria-busy="true">
          <CardContent className="w-full space-y-1!">
            <Skeleton variant="text" width={120} height={22} />
            <Skeleton variant="text" width={64} height={30} />
            <Skeleton variant="text" width={150} height={18} />
          </CardContent>
        </Card>
      ))}
    </>
  );
}
