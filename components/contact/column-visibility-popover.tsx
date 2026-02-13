"use client";

import { useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Popover } from "@mui/material";
import { AppButton } from "@/components/ui/app-button";

interface ColumnDefinition {
  id: string;
  label: string;
}

interface ColumnVisibilityPopoverProps {
  columns: ColumnDefinition[];
  visibleColumns: string[];
  onChange: (newVisibleColumns: string[]) => void;
}

export default function ColumnVisibilityPopover({
  columns,
  visibleColumns,
  onChange,
}: ColumnVisibilityPopoverProps) {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const filteredColumns = columns.filter((col) =>
    col.label.toLowerCase().includes(search.toLowerCase()),
  );

  const isAllVisible = columns.every((col) => visibleColumns.includes(col.id));

  const handleToggleColumn = (id: string) => {
    if (visibleColumns.includes(id)) {
      onChange(visibleColumns.filter((colId) => colId !== id));
    } else {
      onChange([...visibleColumns, id]);
    }
  };

  const handleToggleAll = () => {
    if (isAllVisible) {
      onChange([]);
    } else {
      onChange(columns.map((col) => col.id));
    }
  };

  const handleReset = () => {
    onChange(columns.map((col) => col.id));
    setSearch("");
  };

  return (
    <>
      <AppButton
        onClick={handleClick}
        variantStyle="soft"
        startIcon={<SlidersHorizontal size={16} />}
      >
        Columns
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
              "w-[280px] p-3 rounded-xl mt-1.5 shadow-lg border border-gray-100",
            style: {
              boxShadow:
                "0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)",
            },
          },
        }}
      >
        <div className="flex items-center relative mb-3">
          <Search className="absolute left-3 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6739EC] focus:border-[#6739EC]"
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto flex flex-col gap-2 mb-3 px-0.5">
          {filteredColumns.map((col) => (
            <label
              key={col.id}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none hover:bg-gray-50 p-1 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(col.id)}
                onChange={() => handleToggleColumn(col.id)}
                className="w-4 h-4 rounded border-gray-300 text-[#6739EC] focus:ring-[#6739EC] cursor-pointer"
              />
              {col.label}
            </label>
          ))}

          {filteredColumns.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">
              No columns found
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none hover:bg-gray-50 p-1 rounded-md transition-colors">
            <input
              type="checkbox"
              checked={isAllVisible}
              onChange={handleToggleAll}
              className="w-4 h-4 rounded border-gray-300 text-[#6739EC] focus:ring-[#6739EC] cursor-pointer"
            />
            Show/Hide All
          </label>

          <button
            onClick={handleReset}
            className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Reset
          </button>
        </div>
      </Popover>
    </>
  );
}
