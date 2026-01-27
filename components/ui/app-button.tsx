"use client";

import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import { styled, alpha } from "@mui/material/styles";

// --- Colors Constants ---
// Since no global theme was found, using these constants to ensure consistency.
// These match Tailwind's blue-600 and red-500 roughly, as requested.
const COLORS = {
  primary: {
    main: "#5479EE",
    hover: "#3F66E0",
    light: "#EEF2FF",
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
export interface AppButtonProps extends Omit<ButtonProps, "variant" | "color"> {
  children: React.ReactNode;
  variantStyle?: "primary" | "outline" | "danger" | "text";
  color?: "primary" | "danger" | "gray";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
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
        backgroundColor: COLORS.primary.main, // Explicitly primary blue mainly
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
        backgroundColor: COLORS.danger.main,
        color: "#ffffff",
        "&:hover": {
          backgroundColor: COLORS.danger.hover,
        },
      };

    case "text":
      return {
        ...contentStyle,
        backgroundColor: "transparent",
        color: COLORS.primary.main, // Text variant typically primary color
        padding: "6px 8px", // Slightly tighter for text links
        "&:hover": {
          textDecoration: "none", // Or 'underline' if requested, req says "underline or background very light"
          backgroundColor: COLORS.primary.light,
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
  ...props
}) => {
  return (
    <StyledButton
      variantStyle={variantStyle}
      customColor={color}
      disabled={disabled}
      fullWidth={fullWidth}
      startIcon={startIcon}
      endIcon={endIcon}
      // Pass variant="contained" or others to MUI to handle accessibility properly if needed,
      // but StyledButton overrides styles heavily.
      // We'll trust StyledComponent styles.
      disableElevation
      className={className}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
