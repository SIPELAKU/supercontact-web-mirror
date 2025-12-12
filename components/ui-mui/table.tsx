"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui-mui/dropdown-menu";
import { TablePagination } from "@mui/material";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  actions?: (row: T) => React.ReactNode;
  onSelectionChange?: (rows: T[]) => void;
  actionMode?: "inline" | "menu";
}

function DropdownMenuContentWrapper({ children, align }: { children: React.ReactNode; align?: "start" | "end" }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <DropdownMenuTrigger onClick={(e: any) => setAnchorEl(e.currentTarget)}>
        <div className="p-2 hover:bg-gray-200 rounded-md cursor-pointer">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} align={align}>
        {children}
      </DropdownMenuContent>
    </>
  );
}

export function CustomTable<T>({ data, columns, selectable = false, actions, onSelectionChange, actionMode = "inline" }: CustomTableProps<T>) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const total = data.length;
  const totalPages = Math.ceil(total / rowsPerPage);

  const start = (page - 1) * rowsPerPage;

  const end = Math.min(start + rowsPerPage, total);

  const paginatedData = data.slice(start, end);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
      onSelectionChange?.([]);
    } else {
      const ids = paginatedData.map((row: any) => row.id);
      setSelectedIds(ids);
      onSelectionChange?.(paginatedData);
    }
  };

  const toggleRow = (row: T) => {
    const id = (row as any).id;
    const updated = selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id];

    setSelectedIds(updated);

    onSelectionChange?.(paginatedData.filter((item) => updated.includes((item as any).id)));
  };

  const applyWidth = (width?: number) => (width ? { minWidth: `${width}rem`, width: `${width}rem`, maxWidth: `${width}rem` } : {});

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#edf1fc] h-16">
              {selectable && (
                <th className="px-6 py-3 w-12 h-16">
                  <input type="checkbox" checked={selectedIds.length === paginatedData.length} onChange={toggleAll} className="h-4 w-4 cursor-pointer" />
                </th>
              )}

              {columns.map((col) => (
                <th key={String(col.key)} style={applyWidth(col.width)} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 h-16">
                  {col.label}
                </th>
              ))}

              {actions && <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500 w-32 h-16">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50 transition h-16">
                {selectable && (
                  <td className="px-6 py-4 h-16">
                    <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row)} className="h-4 w-4 cursor-pointer" />
                  </td>
                )}

                {columns.map((col) => (
                  <td key={String(col.key)} style={applyWidth(col.width)} className="px-6 py-4 whitespace-nowrap h-16">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}

                {actions && (
                  <td className="px-6 py-4 text-center w-32 h-16">
                    {actionMode === "inline" ? (
                      <div className="flex justify-center gap-4">{actions(row)}</div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuContentWrapper align="end">{actions(row)}</DropdownMenuContentWrapper>
                      </DropdownMenu>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600 mr-10">
          <span>Rows per page:</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-gray-600 mr-10">
          {start + 1}-{end} of {total}
        </div>

        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className={cn("p-2 cursor-pointer", page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100")}>
            {`<`}
          </button>

          <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={cn("p-2 cursor-pointer", page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100")}>
            {`>`}
          </button>
        </div>
      </div>
    </div>
  );
}
