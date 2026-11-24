"use client";

import * as React from "react";
import {
  Select,
  MenuItem,
  FormControl,
  SelectProps,
  Box,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { themed } from "@/lib/constants/theme";

// --- Design Tokens ---
// themed(): the light colour as is, a dark one in dark mode.
const INPUT_BG = themed("field", "#FAFAF6");
const INPUT_BG_WHITE = themed("field", "white");
const DISABLED_BG = themed("raised", "#F3F4F6");
const DISABLED_BORDER = themed("raised", "#E5E7EB");

interface AppSelectProps extends Omit<SelectProps, "label"> {
  label?: string;
  placeholder?: string;
  options: { value: string | number; label: React.ReactNode; disabled?: boolean }[];
  containerClassName?: string;
  isBgWhite?: boolean;
  height?: string;
  rounded?: string;
  error?: boolean;
  helperText?: string;
}

const AppSelect = React.forwardRef<HTMLDivElement, AppSelectProps>(
  (
    {
      label,
      placeholder,
      options,
      value,
      onChange,
      fullWidth = true,
      containerClassName,
      sx,
      isBgWhite = false,
      height,
      rounded,
      error,
      helperText,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();

    return (
      // `height` sizes the Select below, not this wrapper: a fixed-height
      // wrapper let the label and helper text spill over the next row.
      <Box
        className={containerClassName}
        sx={{ width: fullWidth ? "100%" : "auto", ...sx, borderRadius: rounded }}
      >
        {label && (
          <Typography
            variant="body2"
            sx={{ mb: 1, fontWeight: 500, color: "text.secondary" }}
          >
            {label}
          </Typography>
        )}
        <FormControl
          fullWidth={fullWidth}
          size="small"
          error={error}
          disabled={props.disabled}
          sx={{ backgroundColor: props.disabled ? DISABLED_BG : (isBgWhite ? `${INPUT_BG_WHITE} !important` : INPUT_BG) }}
        >
          <Select
            labelId={labelId}
            value={value}
            onChange={onChange}
            displayEmpty
            renderValue={(selected): React.ReactNode => {
              if (!selected || selected === "") {
                return (
                  <Typography
                    sx={{ color: "text.disabled", fontSize: "0.875rem" }}
                  >
                    {placeholder}
                  </Typography>
                );
              }
              const selectedOption = options.find(
                (opt) => opt.value === selected,
              );
              return selectedOption
                ? selectedOption.label
                : (selected as React.ReactNode);
            }}
            IconComponent={(props) => (
              <ChevronDown
                {...props}
                size={18}
                style={{
                  right: 12,
                  position: "absolute",
                  pointerEvents: "none",
                }}
              />
            )}
            sx={{
              height: height ? height : "40px",
              borderRadius: rounded ? rounded : "8px",
              backgroundColor: isBgWhite ? INPUT_BG_WHITE : INPUT_BG,
              "& .MuiSelect-select": {
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#262B43/22",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1.5px",
                borderColor: "primary.main",
              },
              "&.Mui-error .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d32f2f", // Error red color
              },
              "&.Mui-disabled": {
                backgroundColor: DISABLED_BG,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: `${DISABLED_BORDER} !important`,
                },
                "& .MuiSelect-select": {
                  cursor: "not-allowed",
                }
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: props.disabled ? DISABLED_BORDER : "primary.main",
              },
              ...sx,
            }}
            {...props}
            ref={ref}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {helperText && (
          <Typography
            variant="caption"
            sx={{
              // Red only for an error; otherwise it is a hint, grey like AppInput's.
              color: error ? "error.main" : "text.secondary",
              mt: 0.5,
              display: "block",
              fontSize: "0.75rem",
            }}
          >
            {helperText}
          </Typography>
        )}
      </Box>
    );
  },
);

AppSelect.displayName = "AppSelect";

export { AppSelect };
