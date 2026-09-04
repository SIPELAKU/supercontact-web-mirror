"use client";

import { Box, Checkbox, Chip, FormControl, ListItemText, MenuItem, Select, Typography } from "@mui/material";
import { AppInput } from "@/components/ui/app-input";
import { AppSelect } from "@/components/ui/app-select";
import type { CustomFieldDefinitionLike } from "@/lib/types/CustomFieldDefinition";

interface CustomFieldControlProps {
  definition: CustomFieldDefinitionLike;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
  showRequiredMarker?: boolean;
}

/**
 * One control per `field_type` for the GENERIC custom fields. text / number /
 * date / boolean / select are the ticket panel's controls; `multi_select` is
 * new - an MUI multiple Select with checkboxes, rendering the picked options
 * as chips, value `string[]`.
 *
 * A number is kept as typed (a string) while editing; the value validator
 * normalises it to a number before the payload is built, so "1." does not
 * snap to "1" under the user's cursor.
 */
export default function CustomFieldControl({
  definition: def,
  value,
  onChange,
  error,
  disabled,
  showRequiredMarker,
}: CustomFieldControlProps) {
  const label = (
    <label className="text-sm font-semibold text-gray-900">
      {def.label}
      {showRequiredMarker && def.is_required && <span className="text-red-500"> *</span>}
    </label>
  );
  const options = def.select_options ?? [];

  const renderControl = () => {
    switch (def.field_type) {
      case "text":
        return (
          <AppInput
            isBgWhite
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value)}
            error={!!error}
            helperText={error}
            disabled={disabled}
          />
        );
      case "number":
        return (
          <AppInput
            isBgWhite
            type="number"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
            inputProps={{ step: "any" }}
            error={!!error}
            helperText={error}
            disabled={disabled}
          />
        );
      case "date":
        return (
          <>
            <input
              type="date"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
              disabled={disabled}
              aria-label={def.label}
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm focus:border-[#5479EE] focus:outline-none disabled:bg-gray-100 ${
                error ? "border-red-500" : "border-gray-200"
              }`}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </>
        );
      case "boolean":
        return (
          <>
            <label className="flex h-10 items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                className="h-4 w-4"
              />
              Ya
            </label>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </>
        );
      case "select":
        return (
          <AppSelect
            isBgWhite
            fullWidth
            placeholder="Pilih"
            value={typeof value === "string" ? value : ""}
            options={[
              ...(def.is_required ? [] : [{ value: "", label: "—" }]),
              ...options.map((opt) => ({ value: opt, label: opt })),
            ]}
            onChange={(e) => onChange(e.target.value === "" ? null : (e.target.value as string))}
            error={!!error}
            helperText={error}
            disabled={disabled}
          />
        );
      case "multi_select": {
        const selected = Array.isArray(value) ? (value as unknown[]).map(String) : [];
        return (
          <FormControl fullWidth size="small" error={!!error} disabled={disabled}>
            <Select
              multiple
              displayEmpty
              value={selected}
              onChange={(e) => {
                const next = e.target.value;
                onChange(Array.isArray(next) ? next : String(next).split(","));
              }}
              renderValue={(picked) => {
                const list = picked as string[];
                if (list.length === 0) {
                  return (
                    <Typography sx={{ color: "text.disabled", fontSize: "0.875rem" }}>Pilih satu atau lebih</Typography>
                  );
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {list.map((item) => (
                      <Chip key={item} label={item} size="small" />
                    ))}
                  </Box>
                );
              }}
              sx={{ backgroundColor: "white", borderRadius: "8px", minHeight: "40px" }}
              inputProps={{ "aria-label": def.label }}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  <Checkbox size="small" checked={selected.includes(opt)} />
                  <ListItemText primary={opt} />
                </MenuItem>
              ))}
            </Select>
            {error && (
              <Typography variant="caption" sx={{ color: "error.main", mt: 0.5, fontSize: "0.75rem" }}>
                {error}
              </Typography>
            )}
          </FormControl>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {label}
      {renderControl()}
    </div>
  );
}
