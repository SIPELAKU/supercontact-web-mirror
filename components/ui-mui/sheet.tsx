"use client";

import { ReactNode, useState } from "react";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";

export type MuiSheetSide = "left" | "right" | "top" | "bottom";

interface MuiSheetProps {
  children: ReactNode;
}

interface MuiSheetTriggerProps {
  children: ReactNode;
}

interface MuiSheetContentProps {
  children: ReactNode;
  side?: MuiSheetSide;
  width?: number | string;
  onClose?: () => void;
}

type SheetStaticState = {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
};

const sheetState: SheetStaticState = {
  isOpen: false,
  setOpen: () => {},
};

export function MuiSheet({ children }: MuiSheetProps) {
  return <>{children}</>;
}

export function MuiSheetTrigger({ children }: MuiSheetTriggerProps) {
  const [open, setOpen] = useState(false);

  sheetState.isOpen = open;
  sheetState.setOpen = setOpen;

  return <div onClick={() => setOpen(true)}>{children}</div>;
}

export function MuiSheetContent({
  children,
  side = "right",
  width = "350px",
  onClose,
}: MuiSheetContentProps) {
  const { isOpen, setOpen } = sheetState;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <Drawer anchor={side} open={isOpen} onClose={handleClose}>
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
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>

        {children}
      </Box>
    </Drawer>
  );
}
