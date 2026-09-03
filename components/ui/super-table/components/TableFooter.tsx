"use client";

// components/ui/super-table/components/TableFooter.tsx
//
// What sits under a lazy table instead of page numbers.
//
// An infinite list that shows nothing but rows is disorienting: you cannot
// tell how far in you are, whether more is coming, or whether the thing simply
// ended. So the footer always answers three questions -
//   how much am I looking at   ("Menampilkan 240 dari 12.431 kontak")
//   is there more              (the button, or "Semua … sudah dimuat")
//   how big is a batch         (the Rows menu)
//
// The button is not decoration next to the scroll-triggered auto-load.
// Scrolling is invisible to a keyboard user and to anyone using a screen
// reader, who has no scroll position to speak of; the button is how they reach
// row 241. It is also the manual path once `autoLoadLimit` trips the brake.

import * as React from "react";
import {
  Box,
  CircularProgress,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";

interface TableFooterProps {
  loadedCount: number;
  /** Total matching the current query. `undefined` when the server won't say. */
  totalCount?: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  pageSize: number;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  /** Plural noun for the rows: "kontak", "tiket". */
  entityLabel: string;
  /** Auto-load is paused by the safety brake; say so rather than looking stuck. */
  autoLoadPaused: boolean;
}

const nf = new Intl.NumberFormat("id-ID");

export function TableFooter({
  loadedCount,
  totalCount,
  hasMore,
  isLoadingMore,
  onLoadMore,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  entityLabel,
  autoLoadPaused,
}: TableFooterProps) {
  const [sizeAnchor, setSizeAnchor] = React.useState<HTMLElement | null>(null);

  const summary =
    typeof totalCount === "number" && totalCount > loadedCount
      ? `Menampilkan ${nf.format(loadedCount)} dari ${nf.format(
          totalCount
        )} ${entityLabel}`
      : `${nf.format(loadedCount)} ${entityLabel}`;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 1.5,
        width: "100%",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        // Politely announced: a screen-reader user gets told the list grew
        // without being yanked out of wherever they are reading.
        aria-live="polite"
        sx={{ fontVariantNumeric: "tabular-nums" }}
      >
        {summary}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {hasMore ? (
          <AppButton
            variantStyle="outline"
            color="gray"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            startIcon={
              isLoadingMore ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
          >
            {isLoadingMore
              ? "Memuat…"
              : autoLoadPaused
                ? `Muat ${nf.format(pageSize)} lagi`
                : "Muat lebih banyak"}
          </AppButton>
        ) : (
          loadedCount > 0 && (
            <Typography variant="caption" color="text.disabled">
              Semua {entityLabel} sudah dimuat
            </Typography>
          )
        )}

        <AppButton
          variantStyle="text"
          color="gray"
          endIcon={<ChevronDown size={14} />}
          onClick={(e) => setSizeAnchor(e.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(sizeAnchor)}
          aria-label={`Baris per muatan: ${pageSize}`}
          sx={{ flexShrink: 0 }}
        >
          <span className="hidden sm:inline">Baris:&nbsp;</span>
          {pageSize}
        </AppButton>
        <Menu
          anchorEl={sizeAnchor}
          open={Boolean(sizeAnchor)}
          onClose={() => setSizeAnchor(null)}
          slotProps={{ paper: { sx: { borderRadius: 2 } } }}
        >
          {pageSizeOptions.map((size) => (
            <MenuItem
              key={size}
              dense
              selected={size === pageSize}
              onClick={() => {
                onPageSizeChange(size);
                setSizeAnchor(null);
              }}
            >
              <ListItemText primary={`${size} per muatan`} />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}
