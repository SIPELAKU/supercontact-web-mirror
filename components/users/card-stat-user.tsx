"use client";

import { Users, UserCheck, UserSearch } from "lucide-react";
import Grid from "@mui/material/Grid";

import CardStatistik, { UserStatType } from "../../components/ui/card-stat";
import useManagedUsers from "@/lib/hooks/useManagedUser";

const CardStatUser = () => {
  const {
    data: usersResponse,
    isLoading,
  } = useManagedUsers(
    1,
    1000,
    "",
    "",
    "",
  );
  const users = usersResponse?.data?.manage_users || [];

  const totalUsers = 0;
  const activeUsers = users?.length ?? 0;
  const pendingUsers = 0;

  const cardData: UserStatType[] = [
    {
      title: "Session",
      stats: totalUsers.toLocaleString(),
      avatarIcon: Users,
      avatarColor: "#5479EE",
      avatarBgColor: "#E4ECFF",
      trend: "positive",
      trendNumber: "0%",
      subtitle: "Total Users",
    },
    {
      title: "Active Users",
      stats: activeUsers.toLocaleString(),
      avatarIcon: UserCheck,
      avatarColor: "#22c55e",
      avatarBgColor: "#DCFCE7",
      trend: "negative",
      trendNumber: "0%",
      subtitle: "Last week analytics",
    },
    {
      title: "Pending Users",
      stats: pendingUsers.toLocaleString(),
      avatarIcon: UserSearch,
      avatarColor: "#f59e0b",
      avatarBgColor: "#FEF3C7",
      trend: "positive",
      trendNumber: "0%",
      subtitle: "Last week analytics",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cardData.map((item, i) => (
        <Grid item xs={12} md={4} key={i}>
          <CardStatistik {...item} isLoading={isLoading} />
        </Grid>
      ))}
    </Grid>
  );
};

export default CardStatUser;
