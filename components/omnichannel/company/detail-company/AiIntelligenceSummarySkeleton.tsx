import Skeleton from "@mui/material/Skeleton";

export default function AiIntelligenceSummarySkeleton() {
  return (
    <div className="rounded-2xl border bg-[#EEF3FF] p-6">
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3EAFF]">
          <Skeleton variant="circular" width={20} height={20} />
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <Skeleton variant="text" width={180} height={18} />

          {/* Description */}
          <div className="mt-2 space-y-1">
            <Skeleton variant="text" height={14} />
            <Skeleton variant="text" height={14} />
            <Skeleton variant="text" width="85%" height={14} />
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} variant="rounded" width={90} height={24} className="rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
