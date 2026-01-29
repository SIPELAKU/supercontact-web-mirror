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

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";

interface AppSelectProps extends Omit<SelectProps, "label"> {
  label?: string;
  placeholder?: string;
  options: { value: string | number; label: React.ReactNode }[];
  containerClassName?: string;
  isBgWhite?: boolean;
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
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();

    return (
      <Box
        className={containerClassName}
        sx={{ width: fullWidth ? "100%" : "auto", ...sx }}
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
          sx={{ backgroundColor: isBgWhite ? "white" : INPUT_BG }}
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
              height: "40px",
              borderRadius: "8px",
              backgroundColor: isBgWhite ? "white" : INPUT_BG,
              "& .MuiSelect-select": {
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#262B43/22",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderWidth: "1.5px",
                borderColor: "primary.main",
              },
              ...sx,
            }}
            {...props}
            ref={ref}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  },
);

AppSelect.displayName = "AppSelect";

export { AppSelect };
