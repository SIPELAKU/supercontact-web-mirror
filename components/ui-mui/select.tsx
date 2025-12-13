"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  MenuItem,
  Select as MUISelect,
  FormControl,
  SelectChangeEvent,
  OutlinedInput,
  ListSubheader,
} from "@mui/material";

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  size?: "sm" | "default";
}

export function Select({
  value,
  onChange,
  className,
  size = "default",
  children,
}: SelectProps) {
  return (
    <FormControl
      fullWidth
      size={size === "sm" ? "small" : "medium"}
      className="min-w-[220px]"
    >
      <MUISelect
        value={value}
        onChange={(e: SelectChangeEvent) => onChange(e.target.value)}
        displayEmpty
        input={
          <OutlinedInput
            className={cn(
              "bg-white rounded-xl h-11 text-gray-600",
              "border border-gray-300",
              "outline-none! ring-0!",
              "px-4 pr-10",
              "focus:border-gray-400 focus:ring-2 focus:ring-gray-200",

              "transition-all",
              className,
            )}
            sx={{
              "& fieldset": { border: "none" },
              "&:hover:not(.Mui-disabled)": {
                borderColor: "#D1D5DB",
              },
            }}
          />
        }
        IconComponent={(props) => (
          <svg
            {...props}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="text-gray-500"
          >
            <path
              fill="currentColor"
              d="M7 10l5 5 5-5H7z"
            />
          </svg>
        )}
        MenuProps={{
          PaperProps: {
            className:
              "bg-white border border-gray-200 rounded-lg shadow-lg mt-1",
          },
        }}
      >
        {children}
      </MUISelect>
    </FormControl>
  );
}

export function SelectItem({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <MenuItem
      value={value}
      className={cn(
        "text-sm px-3 py-2 rounded-md hover:bg-gray-100 text-gray-700",
        className
      )}
    >
      {children}
    </MenuItem>
  );
}

export function SelectLabel({ children }: { children: React.ReactNode }) {
  return (
    <ListSubheader className="text-xs font-medium px-3 py-1 text-gray-500 bg-white">
      {children}
    </ListSubheader>
  );
}
