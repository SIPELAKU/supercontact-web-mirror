"use client"

import type * as React from "react"
import {
  Dialog as MUIDialog,
  DialogTitle as MUIDialogTitle,
  DialogContent as MUIDialogContent,
  DialogActions,
} from "@mui/material"
import { cn } from "@/lib/utils"

export function Dialog({
  open,
  onOpenChange,
  children,
  maxWidth = "md", 
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false
}) {
  return (
    <MUIDialog 
      open={open} 
      onClose={() => onOpenChange(false)} 
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: "10px",
          backgroundColor: "transparent",
          boxShadow: "none",
          justifyContent: 'center',
          width: "100%",
          maxWidth:
            maxWidth === false
              ? "none"
              : {
                  xs: "400px",
                  sm: "600px",
                  md: "800px",
                  lg: "1000px",
                  xl: "1200px",
                }[maxWidth],
          overflow: "hidden",
        },
      }}
      >
      {children}
    </MUIDialog>
  )
}

export function DialogContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <MUIDialogContent className={cn("max-h-[95vh] bg-white rounded-lg", className)} dividers>
      {children}
    </MUIDialogContent>
  )
}

export function DialogHeader({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("flex flex-col gap-2 mb-4", className)}>{children}</div>
}

export function DialogTitle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <MUIDialogTitle className={cn("text-xl font-semibold leading-tight px-0", className)}>{children}</MUIDialogTitle>
  )
}

export function DialogFooter({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <DialogActions className={cn("flex justify-end gap-3 pt-4", className)}>{children}</DialogActions>
}
