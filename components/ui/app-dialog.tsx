"use client";

// components/ui/app-dialog.tsx
//
// The standard modal shell for the app.
//
// Before this, the same module carried three different modal systems: MUI
// `<Dialog>`, `ConfirmationPopup`, and hand-rolled `fixed inset-0` overlays.
// The hand-rolled ones had no `role="dialog"`, no `aria-modal`, no focus trap
// and no close-on-Escape — a keyboard user could tab straight out of an open
// import wizard into the page behind it, with no way to dismiss it.
//
// AppDialog wraps MUI's Dialog (which handles all of the above) and adds the
// bits every modal here repeats: a title row with a close button, an optional
// fullscreen toggle, and an `onRequestClose` hook so a form can intercept the
// backdrop/Escape close to ask about unsaved work.

import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Maximize2, Minimize2, X } from "lucide-react";

export interface AppDialogProps {
  open: boolean;
  /** Called for the close button, the backdrop, and Escape. */
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Buttons for the footer. Omit for a dialog with no actions. */
  actions?: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Show a maximise/restore toggle next to the close button. */
  allowFullScreen?: boolean;
  /** Start maximised (and stay there while `allowFullScreen` is off). */
  fullScreen?: boolean;
  /** Extra controls rendered to the left of the close button. */
  titleActions?: React.ReactNode;
  /** Hide the header entirely — for immersive editors that draw their own. */
  hideHeader?: boolean;
  /** Vertical dividers around the content. @default true */
  dividers?: boolean;
  /** Padding on the content area. @default true */
  contentPadding?: boolean;
}

export function AppDialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  allowFullScreen = false,
  fullScreen = false,
  titleActions,
  hideHeader = false,
  dividers = true,
  contentPadding = true,
}: AppDialogProps) {
  const [maximised, setMaximised] = React.useState(fullScreen);

  // Reopening a dialog should not inherit the previous session's maximised
  // state — it reads as the app "remembering" something the user didn't ask it
  // to remember.
  React.useEffect(() => {
    if (open) setMaximised(fullScreen);
  }, [open, fullScreen]);

  const isFullScreen = allowFullScreen ? maximised : fullScreen;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isFullScreen}
      PaperProps={{
        sx: isFullScreen
          ? { borderRadius: 0 }
          : { borderRadius: 3, maxHeight: "92vh" },
      }}
    >
      {!hideHeader && (
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            py: 2,
          }}
        >
          <div>
            <Typography component="h2" variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </div>
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
            {titleActions}
            {allowFullScreen && (
              <Tooltip title={maximised ? "Restore" : "Maximise"}>
                <IconButton
                  size="small"
                  aria-label={maximised ? "Restore dialog" : "Maximise dialog"}
                  onClick={() => setMaximised((v) => !v)}
                  sx={{ color: "text.secondary" }}
                >
                  {maximised ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Close">
              <IconButton
                size="small"
                aria-label="Close dialog"
                onClick={onClose}
                sx={{ color: "text.secondary" }}
              >
                <X size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </DialogTitle>
      )}

      <DialogContent
        dividers={dividers && !hideHeader}
        sx={contentPadding ? { p: 3 } : { p: 0 }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>{actions}</DialogActions>
      )}
    </Dialog>
  );
}

export default AppDialog;
