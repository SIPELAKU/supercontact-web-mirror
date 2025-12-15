import { Card, CardContent, Typography, Avatar, Grid } from "@mui/material";
import { DepartmentsType } from "../../../lib/type/Departments";

export default function DepartmentInfoCard({ department }: { department: DepartmentsType }) {
  return (
    <Card sx={{ borderRadius: 4, padding: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        Department Information
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 4 }}>
        Details and members of the {department.department_name.toLowerCase()} department
      </Typography>

      <CardContent sx={{ padding: 0 }}>
        <Grid container spacing={4}>
          {/* Department */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Department
            </Typography>
            <Typography fontWeight={500}>{department.department_name}</Typography>
          </Grid>

          {/* Manager */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Manager
            </Typography>

            <Grid container alignItems="center" spacing={2} sx={{ mt: 0.5 }}>
              <Grid >
                <Avatar
                  sx={{
                    width: 30,
                    height: 30,
                    bgcolor: "#e0e7ff",
                    color: "#4f46e5",
                    fontSize: 14,
                  }}
                >
                  {department.manager_name.charAt(0)}
                </Avatar>
              </Grid>
              <Grid >
                <Typography fontWeight={500}>{department.manager_name}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Manager ID */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Manager ID
            </Typography>
            <Typography fontWeight={500}>{department.id_manager}</Typography>
          </Grid>

          {/* Branch */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Branch
            </Typography>
            <Typography fontWeight={500}>{department.branch}</Typography>
          </Grid>

          {/* Member Count */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Member Count
            </Typography>
            <Typography fontWeight={500}>{department.member_count}</Typography>
          </Grid>

          {/* Create Date */}
          <Grid size={{xs:12, sm:4}}>
            <Typography variant="body2" color="text.secondary">
              Create Date
            </Typography>
            <Typography fontWeight={500}>{new Date().toISOString().split('T')[0]}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
