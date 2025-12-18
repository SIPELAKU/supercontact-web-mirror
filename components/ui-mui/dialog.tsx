"use client"

import type * as React from "react"
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import {
  Dialog as MUIDialog,
  DialogTitle as MUIDialogTitle,
  DialogContent as MUIDialogContent,
  DialogActions,
} from "@mui/material"
import { cn } from "@/lib/utils"

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
};

const widthMap = {
  xs: "max-w-[400px]",
  sm: "max-w-[600px]",
  md: "max-w-[800px]",
  lg: "max-w-[1000px]",
  xl: "max-w-[1200px]",
};

export function Dialog({
  open,
  onOpenChange,
  children,
  maxWidth = "md",
}: DialogProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mounted, onOpenChange]);

  if (!mounted) return null;

    return createPortal(
    <div className="fixed inset-0 z-50">

      <div
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur-none transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={clsx(
            "w-full transform rounded-3xl bg-white shadow-xl overflow-hidden",
            "transition-all duration-200 ease-out",
            visible
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2",
            maxWidth === false ? "max-w-none" : widthMap[maxWidth]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
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