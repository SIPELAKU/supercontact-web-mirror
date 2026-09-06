"use client";

// components/ui/super-table/components/FilterPanel.tsx
//
// ONE filter affordance for every table in the app.
//
// Before this there were three, and a table could show two at once:
//   1. MRT's column-filter subheader (`features.columnFilters`) - a permanent
//      band of inputs, desktop-only, and on three tables wired to nothing at
//      all because the page never forwarded `columnFilters` to its API.
//   2. `TableFilterBar` - the good idea, adopted by exactly one screen, and
//      now deleted: this file is where it went.
//   3. Hand-rolled <Select> strips above the table, different on each page.
//
// The rule this file encodes: a filter you can SEE is worth more than a filter
// you can reach. The trigger says how many are on; the chips say which ones and
// let you drop them one at a time; the popover is only for changing them.

import * as React from "react";
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ListFilter, X } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import type { SuperTableFilterDef, SuperTableFilterValues } from "../types";

interface FilterPanelProps {
  filters: SuperTableFilterDef[];
  values: SuperTableFilterValues;
  onChange: (values: SuperTableFilterValues) => void;
}

/** A value that should not count as "this filter is on". */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0 || value.every(isEmpty);
  return false;
}

/** How an active value reads inside its chip. */
function describe(def: SuperTableFilterDef, value: unknown): string {
  const labelOf = (v: unknown) =>
    def.options?.find((o) => o.value === String(v))?.label ?? String(v);

  if (def.type === "multiselect" && Array.isArray(value)) {
    if (value.length === 1) return labelOf(value[0]);
    return `${value.length} dipilih`;
  }
  if (def.type === "boolean") return value ? "Ya" : "Tidak";
  if (def.type === "date-range" && Array.isArray(value)) {
    const [from, to] = value as [string?, string?];
    if (from && to) return `${from} → ${to}`;
    if (from) return `sejak ${from}`;
    if (to) return `sampai ${to}`;
  }
  return labelOf(value);
}

