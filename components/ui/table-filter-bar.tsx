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
}

export function TableFilterBar({
  filters,
  values,
  onChange,
  children,
}: TableFilterBarProps) {
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

  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      sx={{ gap: 1, mb: 1.5 }}
    >
      <AppButton
        variantStyle="outline"
        color="gray"
        startIcon={<ListFilter size={16} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
      >
        {active.length > 0 ? `Filters (${active.length})` : "Filters"}
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
        <AppButton variantStyle="text" color="gray" onClick={() => onChange({})}>
          Clear all
        </AppButton>
      )}

      {children}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { p: 2, minWidth: 260, borderRadius: 2 } } }}
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
