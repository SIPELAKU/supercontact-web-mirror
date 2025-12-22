import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";

export default function SimiliarCompaniesCardSkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        {/* Header */}
        <div className="p-5">
          <Skeleton variant="text" width={160} height={22} />
        </div>

        <Divider />

        {/* List */}
        <div className="px-5 py-3 space-y-3">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-3">
              {/* Logo / Initials */}
              <Skeleton variant="rounded" width={36} height={36} />

              {/* Name & category */}
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="40%" height={12} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
