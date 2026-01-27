"use client";

import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";

export type UserStatType = {
  title: string;
  stats: string;
  avatarIcon: React.ElementType;
  avatarColor?: string;
  avatarBgColor?: string;
  trend: "positive" | "negative";
  trendNumber: string;
  subtitle: string;
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
  } = props;

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: "12px",
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      <CardContent className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            {title}
          </Typography>

          <div className="flex items-center gap-2">
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {stats}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: trend === "negative" ? "error.main" : "success.main",
              }}
            >
              {`(${trend === "negative" ? "-" : "+"}${trendNumber})`}
            </Typography>
          </div>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {subtitle}
          </Typography>
        </div>

        <Avatar
          sx={{
            width: 48,
            height: 48,
            backgroundColor: avatarBgColor,
            color: avatarColor,
            borderRadius: "12px",
          }}
        >
          <Icon size={24} />
        </Avatar>
      </CardContent>
    </Card>
  );
};

export default CardStatistik;
