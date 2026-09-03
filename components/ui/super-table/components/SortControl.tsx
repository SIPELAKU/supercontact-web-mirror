"use client";

// components/ui/super-table/components/SortControl.tsx
//
// Sorting you can find without knowing it exists.
//
// Clicking a column header is a fine shortcut for people who already know the
// rule. It is a poor primary affordance: nothing on screen says the headers
// are clickable, nothing says which column the list is currently sorted by
// once you have scrolled the header out of view, and on a phone the header
// row is off to the right of a horizontally scrolling table where it is
// effectively unreachable.
//
// So the current sort becomes a labelled toolbar control - "Urut: Nama ↑" -
// that also opens the list of sortable columns. Header clicks still work.

import * as React from "react";
import {
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { ArrowDownAZ, ArrowDownWideNarrow, ArrowUpNarrowWide, Check } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import type { MRT_SortingState, MRT_TableInstance } from "material-react-table";

interface SortControlProps<TData extends object> {
  table: MRT_TableInstance<TData>;
  sorting: MRT_SortingState;
  onChange: (sorting: MRT_SortingState) => void;
}

export function SortControl<TData extends object>({
  table,
  sorting,
  onChange,
}: SortControlProps<TData>) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const sortable = table
    .getAllLeafColumns()
    .filter(
      (c) =>
        c.getCanSort() &&
        !c.id.startsWith("mrt-") &&
        c.id !== "actions" &&
        c.getIsVisible()
    );

  if (sortable.length === 0) return null;

  const current = sorting[0];
  const currentCol = current
    ? sortable.find((c) => c.id === current.id)
    : undefined;
  const headerOf = (col: (typeof sortable)[number]) =>
    typeof col.columnDef.header === "string" ? col.columnDef.header : col.id;

  const label = currentCol
    ? `${headerOf(currentCol)} ${current.desc ? "↓" : "↑"}`
    : "Urutkan";

  // Single sort only: every endpoint in this app takes one sort_by/sort_order
  // pair, so a second sort key would be dropped silently by the server.
  const pick = (id: string, desc: boolean) => {
    onChange([{ id, desc }]);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip arrow title="Urutkan baris">
        <AppButton
          variantStyle="text"
          color="gray"
          startIcon={
            current ? (
              current.desc ? (
                <ArrowDownWideNarrow size={16} />
              ) : (
                <ArrowUpNarrowWide size={16} />
              )
            ) : (
              <ArrowDownAZ size={16} />
            )
          }
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          aria-label={
            currentCol
              ? `Urutkan. Sekarang: ${headerOf(currentCol)} ${
                  current!.desc ? "menurun" : "menaik"
                }`
              : "Urutkan"
          }
          sx={{
            flexShrink: 0,
            maxWidth: 200,
            whiteSpace: "nowrap",
            ...(current && { color: "primary.main" }),
          }}
        >
          <span className="hidden truncate sm:inline">{label}</span>
        </AppButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 240, borderRadius: 2 } } }}
      >
        {sortable.map((col) => {
          const isActive = current?.id === col.id;
          return [
            <MenuItem
              key={`${col.id}-asc`}
              dense
              selected={isActive && !current.desc}
              onClick={() => pick(col.id, false)}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {isActive && !current.desc && <Check size={16} />}
              </ListItemIcon>
              <ListItemText
                primary={headerOf(col)}
                secondary="A → Z / terkecil dulu"
                secondaryTypographyProps={{ fontSize: "0.72rem" }}
              />
            </MenuItem>,
            <MenuItem
              key={`${col.id}-desc`}
              dense
              selected={isActive && current.desc}
              onClick={() => pick(col.id, true)}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                {isActive && current.desc && <Check size={16} />}
              </ListItemIcon>
              <ListItemText
                primary={headerOf(col)}
                secondary="Z → A / terbesar dulu"
                secondaryTypographyProps={{ fontSize: "0.72rem" }}
              />
            </MenuItem>,
          ];
        })}

        {current && <Divider />}
        {current && (
          <MenuItem
            dense
            onClick={() => {
              onChange([]);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon sx={{ minWidth: 28 }} />
            <ListItemText primary="Hapus urutan" />
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
