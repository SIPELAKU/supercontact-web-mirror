import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

export default function RecentSignalsSkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-6!">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Skeleton variant="text" width={140} height={22} />
          <Skeleton variant="text" width={48} height={14} />
        </div>

        {/* Timeline list */}
        <div className="mt-6 space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                {/* Dot & line */}
                <div className="relative mt-1 flex flex-col items-center">
                  <Skeleton variant="circular" width={10} height={10} />

                  {index !== 3 && <Skeleton variant="rectangular" width={2} height={40} className="mt-1 rounded" />}
                </div>

                {/* Title & description */}
                <div className="space-y-1">
                  <Skeleton variant="text" width={180} height={16} />
                  <Skeleton variant="text" width={240} height={14} />
                </div>
              </div>

              {/* Time */}
              <Skeleton variant="text" width={50} height={12} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
