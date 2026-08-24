"use client";

import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "rgba(38, 43, 67, 0.22)"; // soft gray
const FOCUS_COLOR = "#5479EE";

// --- Styled Component ---
const StyledTextArea = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "isBgWhite" && prop !== "rounded",
})<{ isBgWhite?: boolean; rounded?: string }>(
  ({ theme, isBgWhite, rounded }) => ({
    "& .MuiInputLabel-root": {
      fontSize: "14px",
      fontWeight: 500,
      color: "#6B7280",
      marginBottom: "6px",
    },

    "& .MuiOutlinedInput-root": {
      backgroundColor: isBgWhite ? "white" : INPUT_BG,
      borderRadius: rounded ? rounded : "12px",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      minHeight: "100px",

      "& fieldset": {
        borderColor: BORDER_COLOR,
      },

      "&:hover fieldset": {
        borderColor: BORDER_COLOR,
      },

      "&.Mui-focused fieldset": {
        borderColor: FOCUS_COLOR,
        borderWidth: "1px",
      },

      "&.Mui-error fieldset": {
        borderColor: theme.palette.error.main,
      },
      
      "&.Mui-disabled": {
        backgroundColor: "#F9FAFB",
        "& fieldset": {
          borderColor: "rgba(0, 0, 0, 0.05) !important",
        },
        "& .MuiInputBase-input": {
          color: "#4B5563",
          WebkitTextFillColor: "#4B5563",
        },
      },

      "&.MuiInputBase-multiline": {
        padding: "12px 14px",
      },
    },

    "& .MuiInputBase-input": {
      padding: "0",
    },

    "& .MuiFormHelperText-root": {
      marginLeft: 0,
      fontSize: "12px",
    },

    "& .MuiFormLabel-asterisk": {
      color: "#EF4444", // red-500
    },
  }),
);

export interface AppTextareaProps extends Omit<TextFieldProps, "variant" | "label"> {
  isBgWhite?: boolean;
  rounded?: string;
  /** Rendered as a static label above the field (AppSelect-style). */
  label?: string;
  /** Renders a standard red asterisk after the label. */
  required?: boolean;
  /** Mirrors AppSelect: paints the field border red. */
  error?: boolean;
  /** Mirrors AppSelect: message shown under the field (red when `error`). */
  helperText?: React.ReactNode;
}

export const AppTextarea: React.FC<AppTextareaProps> = ({
  isBgWhite = false,
  rounded,
  rows = 4,
  label,
  required,
  ...props
}) => {
  const field = (
    <StyledTextArea
      multiline
      fullWidth
      rows={rows}
      required={required}
      isBgWhite={isBgWhite}
      rounded={rounded}
      {...props}
    />
  );

  if (!label) return field;

  return (
    <div style={{ width: "100%" }}>
      <Typography
        variant="body2"
        component="label"
        sx={{ mb: 1, display: "block", fontWeight: 500, color: "text.secondary" }}
      >
        {label}
        {required && <span style={{ color: "#EF4444" }}> *</span>}
      </Typography>
      {field}
    </div>
  );
};
