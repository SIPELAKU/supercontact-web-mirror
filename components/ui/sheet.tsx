"use client"

import CloseIcon from "@mui/icons-material/Close"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import IconButton from "@mui/material/IconButton"
import { ReactNode, useState } from "react"

export type MuiSheetSide = "left" | "right" | "top" | "bottom"

interface MuiSheetProps {
  children: ReactNode
}

interface MuiSheetTriggerProps {
  children: ReactNode
}

interface MuiSheetContentProps {
  children: ReactNode
  side?: MuiSheetSide
  width?: number | string
  onClose?: () => void
}

export function MuiSheet({ children }: MuiSheetProps) {
  return <>{children}</>
}

export function MuiSheetTrigger({
  children,
}: MuiSheetTriggerProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {/* This hidden provider pattern is replaced by a render prop */}
      {/* Consumer is rendered in MuiSheetContent */}
      {(MuiSheetTrigger as any)._setOpen = setOpen}
      {(MuiSheetTrigger as any)._isOpen = open}
    </>
  )
}

export function MuiSheetContent({
  children,
  side = "right",
  width = "350px",
}: MuiSheetContentProps) {
  const open = (MuiSheetTrigger as any)._isOpen
  const setOpen = (MuiSheetTrigger as any)._setOpen

  return (
    <Drawer
      anchor={side}
      open={open}
      onClose={() => setOpen(false)}
    >
      <Box
        sx={{
          width:
            side === "left" || side === "right" ? width : "auto",
          p: 3,
          position: "relative",
        }}
      >
        <IconButton
          sx={{ position: "absolute", right: 12, top: 12 }}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </IconButton>

        {children}
      </Box>
    </Drawer>
  )
}