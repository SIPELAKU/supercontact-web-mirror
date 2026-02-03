"use client";

import React from "react";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import { styled, alpha } from "@mui/material/styles";
import { Spinner } from "./spinner";

// --- Colors Constants ---
const COLORS = {
  primary: {
    main: "#5479EE",
    hover: "#3F66E0",
    light: "#DDE4FC",
  },
  danger: {
    main: "#EF4444",
    hover: "#DC2626",
    light: "#FEF2F2",
  },
  gray: {
    main: "#6B7280",
    hover: "#525B6B",
    light: "#F9FAFB",
  },
};

// --- Types ---
export interface AppButtonIconProps extends Omit<IconButtonProps, "color"> {
  icon: React.ReactNode;
  variantStyle?: "primary" | "outline" | "danger" | "soft" | "text";
  color?: "primary" | "danger" | "gray";
  isLoading?: boolean;
}

// --- Styled Component ---
const StyledIconButton = styled(IconButton, {
  shouldForwardProp: (prop) =>
    prop !== "variantStyle" && prop !== "customColor",
})<{
  variantStyle: AppButtonIconProps["variantStyle"];
  customColor: NonNullable<AppButtonIconProps["color"]>;
}>(({ variantStyle, customColor }) => {
  const isPrimary = customColor === "primary";
  const isGray = customColor === "gray";
  const mainColor = isPrimary
    ? COLORS.primary.main
    : isGray
      ? COLORS.gray.main
      : COLORS.danger.main;
  const hoverColor = isPrimary
    ? COLORS.primary.hover
    : isGray
      ? COLORS.gray.hover
      : COLORS.danger.hover;
  const lightColor = isPrimary
    ? COLORS.primary.light
    : isGray
      ? COLORS.gray.light
      : COLORS.danger.light;

  const baseStyle = {
    borderRadius: "8px",
    padding: "8px",
    transition: "all 0.2s ease-in-out",
  };

  switch (variantStyle) {
    case "primary":
      return {
        ...baseStyle,
        backgroundColor: COLORS.primary.main,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: COLORS.primary.hover,
        },
        "&.Mui-disabled": {
          backgroundColor: alpha(COLORS.primary.main, 0.3),
          color: "#ffffff",
        },
      };

    case "outline":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        border: `1px solid ${mainColor}`,
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.04),
          border: `1px solid ${mainColor}`,
        },
      };

    case "danger":
      return {
        ...baseStyle,
        backgroundColor: COLORS.danger.main,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: COLORS.danger.hover,
        },
      };

    case "soft":
      return {
        ...baseStyle,
        backgroundColor: lightColor,
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.12),
        },
      };

    case "text":
    default:
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.08),
        },
      };
  }
});

export const AppButtonIcon: React.FC<AppButtonIconProps> = ({
  icon,
  variantStyle = "text",
  color = "primary",
  disabled,
  isLoading,
  ...props
}) => {
  return (
    <StyledIconButton
      variantStyle={variantStyle}
      customColor={color}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner /> : icon}
    </StyledIconButton>
  );
};