export function FilterPanel({ filters, values, onChange }: FilterPanelProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  // 720px is MRT's own toolbar breakpoint. Matching it means the table does
  // not switch layout at one width and its filters at another.
  const isNarrow = useMediaQuery("(max-width:720px)");
  const open = Boolean(anchorEl);

  const active = React.useMemo(
    () =>
      filters
        .filter((f) => !isEmpty(values[f.id]))
        .map((f) => ({ def: f, text: describe(f, values[f.id]) })),
    [filters, values]
  );

  if (filters.length === 0) return null;

  const setOne = (id: string, value: unknown) =>
    onChange({ ...values, [id]: isEmpty(value) ? undefined : value });

  const clearAll = () =>
    onChange(Object.fromEntries(filters.map((f) => [f.id, undefined])));

  const pinned = filters.filter((f) => f.pinned);
  const inPopover = filters.filter((f) => !f.pinned);

  const triggerLabel =
    active.length > 0 ? `Filters (${active.length})` : "Filters";

  const controls = (
    <Stack spacing={2.5} sx={{ p: 2, minWidth: isNarrow ? "auto" : 300 }}>
      {inPopover.map((def) => (
        <Box key={def.id}>
          <Typography
            component="label"
            htmlFor={`st-filter-${def.id}`}
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 600,
              color: "text.secondary",
            }}
          >
            {def.label}
          </Typography>
          <FilterControl
            def={def}
            value={values[def.id]}
            onChange={(v) => setOne(def.id, v)}
            fullWidth
          />
        </Box>
      ))}

      {active.length > 0 && (
        <>
          <Divider />
          <AppButton
            variantStyle="text"
            color="gray"
            startIcon={<X size={15} />}
            onClick={() => {
              clearAll();
              setAnchorEl(null);
            }}
          >
            Hapus semua filter
          </AppButton>
        </>
      )}
    </Stack>
  );

  return (
    <>
      {inPopover.length > 0 && (
        <AppButton
          variantStyle="outline"
          color="gray"
          startIcon={<ListFilter size={16} />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-haspopup="dialog"
          aria-expanded={open}
          // Extends the visible label rather than replacing it (WCAG 2.5.3
          // Label in Name), so voice control still matches on "Filters".
          aria-label={
            active.length > 0
              ? `${triggerLabel}: ${active
                  .map((a) => `${a.def.label} ${a.text}`)
                  .join(", ")}`
              : triggerLabel
          }
          sx={{
            flexShrink: 0,
            // The active state is carried by the BORDER, not a background
            // tint: AppButton's own hover rule would wipe a tint, and 16px
            // text on primary.light lands at ~3.1:1, under WCAG AA.
            ...(active.length > 0 && {
              borderColor: "primary.main",
              color: "primary.main",
            }),
          }}
        >
          {triggerLabel}
        </AppButton>
      )}

      {/* Pinned filters sit in the toolbar itself - for the one or two
          controls a screen really does reach for all day. */}
      {pinned.map((def) => (
        <Box key={def.id} sx={{ minWidth: 150, flexShrink: 0 }}>
          <FilterControl
            def={def}
            value={values[def.id]}
            onChange={(v) => setOne(def.id, v)}
            compact
          />
        </Box>
      ))}

      {/* Chips are what make an active filter legible at a glance, so they
          stay visible at EVERY width - the trigger only tells you that a
          filter is on, never which. */}
      {active.map(({ def, text }) => (
        <Chip
          key={def.id}
          size="small"
          label={
            <span>
              <Box component="span" sx={{ color: "text.secondary" }}>
                {def.label}:
              </Box>{" "}
              {text}
            </span>
          }
          onDelete={() => setOne(def.id, undefined)}
          deleteIcon={<X size={14} />}
          aria-label={`Hapus filter ${def.label} ${text}`}
          sx={{
            maxWidth: 240,
            borderRadius: 1.5,
            bgcolor: "action.hover",
            "& .MuiChip-label": { fontSize: "0.78rem" },
          }}
        />
      ))}

      {active.length > 1 && (
        <AppButton
          variantStyle="text"
          color="gray"
          onClick={clearAll}
          sx={{ flexShrink: 0, display: { xs: "none", md: "inline-flex" } }}
        >
          Hapus semua
        </AppButton>
      )}

      {isNarrow ? (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { borderRadius: "16px 16px 0 0", pb: 2 } }}
        >
          <Typography variant="subtitle1" sx={{ px: 2, pt: 2, fontWeight: 600 }}>
            Filters
          </Typography>
          {controls}
        </Drawer>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
        >
          {controls}
        </Popover>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// One control per filter type. Kept in this file because it exists only to
// serve FilterPanel - splitting it out would just add an import.
// ─────────────────────────────────────────────────────────────────────────

function FilterControl({
  def,
  value,
  onChange,
  fullWidth,
  compact,
}: {
  def: SuperTableFilterDef;
  value: unknown;
  onChange: (value: unknown) => void;
  fullWidth?: boolean;
  compact?: boolean;
}) {
  const id = `st-filter-${def.id}`;
  const size = "small" as const;

  if (def.type === "text") {
    return (
      <TextField
        id={id}
        size={size}
        fullWidth={fullWidth}
        placeholder={def.placeholder ?? `Cari ${def.label.toLowerCase()}`}
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value)}
        inputProps={{ "aria-label": def.label }}
      />
    );
  }

  if (def.type === "boolean") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            id={id}
            size={size}
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked || undefined)}
          />
        }
        label={compact ? def.label : "Ya"}
      />
    );
  }

  if (def.type === "date-range") {
    const [from, to] = (Array.isArray(value) ? value : [])as [string?, string?];
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          id={id}
          type="date"
          size={size}
          value={from ?? ""}
          onChange={(e) => onChange([e.target.value || undefined, to])}
          inputProps={{ "aria-label": `${def.label} dari` }}
        />
        <Typography variant="body2" color="text.secondary">
          –
        </Typography>
        <TextField
          type="date"
          size={size}
          value={to ?? ""}
          onChange={(e) => onChange([from, e.target.value || undefined])}
          inputProps={{ "aria-label": `${def.label} sampai` }}
        />
      </Stack>
    );
  }

  if (def.type === "multiselect") {
    // A one-element multiselect round-trips through the URL as a bare string
    // (`useUrlSync` only re-splits when the serialised value contains "|"), so
    // discarding a non-array value here showed "Semua <x>" next to a chip that
    // said the filter was on. Coercing it back means the control and the chip
    // always agree, and the first interaction rewrites the state as an array.
    const selected = (
      Array.isArray(value) ? value : value === undefined || value === null || value === "" ? [] : [String(value)]
    ) as string[];
    return (
      <Select
        id={id}
        multiple
        displayEmpty
        size={size}
        fullWidth={fullWidth}
        value={selected}
        onChange={(e) => {
          const next = e.target.value;
          onChange(typeof next === "string" ? next.split(",") : next);
        }}
        renderValue={(picked) =>
          picked.length === 0 ? (
            <Box component="span" sx={{ color: "text.secondary" }}>
              {def.anyLabel ?? `Semua ${def.label.toLowerCase()}`}
            </Box>
          ) : (
            picked
              .map(
                (v) => def.options?.find((o) => o.value === v)?.label ?? v
              )
              .join(", ")
          )
        }
        inputProps={{ "aria-label": def.label }}
      >
        {def.options?.map((o) => (
          <MenuItem key={o.value} value={o.value} dense>
            <Checkbox
              size="small"
              checked={selected.includes(o.value)}
              tabIndex={-1}
            />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    );
  }

  // 'select' — a short list reads better as radios inside the popover, where
  // there is room; in the toolbar it has to stay a dropdown.
  if (!compact && (def.options?.length ?? 0) <= 6) {
    return (
      <RadioGroup
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        aria-label={def.label}
      >
        <FormControlLabel
          value=""
          control={<Radio size="small" />}
          label={def.anyLabel ?? `Semua ${def.label.toLowerCase()}`}
          componentsProps={{ typography: { variant: "body2" } }}
        />
        {def.options?.map((o) => (
          <FormControlLabel
            key={o.value}
            value={o.value}
            control={<Radio size="small" />}
            label={o.label}
            componentsProps={{ typography: { variant: "body2" } }}
          />
        ))}
      </RadioGroup>
    );
  }

  return (
    <Select
      id={id}
      displayEmpty
      size={size}
      fullWidth={fullWidth}
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value || undefined)}
      inputProps={{ "aria-label": def.label }}
    >
      <MenuItem value="">
        <Box component="span" sx={{ color: "text.secondary" }}>
          {def.anyLabel ?? `Semua ${def.label.toLowerCase()}`}
        </Box>
      </MenuItem>
      {def.options?.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </Select>
  );
}
