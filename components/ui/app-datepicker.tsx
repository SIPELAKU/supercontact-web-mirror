"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Popover,
  IconButton,
  Button as MuiButton,
  styled,
} from "@mui/material";
import { Calendar as CalendarIcon, ChevronDown, X } from "lucide-react";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay, PickersDayProps } from "@mui/x-date-pickers/PickersDay";
import { format, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

// --- Design Tokens ---
const INPUT_BG = "#FAFAF6";
const BORDER_COLOR = "#D1D5DB";
const FOCUS_COLOR = "#5479EE";
const PRIMARY_COLOR = "#2563eb";

// --- Types ---
export type DatePickerValue = Date | null | [Date | null, Date | null];

interface AppDatePickerProps {
  label?: string;
  placeholder?: string;
  value?: DatePickerValue;
  onChange?: (value: DatePickerValue) => void;
  mode?: "single" | "range";
  fullWidth?: boolean;
  className?: string;
  isBgWhite?: boolean;
}

// --- Styled Components ---
const TriggerButton = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isBgWhite" && prop !== "isFocused",
})<{ isBgWhite?: boolean; isFocused?: boolean }>(
  ({ isBgWhite, isFocused }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: isBgWhite ? "white" : INPUT_BG,
    border: `1px solid ${isFocused ? FOCUS_COLOR : BORDER_COLOR}`,
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    minHeight: "48px",
    width: "100%",
    boxShadow: isFocused ? `0 0 0 2px ${FOCUS_COLOR}33` : "none",
    "&:hover": {
      borderColor: isFocused ? FOCUS_COLOR : "#9CA3AF",
    },
  }),
);

// Custom PickersDay for range selection
const CustomPickersDay = styled(PickersDay, {
  shouldForwardProp: (prop) =>
    prop !== "isSelected" &&
    prop !== "isStart" &&
    prop !== "isEnd" &&
    prop !== "isInRange",
})<{
  isSelected?: boolean;
  isStart?: boolean;
  isEnd?: boolean;
  isInRange?: boolean;
}>(({ theme, isSelected, isStart, isEnd, isInRange }) => ({
  ...(isInRange && {
    borderRadius: 0,
    backgroundColor: `${PRIMARY_COLOR}1A`, // light blue background for range
    "&:hover": {
      backgroundColor: `${PRIMARY_COLOR}33`,
    },
  }),
  ...(isStart && {
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
    backgroundColor: PRIMARY_COLOR,
    color: "white",
    "&:hover": {
      backgroundColor: PRIMARY_COLOR,
    },
  }),
  ...(isEnd && {
    borderTopRightRadius: "50%",
    borderBottomRightRadius: "50%",
    backgroundColor: PRIMARY_COLOR,
    color: "white",
    "&:hover": {
      backgroundColor: PRIMARY_COLOR,
    },
  }),
  ...(isSelected &&
    !isStart &&
    !isEnd && {
      backgroundColor: PRIMARY_COLOR,
      color: "white",
      "&:hover": {
        backgroundColor: PRIMARY_COLOR,
      },
    }),
}));

export const AppDatePicker: React.FC<AppDatePickerProps> = ({
  label,
  placeholder = "Select date",
  value,
  onChange,
  mode = "single",
  fullWidth = true,
  className,
  isBgWhite = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "datepicker-popover" : undefined;

  const handleDateChange = (newDate: Date | null) => {
    if (!newDate) return;

    if (mode === "single") {
      onChange?.(newDate);
      handleClose();
    } else {
      // Range mode
      const [start, end] = Array.isArray(value) ? value : [null, null];

      if (!start || (start && end)) {
        // Start new range
        onChange?.([newDate, null]);
      } else {
        // Complete the range
        if (newDate < start) {
          onChange?.([newDate, start]);
        } else {
          onChange?.([start, newDate]);
        }
        // handleClose(); // Keep open to see the range? Usually users want it closed but let's see.
      }
    }
  };

  const dayRenderer = (props: PickersDayProps<Date>) => {
    if (mode === "single") {
      return <PickersDay {...props} />;
    }

    const [start, end] = Array.isArray(value) ? value : [null, null];
    const currentDay = startOfDay(props.day);

    const isStart = start ? isSameDay(currentDay, startOfDay(start)) : false;
    const isEnd = end ? isSameDay(currentDay, startOfDay(end)) : false;
    const isInRange =
      start && end
        ? isWithinInterval(currentDay, {
            start: startOfDay(start),
            end: startOfDay(end),
          })
        : false;

    return (
      <CustomPickersDay
        {...props}
        isStart={isStart}
        isEnd={isEnd}
        isInRange={isInRange}
        isSelected={isStart || isEnd}
      />
    );
  };

  const displayText = useMemo(() => {
    if (!value) return placeholder;

    if (mode === "single") {
      if (value instanceof Date) {
        return format(value, "dd MMM yyyy");
      }
      return placeholder;
    } else {
      const [start, end] = Array.isArray(value) ? value : [null, null];
      if (!start) return placeholder;
      if (!end) return `${format(start, "dd MMM yyyy")} - ...`;
      return `${format(start, "dd MMM")} - ${format(end, "dd MMM yyyy")}`;
    }
  }, [value, mode, placeholder]);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(mode === "single" ? null : [null, null]);
  };

  return (
    <Box
      className={cn("flex flex-col gap-1.5", className)}
      sx={{ width: fullWidth ? "100%" : "auto" }}
    >
      {label && (
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#6B7280" }}>
          {label}
        </Typography>
      )}

      <TriggerButton
        onClick={handleClick}
        isBgWhite={isBgWhite}
        isFocused={open}
      >
        <Box className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon size={18} className="text-gray-400 shrink-0" />
          <Typography
            variant="body2"
            noWrap
            sx={{
              color: value ? "#111827" : "#9CA3AF",
              fontSize: "0.875rem",
            }}
          >
            {displayText}
          </Typography>
        </Box>
        <Box className="flex items-center gap-1">
          {value && (
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{ p: 0.5, "&:hover": { color: "#EF4444" } }}
            >
              <X size={14} />
            </IconButton>
          )}
          <ChevronDown
            size={18}
            className={cn(
              "text-gray-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </Box>
      </TriggerButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: "12px",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid #E5E7EB",
          },
        }}
      >
        <Box sx={{ p: 1 }}>
          <DateCalendar
            value={mode === "single" ? (value as Date) : null}
            onChange={handleDateChange}
            slots={{
              day: dayRenderer,
            }}
            sx={{
              "& .MuiPickersDay-root.Mui-selected": {
                backgroundColor: PRIMARY_COLOR,
                "&:hover": {
                  backgroundColor: PRIMARY_COLOR,
                },
              },
            }}
          />
          {mode === "range" && (
            <Box className="px-4 pb-3 flex justify-between items-center border-t border-gray-100 pt-3">
              <Typography variant="caption" color="textSecondary">
                Select start and end date
              </Typography>
              <MuiButton
                size="small"
                onClick={handleClose}
                sx={{ textTransform: "none", fontWeight: 600 }}
              >
                Done
              </MuiButton>
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
};
