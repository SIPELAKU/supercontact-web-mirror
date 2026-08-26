"use client";

// components/ui/super-table/components/TableToolbarActions.tsx
//
// The right-hand side of the table toolbar.
//
// It used to be six loose icon buttons in a row — Excel, CSV, search toggle,
// filter toggle, columns, density, fullscreen — two of them drawn from
// @mui/icons-material while the rest of the app uses lucide. This collapses
// them into two labelled controls (Export, View) plus the filter toggle, all
// on one icon set.

import React from "react";
import {
  Box,
  Checkbox,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MRT_TableInstance,
  MRT_ToggleFiltersButton,
  MRT_ToggleGlobalFilterButton,
} from "material-react-table";
import {
  Check,
  Download,
  Maximize2,
  Minimize2,
  Settings2,
} from "lucide-react";

interface TableToolbarActionsProps<TData extends object> {
  table: MRT_TableInstance<TData>;
  showSearchToggle: boolean;
  showColumnFilterToggle: boolean;
  showColumnVisibility: boolean;
  showDensity: boolean;
  showFullScreen: boolean;
  exportEnabled: boolean;
  isExporting: boolean;
  onExportClick: () => void;
  extra?: React.ReactNode;
}

const DENSITIES: { value: "compact" | "comfortable" | "spacious"; label: string }[] =
  [
    { value: "compact", label: "Compact" },
    { value: "comfortable", label: "Comfortable" },
    { value: "spacious", label: "Spacious" },
  ];

export function TableToolbarActions<TData extends object>({
  table,
  showSearchToggle,
  showColumnFilterToggle,
  showColumnVisibility,
  showDensity,
  showFullScreen,
  exportEnabled,
  isExporting,
  onExportClick,
  extra,
}: TableToolbarActionsProps<TData>) {
  const [viewAnchor, setViewAnchor] = React.useState<HTMLElement | null>(null);

  const hideableColumns = showColumnVisibility
    ? table.getAllLeafColumns().filter((c) => c.getCanHide())
    : [];
  const hasViewMenu =
    showDensity || showFullScreen || hideableColumns.length > 0;

  const density = table.getState().density;
  const isFullScreen = table.getState().isFullScreen;

  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
      {showSearchToggle && <MRT_ToggleGlobalFilterButton table={table} />}
      {showColumnFilterToggle && <MRT_ToggleFiltersButton table={table} />}

      {exportEnabled && (
        <Tooltip arrow title="Export data">
          <span>
            <IconButton
              onClick={onExportClick}
              disabled={isExporting}
              aria-label="Export data"
              size="small"
            >
              <Download size={18} />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {hasViewMenu && (
        <>
          <Tooltip arrow title="View options">
            <IconButton
              onClick={(e) => setViewAnchor(e.currentTarget)}
              aria-label="View options"
              aria-haspopup="true"
              aria-expanded={Boolean(viewAnchor)}
              size="small"
            >
              <Settings2 size={18} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={viewAnchor}
            open={Boolean(viewAnchor)}
            onClose={() => setViewAnchor(null)}
            slotProps={{ paper: { sx: { minWidth: 230, borderRadius: 2 } } }}
          >
            {showDensity && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  pt: 1,
                  pb: 0.5,
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                }}
              >
                Density
              </Typography>
            )}
            {showDensity &&
              DENSITIES.map((d) => (
                <MenuItem
                  key={d.value}
                  dense
                  onClick={() => table.setDensity(d.value)}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    {density === d.value && <Check size={16} />}
                  </ListItemIcon>
                  <ListItemText primary={d.label} />
                </MenuItem>
              ))}

            {showFullScreen && showDensity && <Divider />}
            {showFullScreen && (
              <MenuItem
                dense
                onClick={() => {
                  table.setIsFullScreen(!isFullScreen);
                  setViewAnchor(null);
                }}
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </ListItemIcon>
                <ListItemText
                  primary={isFullScreen ? "Exit full screen" : "Full screen"}
                />
              </MenuItem>
            )}

            {hideableColumns.length > 0 && <Divider />}
            {hideableColumns.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  px: 2,
                  pt: 1,
                  pb: 0.5,
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 600,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                }}
              >
                Columns
              </Typography>
            )}
            {hideableColumns.map((col) => (
              <MenuItem
                key={col.id}
                dense
                onClick={() => col.toggleVisibility()}
                sx={{ py: 0 }}
              >
                <Checkbox size="small" checked={col.getIsVisible()} tabIndex={-1} />
                <ListItemText
                  primary={
                    typeof col.columnDef.header === "string"
                      ? col.columnDef.header
                      : col.id
                  }
                />
              </MenuItem>
            ))}
          </Menu>
        </>
      )}

      {extra}
    </Box>
  );
}

export default TableToolbarActions;
