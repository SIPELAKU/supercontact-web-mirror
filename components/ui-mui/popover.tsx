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
}: {
  children: React.ReactNode
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const trigger = React.Children.toArray(children).find(
    (child: any) => child.type === PopoverTrigger
  ) as any

  const content = React.Children.toArray(children).find(
    (child: any) => child.type === PopoverContent
  ) as any

  if (!trigger || !content) {
    return <>{children}</>
  }

  const triggerWithHandler = cloneElement(trigger.props.children, {
    onClick: (e: any) => setAnchorEl(e.currentTarget),
  })

  const open = Boolean(anchorEl)

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
