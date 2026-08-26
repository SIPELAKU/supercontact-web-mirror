"use client";

// components/ui/table-filter-bar.tsx
//
// Compact filter strip for server-driven tables.
//
// It replaces MRT's always-visible column-filter subheader row, which cost a
// permanent band of vertical space and — on the Email Marketing tables — was
// wired to nothing at all. Everything declared here is forwarded to the API by
// the page, so a control only exists if the server can honour it.

import { useMemo, useState } from "react";
import {
  Box,
  Divider,
  MenuItem,
  Popover,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ListFilter, X } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";

export interface TableFilterOption {
  value: string;
  label: string;
}

export interface TableFilterDef {
  /** Sent to the API under this key. */
  id: string;
  label: string;
  options: TableFilterOption[];
  /** Shown in the dropdown for "no filter". */
  anyLabel?: string;
}

export type TableFilterValues = Record<string, string | undefined>;

interface TableFilterBarProps {
  filters: TableFilterDef[];
  values: TableFilterValues;
  onChange: (values: TableFilterValues) => void;
  /** Rendered after the chips — e.g. a result count. */
  children?: React.ReactNode;
  /**
   * `"strip"`   — standalone band above the table (default): keeps a bottom
   *               margin and always shows "Clear all".
   * `"toolbar"` — embedded in SuperTable's toolbar via the `renderFilters`
   *               slot: no bottom margin, and "Clear all" hides below `md`.
   *
   * Only spacing and the "Clear all" breakpoint differ between them. The
   * trigger's active state, labelling and popover semantics are shared — those
   * are fixes rather than layout, and both variants want them.
   *
   * The chips stay visible at every width on purpose: they are what tells you
   * WHICH filter is on, while the trigger only tells you that one is.
   */
  layout?: "strip" | "toolbar";
}

export function TableFilterBar({
  filters,
  values,
  onChange,
  children,
  layout = "strip",
}: TableFilterBarProps) {
  const inToolbar = layout === "toolbar";
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const active = useMemo(
    () =>
      filters
        .map((f) => {
          const value = values[f.id];
          if (!value) return null;
          const option = f.options.find((o) => o.value === value);
          return { id: f.id, label: f.label, text: option?.label ?? value };
        })
        .filter(Boolean) as { id: string; label: string; text: string }[],
    [filters, values]
  );

  if (filters.length === 0) return null;

  const setOne = (id: string, value: string | undefined) =>
    onChange({ ...values, [id]: value || undefined });

  const triggerLabel = active.length > 0 ? `Filters (${active.length})` : "Filters";

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      sx={{ gap: 1, mb: inToolbar ? 0 : 1.5 }}
    >
      <AppButton
        variantStyle="outline"
        color="gray"
        startIcon={<ListFilter size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={Boolean(anchorEl)}
        // Extends the visible label rather than replacing it (WCAG 2.5.3
        // Label in Name), so voice control still matches on "Filters".
        aria-label={
          active.length > 0
            ? `${triggerLabel}: ${active.map((a) => `${a.label} ${a.text}`).join(", ")}`
            : triggerLabel
        }
        sx={{
          flexShrink: 0,
          // The active state is carried by the BORDER, not a background tint.
          // A tint would (a) be wiped on hover by AppButton's own
          // `&:hover { backgroundColor: alpha(main, .04) }` and (b) leave 16px
          // text on primary.light at ~3.1:1, under WCAG AA. A border is a UI
          // component, so 3:1 is the bar and #5479EE on white clears it — and
          // the chips beside the button already carry the colour signal.
          ...(active.length > 0 && {
            borderColor: "primary.main",
            "&:hover": { borderColor: "primary.main" },
          }),
        }}
      >
        {triggerLabel}
      </AppButton>

      {active.map((chip) => (
        <Box
          key={chip.id}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
            fontSize: 13,
            bgcolor: "primary.light",
            color: "text.primary",
          }}
        >
          <span>
            <b style={{ fontWeight: 600 }}>{chip.label}:</b> {chip.text}
          </span>
          <button
            type="button"
            aria-label={`Remove ${chip.label} filter`}
            onClick={() => setOne(chip.id, undefined)}
            style={{
              display: "inline-flex",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              lineHeight: 0,
              color: "inherit",
            }}
          >
            <X size={14} />
          </button>
        </Box>
      ))}

      {active.length > 0 && (
        <AppButton
          variantStyle="text"
          color="gray"
          onClick={() => onChange({})}
          sx={inToolbar ? { display: { xs: "none", md: "inline-flex" } } : undefined}
        >
          Clear all
        </AppButton>
      )}

      {children}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        // `aria-haspopup="dialog"` on the trigger has to be true: give the
        // Paper the role and an accessible name, otherwise the trigger
        // promises a widget that never appears in the accessibility tree.
        slotProps={{
          paper: {
            role: "dialog",
            "aria-label": "Filters",
            sx: { p: 2, minWidth: 260, borderRadius: 2 },
          },
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Filters
        </Typography>
        <Stack spacing={2}>
          {filters.map((f) => (
            <Box key={f.id}>
              <Typography
                variant="body2"
                component="label"
                htmlFor={`filter-${f.id}`}
                sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
              >
                {f.label}
              </Typography>
              <Select
                id={`filter-${f.id}`}
                size="small"
                fullWidth
                displayEmpty
                value={values[f.id] ?? ""}
                onChange={(e) => setOne(f.id, String(e.target.value))}
              >
                <MenuItem value="">{f.anyLabel ?? `All ${f.label.toLowerCase()}`}</MenuItem>
                {f.options.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          ))}
        </Stack>
        {active.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <AppButton
              variantStyle="text"
              color="gray"
              fullWidth
              onClick={() => {
                onChange({});
                setAnchorEl(null);
              }}
            >
              Clear all filters
            </AppButton>
          </>
        )}
      </Popover>
    </Stack>
  );
}

export default TableFilterBar;
