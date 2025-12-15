import { Card, CardContent, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid";

export default function DepartmentInfoSkeleton() {
  return (
    <Card sx={{ borderRadius: 4, padding: 3 }}>
      {/* Title */}
      <Skeleton
        variant="text"
        sx={{ fontSize: "1.25rem", width: 220, mb: 0.5 }}
      />

      {/* Subtitle */}
      <Skeleton
        variant="text"
        sx={{ fontSize: "0.875rem", width: 340, mb: 4 }}
      />

      <CardContent sx={{ padding: 0 }}>
        <Grid container spacing={4}>
          {/* Department */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={160} />
          </Grid>

          {/* Manager */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={100} />
            <Grid container alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
              <Grid>
                <Skeleton variant="circular" width={30} height={30} />
              </Grid>
              <Grid>
                <Skeleton variant="text" width={120} />
              </Grid>
            </Grid>
          </Grid>

          {/* Manager ID */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={140} />
          </Grid>

          {/* Branch */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={100} />
            <Skeleton variant="text" width={140} />
          </Grid>

          {/* Member Count */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Grid>

          {/* Create Date */}
          <Grid size={{ xs:12 , sm:4 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={140} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
