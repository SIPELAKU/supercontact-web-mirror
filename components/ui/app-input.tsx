"use client";

import React, { useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "#D1D5DB"; // soft gray
const FOCUS_COLOR = "#5479EE";

// --- Types ---
export interface AppInputProps extends Omit<TextFieldProps, "variant"> {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel";
  isBgWhite?: boolean;
}

// --- Styled Component ---
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== "isBgWhite",
})<{ isBgWhite?: boolean }>(({ theme, isBgWhite }) => ({
  "& .MuiInputLabel-root": {
    fontSize: "14px",
    fontWeight: 500,
    color: "#6B7280",
    marginBottom: "6px",
  },

  "& .MuiOutlinedInput-root": {
    backgroundColor: isBgWhite ? "white" : INPUT_BG,
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 400,
    lineHeight: "24px",

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
  },

  "& .MuiInputBase-input": {
    padding: "12px 14px",
  },

  "& .MuiFormHelperText-root": {
    marginLeft: 0,
    fontSize: "12px",
  },

  "& .MuiFormLabel-asterisk": {
    color: "#EF4444", // red-500
  },
}));

// --- Component ---
export const AppInput: React.FC<AppInputProps> = ({
  type = "text",
  label,
  isBgWhite = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <StyledTextField
      fullWidth
      label={label}
      isBgWhite={isBgWhite}
      type={isPassword ? (showPassword ? "text" : "password") : type}
      InputProps={{
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton
              edge="end"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="toggle password visibility"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : undefined,
      }}
      {...props}
    />
  );
};
