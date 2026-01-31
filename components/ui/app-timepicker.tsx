"use client";

import React from "react";
import {
  Box,
  Typography,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { AppInput } from "./app-input";
import { styled } from "@mui/material/styles";

const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "rgba(38, 43, 67, 0.22)";
const FOCUS_COLOR = "#5479EE";

const StyledSelect = styled(Select, {
  shouldForwardProp: (prop) => prop !== "isBgWhite",
})<{ isBgWhite?: boolean }>(({ theme, isBgWhite }) => ({
  height: "40px",
  backgroundColor: isBgWhite ? "white" : INPUT_BG,
  borderRadius: "8px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: BORDER_COLOR,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: BORDER_COLOR,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: FOCUS_COLOR,
    borderWidth: "1px",
  },
  "& .MuiSelect-select": {
    padding: "8px 12px",
    fontSize: "14px",
  },
}));

interface AppTimePickerProps {
  label?: string;
  hour: string;
  minute: string;
  period: "AM" | "PM";
  onHourChange: (val: string) => void;
  onMinuteChange: (val: string) => void;
  onPeriodChange: (val: "AM" | "PM") => void;
  isBgWhite?: boolean;
}

export const AppTimePicker: React.FC<AppTimePickerProps> = ({
  label,
  hour,
  minute,
  period,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
  isBgWhite = false,
}) => {
  return (
    <Box className="flex flex-col gap-1.5 w-full">
      {label && (
        <Typography
          variant="body2"
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </Typography>
      )}
      <Box className="flex items-center gap-2">
        <Box className="w-16">
          <AppInput
            value={hour}
            onChange={(e) => onHourChange(e.target.value)}
            className="text-center"
            placeholder="00"
            inputProps={{ maxLength: 2 }}
            isBgWhite={isBgWhite}
            rounded="8px"
            sx={{ "& input": { textAlign: "center" } }}
          />
        </Box>
        <Typography className="font-bold">:</Typography>
        <Box className="w-16">
          <AppInput
            value={minute}
            onChange={(e) => onMinuteChange(e.target.value)}
            className="text-center"
            placeholder="00"
            inputProps={{ maxLength: 2 }}
            isBgWhite={isBgWhite}
            rounded="8px"
            sx={{ "& input": { textAlign: "center" } }}
          />
        </Box>
        <Box className="w-20">
          <StyledSelect
            value={period}
            onChange={(e: SelectChangeEvent<unknown>) =>
              onPeriodChange(e.target.value as "AM" | "PM")
            }
            isBgWhite={isBgWhite}
            fullWidth
            size="small"
          >
            <MenuItem value="AM">AM</MenuItem>
            <MenuItem value="PM">PM</MenuItem>
          </StyledSelect>
        </Box>
      </Box>
    </Box>
  );
};
