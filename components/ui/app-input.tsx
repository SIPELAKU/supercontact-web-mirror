"use client";

import React, { useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "#D1D5DB"; // soft gray
const FOCUS_COLOR = "#5479EE";

// --- Types ---
export interface AppInputProps extends Omit<
  TextFieldProps,
  "variant" | "type"
> {
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "checkbox";
  isBgWhite?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const BpIcon = styled("span")(({ theme }) => ({
  borderRadius: 6,
  width: 20,
  height: 20,
  boxShadow:
    "inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)",
  backgroundColor: "#f5f8fa",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))",
  ".Mui-focusVisible &": {
    outline: "2px auto rgba(19,124,189,.6)",
    outlineOffset: 2,
  },
  "input:hover ~ &": {
    backgroundColor: "#ebf1f5",
    ...theme.applyStyles("dark", {
      backgroundColor: "#30404d",
    }),
  },
  "input:disabled ~ &": {
    boxShadow: "none",
    background: "rgba(206,217,224,.5)",
    ...theme.applyStyles("dark", {
      background: "rgba(57,75,89,.5)",
    }),
  },
  ...theme.applyStyles("dark", {
    boxShadow: "0 0 0 1px rgb(16 22 26 / 40%)",
    backgroundColor: "#394b59",
    backgroundImage:
      "linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))",
  }),
}));

const BpCheckedIcon = styled(BpIcon)({
  backgroundColor: "#137cbd",
  backgroundImage:
    "linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))",
  "&::before": {
    display: "block",
    width: 20,
    height: 20,
    backgroundImage:
      "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
      " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
      "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
    content: '""',
  },
  "input:hover ~ &": {
    backgroundColor: "#106ba3",
  },
});

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
  startIcon,
  endIcon,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isCheckbox = type === "checkbox";

  if (isCheckbox) {
    return (
      <Checkbox
        {...(props as CheckboxProps)}
        sx={{
          color: BORDER_COLOR,
          "&.Mui-checked": {
            color: FOCUS_COLOR,
          },
          padding: 0,
          ...props.sx,
        }}
        checkedIcon={<BpCheckedIcon />}
        icon={<BpIcon />}
      />
    );
  }

  return (
    <StyledTextField
      fullWidth
      label={label}
      isBgWhite={isBgWhite}
      type={isPassword ? (showPassword ? "text" : "password") : type}
      InputProps={{
        startAdornment: startIcon ? (
          <InputAdornment position="start">{startIcon}</InputAdornment>
        ) : undefined,
        endAdornment:
          isPassword || endIcon ? (
            <InputAdornment position="end">
              {isPassword ? (
                <IconButton
                  edge="end"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ) : (
                endIcon
              )}
            </InputAdornment>
          ) : undefined,
      }}
      {...props}
    />
  );
};
