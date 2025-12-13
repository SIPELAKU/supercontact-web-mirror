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

export function Input({ readOnly, min, max, className, ...props }: MUIInputProps) {
    return (
        <TextField
            {...props}
            InputProps={{
                readOnly,
                ...(props.InputProps || {}),
            }}
            inputProps={{
                min,
                max,
                ...(props.inputProps || {}),
            }}
            className={cn("rounded-md", className)}
            variant="outlined"
            size="small"
            fullWidth
        />
    )
}
