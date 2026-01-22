"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ChevronLeftIcon from "@/public/icons/arrowLeft.png";
import ChevronRightIcon from "@/public/icons/arrowRight.png";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { TableSkeleton } from "./table-skeleton";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
}

interface CustomTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T) => string;
  loading: boolean;
  selectable?: boolean;
  actions?: (row: T) => React.ReactNode;
  actionMode?: "inline" | "menu";
  onSelectionChange?: (rows: T[]) => void;

  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (size: number) => void;
}

function DropdownMenuContentWrapper({
  children,
  align,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleTriggerClick = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };


  return (
    <>
      <DropdownMenuTrigger onClick={handleTriggerClick}>
        <div className="p-2 hover:bg-gray-200 rounded-md cursor-pointer">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        align={align}
      >
        {children}
      </DropdownMenuContent>
    </>
  );
}

export function CustomTable<T extends { id: string }>({
  data,
  columns,
  selectable = false,
  actions,
  onSelectionChange,
  actionMode = "inline",
  loading,
  page,
  rowsPerPage,
  total,
  rowKey,
  onPageChange,
  onRowsPerPageChange,
}: CustomTableProps<T>) {
  const paginatedData = data;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
      onSelectionChange?.([]);
    } else {
      const ids = paginatedData.map((row) => row.id);
      setSelectedIds(ids);
      onSelectionChange?.(paginatedData);
    }
  };

  const toggleRow = (row: T) => {
    const updated = selectedIds.includes(row.id)
      ? selectedIds.filter((x) => x !== row.id)
      : [...selectedIds, row.id];

    setSelectedIds(updated);

    onSelectionChange?.(
      paginatedData.filter((item) => updated.includes(item.id))
    );
  };

  if (loading) {
    return (
      <TableSkeleton
        columns={columns}
        selectable={selectable}
        actionColumn={!!actions}
        rows={8}
      />
    );
  }


  const applyWidth = (width?: number) =>
    width
      ? { minWidth: `${width}rem`, width: `${width}rem`, maxWidth: `${width}rem` }
      : {};

  const columnCount =
    columns.length +
    (selectable ? 1 : 0) +
    (actions ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#edf1fc] h-16">

              {selectable && (
                <th className="px-6 py-3 w-12 h-16">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === paginatedData.length}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer"
                  />
                </th>
              )}

              {columns.map((col, index) => (
                <th
                  key={String(col.key)}
                  style={applyWidth(col.width)}
                  className="
                          px-6 py-3 text-left text-xs font-medium capitalize tracking-wide text-gray-500 relative
                          after:content-[''] after:absolute after:right-0 after:top-1/2 after:-translate-y-1/2
                          after:h-8 after:w-px after:bg-gray-300
                        "
                >
                  {col.label}
                </th>
              ))}

              {actions && (
                <th
                  className="
                      px-6 py-3 text-left text-xs font-medium capitalize text-gray-500 w-32 h-16 relative
                      after:content-[''] after:absolute after:right-2 after:top-1/2 after:-translate-y-1/2
                      after:h-8 after:w-px after:bg-gray-300
                    "
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="h-40 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-base font-medium text-gray-700">
                      No data available
                    </span>
                    <span className="text-xs text-gray-400">
                      There is no data to display at the moment
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={rowKey ? rowKey(row) : (row as any).id} className="hover:bg-gray-50 transition h-16">

                  {selectable && (
                    <td className="px-6 py-4 h-16">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row)}
                        className="h-4 w-4 cursor-pointer"
                      />
                    </td>
                  )}

                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      style={applyWidth(col.width)}
                      className="px-6 py-4 whitespace-nowrap h-16"
                    >
                      {col.render ? col.render(row) : (row as Record<string, React.ReactNode>)[col.key as string]}
                    </td>
                  ))}

                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap w-32 h-16">
                      {actionMode === "inline" ? (
                        <div className="flex ml-8 gap-4">
                          {actions(row)}
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuContentWrapper align="end">
                            {actions(row)}
                          </DropdownMenuContentWrapper>
                        </DropdownMenu>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      <div className="flex justify-end items-center px-6 py-2 bg-white border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-black mr-5">
          <span>Rows per page:</span>

          <select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="
            border-none
            ring-0
            focus:ring-0
            focus:outline-none
            bg-transparent
            text-sm
            cursor-pointer"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="text-sm text-black mr-2">
          {(page - 1) * rowsPerPage + 1}–
          {Math.min(page * rowsPerPage, total)} of {total}
        </div>

        <div className="flex items-center gap-2">

          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className={cn(
              "p-2 cursor-pointer rounded-md",
              page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-white"
            )}
          >
            <Image
              src={ChevronLeftIcon}
              alt="Previous Page"
              width={38}
              height={38}
              className={cn(
                page === 1 ? "opacity-40" : "opacity-80 group-hover:opacity-100"
              )}
            />
          </button>

          <button
            disabled={page * rowsPerPage >= total}
            onClick={() => onPageChange(page + 1)}
            className={cn(
              "p-2 cursor-pointer rounded-md",
              page * rowsPerPage >= total
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-white"
            )}
          >
            <Image
              src={ChevronRightIcon}
              alt="Next Page"
              width={38}
              height={38}
              className={cn(
                page * rowsPerPage >= total
                  ? "opacity-40"
                  : "opacity-80 group-hover:opacity-100"
              )}
            />
          </button>

        </div>

      </div>
    </div>
  );
}