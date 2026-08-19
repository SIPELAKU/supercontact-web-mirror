"use client";

import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { styled, alpha } from "@mui/material/styles";

// --- Colors Constants ---
// primary/danger mains + hovers come from the global MUI theme (lib/theme.ts);
// the remaining shades are local constants.
const COLORS = {
  primary: {
    main: "#5479EE", // overridden by theme.palette.primary.main below
    hover: "#3F66E0", // overridden by theme.palette.primary.dark below
    light: "#DDE4FC",
  },
  danger: {
    main: "#EF4444", // overridden by theme.palette.error.main below
    hover: "#DC2626", // overridden by theme.palette.error.dark below
    light: "#FEF2F2",
  },
  gray: {
    main: "#6B7280",
    hover: "#525B6B",
    light: "#F9FAFB",
  },
  white: {
    main: "#FFFFFF",
    hover: "#F9FAFB",
    light: "#F9FAFB",
  },
  success: {
    main: "#22C55E",
    hover: "#16A34A",
    light: "#DCFCE7",
  }
};

// --- Types ---
export interface AppButtonProps extends Omit<ButtonProps, "variant" | "color"> {
  children: React.ReactNode;
  variantStyle?: "primary" | "outline" | "danger" | "text" | "soft" | "white";
  color?: "primary" | "danger" | "gray" | "white" | "success";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  isLoading?: boolean;
  // We omit generic 'sx' from Omit if we want to allow overrides,
  // but let's keep it available via ButtonProps inheritance (minus omitted ones)
}

// --- Styled Component ---

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) =>
    prop !== "variantStyle" && prop !== "customColor",
})<{
  variantStyle: AppButtonProps["variantStyle"];
  customColor: NonNullable<AppButtonProps["color"]>;
}>(({ theme, variantStyle, customColor }) => {
  const isPrimary = customColor === "primary";
  const isGray = customColor === "gray";
  const isSuccess = customColor === "success";
  // Consume the global theme for brand/danger colors.
  const primaryMain = theme.palette.primary.main || COLORS.primary.main;
  const primaryHover = theme.palette.primary.dark || COLORS.primary.hover;
  const dangerMain = theme.palette.error.main || COLORS.danger.main;
  const dangerHover = theme.palette.error.dark || COLORS.danger.hover;
  const mainColor = isPrimary
    ? primaryMain
    : isGray
      ? COLORS.gray.main
      : isSuccess
        ? COLORS.success.main
        : dangerMain;
  const hoverColor = isPrimary
    ? primaryHover
    : isGray
      ? COLORS.gray.hover
      : isSuccess
        ? COLORS.success.hover
        : dangerHover;
  const lightColor = isPrimary
    ? COLORS.primary.light
    : isGray
      ? COLORS.gray.light
      : isSuccess
        ? COLORS.success.light
        : COLORS.danger.light;
  const whiteColor = isPrimary
    ? COLORS.white.main
    : isGray
      ? COLORS.white.hover
      : COLORS.white.light;

  // Common styles
  const contentStyle = {
    textTransform: "none",
    fontFamily: "inherit",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "24px",
    height: "40px",
    boxShadow: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    "&:hover": {
      boxShadow: "none",
    },
  };

  // Variant specific styles
  switch (variantStyle) {
    case "primary":
      return {
        ...contentStyle,
        backgroundColor: mainColor,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: hoverColor,
        },
        "&.Mui-disabled": {
          backgroundColor: alpha(mainColor, 0.3),
          color: "#ffffff",
        },
      };

    case "outline":
      return {
        ...contentStyle,
        backgroundColor: "transparent",
        border: `1px solid ${mainColor}`,
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.04), // Very light background
          border: `1px solid ${mainColor}`,
        },
      };

    case "danger":
      return {
        ...contentStyle,
        backgroundColor: dangerMain,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: dangerHover,
        },
      };

    case "text":
      return {
        ...contentStyle,
        backgroundColor: "transparent",
        color: primaryMain, // Text variant typically primary color
        padding: "6px 8px", // Slightly tighter for text links
        "&:hover": {
          textDecoration: "none", // Or 'underline' if requested, req says "underline or background very light"
          backgroundColor: COLORS.primary.light,
        },
      };

    case "soft":
      return {
        ...contentStyle,
        backgroundColor: lightColor,
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.12),
        },
        "&.Mui-disabled": {
          backgroundColor: alpha(mainColor, 0.05),
          color: alpha(mainColor, 0.38),
        },
      };

    case "white":
      return {
        ...contentStyle,
        backgroundColor: whiteColor,
        color: mainColor,
        "&:hover": {
          backgroundColor: alpha(mainColor, 0.12),
        },
        "&.Mui-disabled": {
          backgroundColor: alpha(mainColor, 0.05),
          color: alpha(mainColor, 0.38),
        },
      };

    default:
      return contentStyle;
  }
});

// --- Component Definition ---

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  variantStyle = "primary",
  color = "primary",
  startIcon,
  endIcon,
  disabled = false,
  fullWidth = false,
  className,
  isLoading = false,
  ...props
}) => {
  return (
    <StyledButton
      variantStyle={variantStyle}
      customColor={color}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      // Pass variant="contained" or others to MUI to handle accessibility properly if needed,
      // but StyledButton overrides styles heavily.
      // We'll trust StyledComponent styles.
      disableElevation
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <CircularProgress size={20} color="inherit" /> : children}
    </StyledButton>
  );
};
