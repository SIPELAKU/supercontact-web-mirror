import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";

export default function KeyPeopleCardSkeleton() {
  return (
    <Card className="rounded-2xl! border border-slate-200 shadow-sm!">
      <CardContent className="p-0!">
        {/* Top */}
        <div className="flex items-start justify-between gap-3 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar + status */}
            <div className="relative">
              <Avatar className="h-15! w-15!">
                <Skeleton variant="circular" width={60} height={60} />
              </Avatar>
              <Skeleton variant="circular" width={14} height={14} className="absolute -bottom-0.5 right-1 border-2 border-white" />
            </div>

            {/* Name / title / location */}
            <div className="min-w-0 space-y-1">
              <Skeleton variant="text" width={120} height={16} />
              <Skeleton variant="text" width={100} height={14} />
              <div className="mt-1 flex items-center gap-1">
                <Skeleton variant="circular" width={14} height={14} />
                <Skeleton variant="text" width={90} height={12} />
              </div>
            </div>
          </div>

          <IconButton size="small" disabled>
            <Skeleton variant="circular" width={16} height={16} />
          </IconButton>
        </div>

        {/* Contacts */}
        <div className="px-4 pb-3 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton variant="circular" width={16} height={16} />
              <Skeleton variant="text" width="70%" height={12} />
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Divider className="w-[93%]" />
        </div>

        {/* Description */}
        <div className="p-4 space-y-1">
          <Skeleton variant="text" height={12} />
          <Skeleton variant="text" height={12} />
          <Skeleton variant="text" height={12} width="85%" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-4">
          <Skeleton variant="rounded" width={90} height={22} className="rounded-full" />
          <Skeleton variant="text" width={80} height={14} />
        </div>
      </CardContent>
    </Card>
  );
}
