"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Popover, Select, MenuItem, FormControl } from "@mui/material";
import { Input } from "@/components/ui/input";
import { AppButton } from "../ui/app-button";

interface FilterRow {
  id: string;
  columnId: string;
  operator: string;
  value: string;
}

interface ColumnDefinition {
  id: string;
  label: string;
}

interface FilterPopoverProps {
  columns: ColumnDefinition[];
  onApply?: (filters: FilterRow[]) => void;
}

const OPERATORS = [
  "contains",
  "does not contain",
  "equals",
  "does not equal",
  "starts with",
  "ends with",
  "is empty",
  "is not empty",
  "is any of",
];

export default function FilterPopover({
  columns,
  onApply,
}: FilterPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const [filters, setFilters] = useState<FilterRow[]>([
    { id: "1", columnId: "", operator: "contains", value: "" },
  ]);

  const handleAddFilter = () => {
    setFilters([
      ...filters,
      {
        id: Math.random().toString(36).substr(2, 9),
        columnId: "",
        operator: "contains",
        value: "",
      },
    ]);
  };

  const handleRemoveFilter = (id: string) => {
    if (filters.length === 1) {
      setFilters([{ id: "1", columnId: "", operator: "contains", value: "" }]);
      if (onApply) onApply([]);
      return;
    }
    const newFilters = filters.filter((f) => f.id !== id);
    setFilters(newFilters);
    if (onApply) onApply(newFilters);
  };

  const updateFilter = (id: string, field: keyof FilterRow, value: string) => {
    const newFilters = filters.map((f) =>
      f.id === id ? { ...f, [field]: value } : f,
    );
    setFilters(newFilters);
    if (onApply) onApply(newFilters);
  };

  return (
    <>
      <AppButton
        onClick={handleClick}
        variantStyle="soft"
        startIcon={<Filter size={16} />}
      >
        Filters
      </AppButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            className:
              "w-[600px] p-4 rounded-xl mt-1.5 shadow-lg border border-gray-100",
            style: {
              boxShadow:
                "0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)",
            },
          },
        }}
      >
        {filters.length > 0 && (
          <div className="grid grid-cols-[24px_1fr_1fr_1fr] gap-2 mb-2 text-xs text-gray-500 font-medium px-1">
            <div></div> {/* Spacer for X button */}
            <div>Columns</div>
            <div>Operator</div>
            <div>Value</div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="grid grid-cols-[24px_1fr_1fr_1fr] gap-2 items-start group"
            >
              <button
                onClick={() => handleRemoveFilter(filter.id)}
                className="mt-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>

              <FormControl fullWidth size="small">
                <Select
                  value={filter.columnId}
                  onChange={(e) =>
                    updateFilter(
                      filter.id,
                      "columnId",
                      e.target.value as string,
                    )
                  }
                  displayEmpty
                  className="h-9 rounded-lg text-sm"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6739EC80",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6739EC",
                      borderWidth: "1px",
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span className="text-gray-400">Select column</span>
                  </MenuItem>
                  {columns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <Select
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(
                      filter.id,
                      "operator",
                      e.target.value as string,
                    )
                  }
                  className="h-9 rounded-lg text-sm"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#e5e7eb",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6739EC80",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#6739EC",
                      borderWidth: "1px",
                    },
                  }}
                >
                  {OPERATORS.map((op) => (
                    <MenuItem key={op} value={op}>
                      {op}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Input
                value={filter.value}
                onChange={(e) =>
                  updateFilter(filter.id, "value", e.target.value)
                }
                placeholder="Filter value"
                className="h-9 transition-all hover:border-[#6739EC]/50 focus:ring-[#6739EC]"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
          <button
            onClick={handleAddFilter}
            className="text-[#6739EC] text-sm hover:underline font-medium transition-colors hover:text-[#5b32d1]"
          >
            + Add filter
          </button>
        </div>
      </Popover>
    </>
  );
}
