"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Avatar({ className, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

export function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <img
      className={cn("object-cover h-full w-full", className)}
      {...props}
    />
  );
}

interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function AvatarFallback({
  className,
  children,
  ...props
}: AvatarFallbackProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}