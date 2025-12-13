"use client";

import React, {
  useState,
  cloneElement,
  ReactElement,
  ReactNode,
  isValidElement,
} from "react";
import Popover from "@mui/material/Popover";
import { cn } from "@/lib/utils";

export function PopoverTrigger({
  children,
}: {
  children: ReactElement<React.HTMLAttributes<HTMLElement>>;
}) {
  return children;
}

export function PopoverContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
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
  );
}


export function PopoverRoot({
  children,
}: {
  children: ReactNode;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const childArray = React.Children.toArray(children);

  const triggerElement = childArray.find(
    (child): child is ReactElement<{ children: ReactElement<React.HTMLAttributes<HTMLElement>> }> =>
      isValidElement(child) && child.type === PopoverTrigger
  );

  const contentElement = childArray.find(
    (child) =>
      isValidElement(child) && child.type === PopoverContent
  ) as ReactElement | undefined;

  if (!triggerElement || !contentElement) {
    return <>{children}</>;
  }

  const triggerChild = triggerElement.props.children;

  const triggerWithHandler = cloneElement(triggerChild, {
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      triggerChild.props.onClick?.(e);
      setAnchorEl(e.currentTarget);
    },
  });


  const open = Boolean(anchorEl);

  return (
    <>
      {triggerWithHandler}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        disableRestoreFocus
      >
        {contentElement}
      </Popover>
    </>
  );
}

export const PopoverComponent = {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
};
