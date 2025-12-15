'use client'

import React, { useState, cloneElement } from "react"
import Popover from "@mui/material/Popover"
import { cn } from "@/lib/utils"

export function PopoverTrigger({ children }: { children: React.ReactElement }) {
  return children
}

export function PopoverContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "bg-white border rounded-md p-4 shadow-md w-72",
        className
      )}
    >
      {children}
    </div>
  )
}

export function PopoverRoot({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : Boolean(anchorEl);

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setAnchorEl(value ? anchorEl : null);
    }
  };

  const childArray = React.Children.toArray(children);

  const triggerElement = childArray.find(
    (child): child is ReactElement<{ children: ReactElement }> =>
      isValidElement(child) && child.type === PopoverTrigger
  );

  if (!trigger || !content) {
    return <>{children}</>
  }

  const triggerChild = triggerElement.props.children as React.ReactElement<{
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  }>;

  const triggerWithHandler = cloneElement(triggerChild, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      triggerChild.props.onClick?.(e);

      if (!isControlled) {
        setAnchorEl(e.currentTarget);
      }
      setOpen(!open);
    },
  });

  return (
    <>
      {triggerWithHandler}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {
          setOpen(false);
          if (!isControlled) setAnchorEl(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableRestoreFocus
      >
        {content}
      </Popover>
    </>
  )
}


export const PopoverComponent = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
}
