"use client"

import React from "react"
import TextField from "@mui/material/TextField"
import { cn } from "@/lib/utils"

export interface MUIInputProps
  extends React.ComponentProps<typeof TextField> {
  readOnly?: boolean
  min?: string | number
  max?: string | number
}

export function Input({
  readOnly,
  min,
  max,
  className,
  disabled,
  ...props
}: MUIInputProps) {
  return (
    <TextField
      {...props}
      disabled={disabled}
      InputProps={{
        readOnly,
        ...(props.InputProps || {}),
      }}
      inputProps={{
        min,
        max,
        ...(props.inputProps || {}),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: disabled ? "#F3F4F6" : "#fff",
          cursor: disabled ? "not-allowed" : "text",

          "& fieldset": {
            borderColor: disabled ? "#E5E7EB" : "#D1D5DB",
          },

          "&:hover fieldset": {
            borderColor: disabled ? "#E5E7EB" : "#9CA3AF",
          },
        },

        "& .MuiInputBase-input.Mui-disabled": {
          color: "#6B7280",
          WebkitTextFillColor: "#6B7280",
          cursor: "not-allowed",
        },
      }}

      className={cn("rounded-md", className)}
      variant="outlined"
      size="small"
      fullWidth
    />
  )
}
