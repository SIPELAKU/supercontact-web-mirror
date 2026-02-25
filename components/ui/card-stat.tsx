"use client";

import React from "react";

import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { CircularProgress } from "@mui/material";

export type UserStatType = {
  title: string;
  stats: React.ReactNode;
  avatarIcon: React.ElementType;
  avatarColor?: string;
  avatarBgColor?: string;
  trend: "positive" | "negative";
  trendNumber: string;
  subtitle: string;
  isLoading?: boolean;
};

const CardStatistik = (props: UserStatType) => {
  const {
    title,
    stats,
    avatarIcon: Icon,
    avatarColor = "#64748b",
    avatarBgColor = "#fff",
    trend,
    trendNumber,
    subtitle,
    isLoading,
  } = props;

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "12px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent className="flex justify-between items-start h-full">
        <div className="flex flex-col gap-2 flex-1 min-w-0 pr-2">
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {title}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              mb: 0.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "1.25rem", sm: "1.1rem", md: "1.2rem", lg: "1.1rem", xl: "1.25rem" },
            }}
          >
            {isLoading ? <CircularProgress size={20} /> : stats}
          </Typography>

          <div className="flex items-center gap-2 flex-wrap">
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: trend === "negative" ? "error.main" : "success.main",
              }}
            >
              {isLoading ? (
                <CircularProgress size={20} />
              ) : (
                `(${trend === "negative" ? "-" : "+"}${trendNumber})`
              )}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          </div>
        </div>

        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: avatarBgColor,
            color: avatarColor,
            borderRadius: "12px",
            flexShrink: 0,
          }}
        >
          <Icon size={24} />
        </Avatar>
      </CardContent>
    </Card>
  );
};

export default CardStatistik;
