"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";

export default function KeyPeopleCardSkeleton() {
  return (
    <Card className="rounded-2xl! shadow-lg!">
      <CardContent className="p-0!">
        {/* Header */}
        <div className="p-5">
          <Skeleton variant="text" width={120} height={22} />
        </div>

        <Divider />

        {/* List */}
        <div className="px-5 py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <div className="flex items-center gap-3 py-3">
                {/* Avatar */}
                <Skeleton variant="circular" width={36} height={36} />

                {/* Name & title */}
                <div className="flex-1 space-y-1">
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={12} />
                </div>
              </div>

              {index !== 3 && <Divider />}
            </div>
          ))}
        </div>

        <Divider />

        {/* Footer */}
        <div className="p-5 text-center">
          <Skeleton variant="text" width={140} height={14} className="mx-auto" />
        </div>
      </CardContent>
    </Card>
  );
}
