"use client";

import React, { useState } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Checkbox, { CheckboxProps } from "@mui/material/Checkbox";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "#262B43/22"; // soft gray
const FOCUS_COLOR = "#5479EE";

// --- Types ---
type BaseInputProps = {
  /** Rendered as a static label above the field (AppSelect-style). */
  label?: string;
  /** Renders a standard red asterisk after the label. */
  required?: boolean;
  isBgWhite?: boolean;
  rounded?: string;
  height?: string;
  width?: string;
};

type TextInputProps = BaseInputProps &
  Omit<TextFieldProps, "variant" | "type"> & {
    type?: "text" | "email" | "password" | "number" | "tel" | "time";
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    /** Mirrors AppSelect: paints the field border red. */
    error?: boolean;
    /** Mirrors AppSelect: message shown under the field (red when `error`). */
    helperText?: React.ReactNode;
  };

type CheckboxInputProps = BaseInputProps &
  Omit<CheckboxProps, "type"> & {
    type: "checkbox";
  };

export type AppInputProps = TextInputProps | CheckboxInputProps;

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
})<{ isBgWhite?: boolean; rounded?: string; height?: string; width?: string }>(
  ({ theme, isBgWhite, rounded, height, width }) => ({
    "& .MuiInputLabel-root": {
      fontSize: "14px",
      fontWeight: 500,
      color: "#6B7280",
      marginBottom: "6px",
    },

    "& .MuiOutlinedInput-root": {
      backgroundColor: isBgWhite ? "white" : INPUT_BG,
      borderRadius: rounded ? rounded : "6px",
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "24px",
      height: height ? height : "40px",
      width: width ? width : "100%",

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
  }),
);

// --- Component ---
export const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  if (props.type === "checkbox") {
    const { sx, label, isBgWhite, type, ...checkboxProps } = props;
    return (
      <Checkbox
        {...checkboxProps}
        inputRef={ref}
        sx={{
          color: BORDER_COLOR,
          "&.Mui-checked": {
            color: FOCUS_COLOR,
          },
          padding: 0,
          ...sx,
        }}
        checkedIcon={<BpCheckedIcon />}
        icon={<BpIcon />}
      />
    );
  }

  const {
    type = "text",
    label,
    required,
    isBgWhite = false,
    startIcon,
    endIcon,
    rounded,
    height,
    width,
    inputProps,
    ...textFieldProps
  } = props;

  const isPassword = type === "password";

  const field = (
    <StyledTextField
      fullWidth
      required={required}
      isBgWhite={isBgWhite}
      rounded={rounded}
      height={height}
      width={width}
      type={isPassword ? (showPassword ? "text" : "password") : type}
      inputRef={ref}
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
      inputProps={inputProps}
      {...textFieldProps}
    />
  );

  if (!label) return field;

  return (
    <div style={{ width: width ?? "100%" }}>
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
});

AppInput.displayName = "AppInput";
