import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

export default function RecentActivityDetailCompanySkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={200} height={22} />
          <Skeleton variant="text" width={56} height={14} />
        </div>

        {/* List */}
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  {/* Icon */}
                  <Skeleton variant="circular" width={40} height={40} />

                  {/* Title & meta */}
                  <div className="space-y-1">
                    <Skeleton variant="text" width={120} height={16} />
                    <Skeleton variant="text" width={160} height={12} />
                  </div>
                </div>

                {/* Badge (optional per item) */}
                <Skeleton variant="rounded" width={110} height={22} className="rounded-full" />
              </div>

              {/* Content */}
              <div className="mt-3 space-y-1">
                <Skeleton variant="text" height={12} />
                <Skeleton variant="text" height={12} width="90%" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
