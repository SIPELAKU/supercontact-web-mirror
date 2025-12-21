import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";

export default function CompanyAboutSkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <Skeleton variant="text" width={160} height={22} />

        {/* Description */}
        <div className="mt-2 space-y-1">
          <Skeleton variant="text" height={16} />
          <Skeleton variant="text" height={16} />
          <Skeleton variant="text" height={16} width="80%" />
        </div>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={80}
              height={24}
              className="rounded-full"
            />
          ))}
        </div>

        <Divider className="my-5!" />

        {/* Bottom stats */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton variant="text" width={70} height={12} />
              <Skeleton variant="text" width={90} height={18} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
