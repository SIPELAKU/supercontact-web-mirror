"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui-mui/button";

export function AlertDialog({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

type TriggerElement = React.ReactElement<
  React.HTMLAttributes<HTMLElement> & {
    [key: `data-${string}`]: boolean;
  }
>;

export function AlertDialogTrigger({
  children,
  onClick,
  ...props
}: {
  children: TriggerElement;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  const [open, setOpen] = useState(false);

  return React.cloneElement(children, {
    ...props,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      children.props.onClick?.(e);
      onClick?.(e);
      setOpen(true);
    },
    ["data-alert-dialog-open"]: open, // <- now valid!!
  });
}




export function AlertDialogPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function AlertDialogContent({
  title,
  description,
  open,
  onOpenChange,
  className,
  children,
  ...props
}: {
  title?: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: cn(
          "rounded-lg p-0 shadow-lg border bg-white animate-in fade-in-0 zoom-in-95",
          className
        ),
      }}
      {...props}
    >
      {children}
    </Dialog>
  );
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  return (
    <DialogTitle
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogContentText>) {
  return (
    <DialogContentText
      className={cn("text-sm text-gray-500", className)}
      {...props}
    />
  );
}

export function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 p-6 pb-2", className)}
      {...props}
    />
  );
}

export function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <DialogActions
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-6 pb-6",
        className
      )}
      {...props}
    />
  );
}

export function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button className={cn(buttonVariants(), className)} {...props} />
  );
}

export function AlertDialogCancel({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}
