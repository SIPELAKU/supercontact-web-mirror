"use client";

// components/ui/super-table/components/RowActionsCell.tsx
//
// One kebab in place of the icon cluster.
//
// Campaigns rendered six 26px IconButtons 4px apart; Subscribers, Contacts and
// WA Recipients four. None carried a label, and the disabled ones carried
// their reason in a Tooltip on a non-focusable <span> wrapping a button that
// had left the tab order - so "Only Draft and Failed campaigns can be edited"
// was unreachable by keyboard, screen reader AND touch.
//
// Declaring actions as data (SuperTableRowAction) rather than JSX is what lets
// this file exist: the mobile variant is written once here instead of 30 times
// across the app.

import React from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { MoreVertical } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { usePermission } from "@/lib/hooks/usePermission";
import type { MRT_TableInstance } from "material-react-table";
import type { SuperTableRowAction } from "../types";

interface RowActionsCellProps<TData extends object> {
  row: TData;
  table: MRT_TableInstance<TData>;
  actions: SuperTableRowAction<TData>[];
}

type Resolved<TData extends object> = {
  action: SuperTableRowAction<TData>;
  label: string;
  reason: string | null;
  isDisabled: boolean;
  isLoading: boolean;
};

export function RowActionsCell<TData extends object>({
  row,
  table,
  actions,
}: RowActionsCellProps<TData>) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  // 720px is MRT's own toolbar breakpoint; matching it keeps the table from
  // switching layout at one width and its actions at another.
  const isNarrow = useMediaQuery("(max-width:720px)");
  const { can } = usePermission();

  const resolved: Resolved<TData>[] = React.useMemo(
    () =>
      actions
        .filter((a) => !a.hidden?.(row))
        .filter((a) => !a.permission || can(a.permission))
        .map((a) => {
          const state = a.disabled?.(row);
          return {
            action: a,
            label: typeof a.label === "function" ? a.label(row) : a.label,
            reason: typeof state === "string" ? state : null,
            isDisabled: state === true || typeof state === "string",
            isLoading: Boolean(a.isLoading?.(row)),
          };
        }),
    [actions, row, can]
  );

  const quick = resolved.filter((r) => r.action.placement === "quick");
  const inMenu = resolved.filter((r) => r.action.placement !== "quick");

  const ordinary = inMenu.filter((r) => !r.action.destructive);
  const destructive = inMenu.filter((r) => r.action.destructive);

  if (resolved.length === 0) return null;

  const close = () => {
    setAnchorEl(null);
    setDrawerOpen(false);
  };

  const run = (r: Resolved<TData>) => {
    if (r.isDisabled || r.isLoading) return;
    close();
    r.action.onClick(row, { table });
  };

  const renderItem = (r: Resolved<TData>, narrow: boolean) => (
    <MenuItem
      key={r.action.id}
      disabled={r.isDisabled || r.isLoading}
      onClick={() => run(r)}
      sx={{
        // 48px is the touch-target floor; on a pointer device the denser
        // default is fine.
        minHeight: narrow ? 48 : 36,
        gap: 1,
        ...(r.action.destructive ? { color: "error.main" } : {}),
      }}
    >
      {(r.action.icon || r.isLoading) && (
        <ListItemIcon
          sx={{ minWidth: 30, color: r.action.destructive ? "error.main" : "inherit" }}
        >
          {r.isLoading ? <Spinner /> : r.action.icon}
        </ListItemIcon>
      )}
      <ListItemText
        primary={r.label}
        // The reason a thing is unavailable belongs on screen, not in a
        // tooltip attached to something that cannot be focused.
        secondary={r.reason ?? undefined}
        primaryTypographyProps={{ fontSize: narrow ? 15 : 14 }}
        secondaryTypographyProps={{ fontSize: 12 }}
      />
    </MenuItem>
  );

  const items = (narrow: boolean) => [
    ...ordinary.map((r) => renderItem(r, narrow)),
    ...(ordinary.length > 0 && destructive.length > 0
      ? [<Divider key="__sep" sx={{ my: 0.5 }} />]
      : []),
    ...destructive.map((r) => renderItem(r, narrow)),
  ];

  return (
    <Box
      data-st-no-row-click
      sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}
    >
      {quick.map((r) => (
        <Tooltip key={r.action.id} title={r.reason ?? r.label}>
          <span>
            <IconButton
              size="small"
              aria-label={r.label}
              disabled={r.isDisabled || r.isLoading}
              onClick={() => run(r)}
              sx={r.action.destructive ? { color: "error.main" } : undefined}
            >
              {r.isLoading ? <Spinner /> : r.action.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}

      {inMenu.length > 0 && (
        <Tooltip title="Actions">
          <IconButton
            size="small"
            aria-label="Row actions"
            aria-haspopup="menu"
            aria-expanded={Boolean(anchorEl) || drawerOpen}
            onClick={(e) =>
              isNarrow ? setDrawerOpen(true) : setAnchorEl(e.currentTarget)
            }
          >
            <MoreVertical size={18} />
          </IconButton>
        </Tooltip>
      )}

      {/* Desktop */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && !isNarrow}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
      >
        {items(false)}
      </Menu>

      {/* Narrow: a bottom sheet, where a 200px menu anchored to a 30px icon at
          the right edge would be cramped and easy to mis-tap. */}
      <Drawer
        anchor="bottom"
        open={drawerOpen && isNarrow}
        onClose={close}
        PaperProps={{
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, pb: 1 },
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, pt: 2, pb: 1, color: theme.palette.text.secondary }}
        >
          Actions
        </Typography>
        {items(true)}
      </Drawer>
    </Box>
  );
}

export default RowActionsCell;
