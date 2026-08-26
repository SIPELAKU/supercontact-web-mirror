"use client";

// components/ui/super-table/components/ExportDialog.tsx
//
// Export used to be two bare icon buttons that started a multi-request download
// with no scope choice, no progress and no failure message — a failed export
// only ever reached console.error. This dialog makes the three decisions
// explicit (what rows, what format, what columns) and reports what happens.

import React from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import { FileSpreadsheet, FileText } from "lucide-react";

import { AppButton } from "@/components/ui/app-button";
import { AppDialog } from "@/components/ui/app-dialog";

export type ExportScope = "all" | "page" | "selected";
export type ExportFormat = "excel" | "csv";

export interface ExportColumnOption {
  id: string;
  label: string;
}

export interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (options: {
    scope: ExportScope;
    format: ExportFormat;
    columnIds: string[];
  }) => void;
  columns: ExportColumnOption[];
  /** Rows on the current page. */
  pageCount: number;
  /** Rows matching the active search/filters across every page. */
  totalCount: number;
  selectedCount: number;
  allowedFormats: { excel: boolean; csv: boolean };
  isExporting: boolean;
  /** `[fetched, total]` while a server-side export paginates. */
  progress: [number, number] | null;
}

export function ExportDialog({
  open,
  onClose,
  onConfirm,
  columns,
  pageCount,
  totalCount,
  selectedCount,
  allowedFormats,
  isExporting,
  progress,
}: ExportDialogProps) {
  const [scope, setScope] = React.useState<ExportScope>("all");
  const [format, setFormat] = React.useState<ExportFormat>(
    allowedFormats.excel ? "excel" : "csv"
  );
  const [columnIds, setColumnIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!open) return;
    setColumnIds(columns.map((c) => c.id));
    setScope(selectedCount > 0 ? "selected" : "all");
    setFormat(allowedFormats.excel ? "excel" : "csv");
  }, [open, columns, selectedCount, allowedFormats.excel]);

  const rowsForScope =
    scope === "selected" ? selectedCount : scope === "page" ? pageCount : totalCount;

  const toggleColumn = (id: string) =>
    setColumnIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const canExport = columnIds.length > 0 && rowsForScope > 0 && !isExporting;

  return (
    <AppDialog
      open={open}
      onClose={isExporting ? () => {} : onClose}
      title="Export data"
      description="Choose which rows and columns end up in the file."
      maxWidth="sm"
      actions={
        <>
          <AppButton variantStyle="outline" color="gray" onClick={onClose} disabled={isExporting}>
            Cancel
          </AppButton>
          <AppButton
            variantStyle="primary"
            disabled={!canExport}
            isLoading={isExporting}
            onClick={() => onConfirm({ scope, format, columnIds })}
          >
            {isExporting
              ? "Exporting…"
              : `Export ${rowsForScope.toLocaleString()} row${rowsForScope === 1 ? "" : "s"}`}
          </AppButton>
        </>
      }
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Rows
          </Typography>
          <RadioGroup value={scope} onChange={(e) => setScope(e.target.value as ExportScope)}>
            <FormControlLabel
              value="all"
              control={<Radio size="small" />}
              label={`All rows matching the current search and filters (${totalCount.toLocaleString()})`}
            />
            <FormControlLabel
              value="page"
              control={<Radio size="small" />}
              label={`This page only (${pageCount.toLocaleString()})`}
            />
            <FormControlLabel
              value="selected"
              disabled={selectedCount === 0}
              control={<Radio size="small" />}
              label={
                selectedCount === 0
                  ? "Selected rows (none selected)"
                  : `Selected rows (${selectedCount.toLocaleString()})`
              }
            />
          </RadioGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Format
          </Typography>
          <Stack direction="row" spacing={1}>
            {allowedFormats.excel && (
              <AppButton
                variantStyle={format === "excel" ? "primary" : "outline"}
                color={format === "excel" ? "primary" : "gray"}
                startIcon={<FileSpreadsheet size={16} />}
                onClick={() => setFormat("excel")}
              >
                Excel (.xlsx)
              </AppButton>
            )}
            {allowedFormats.csv && (
              <AppButton
                variantStyle={format === "csv" ? "primary" : "outline"}
                color={format === "csv" ? "primary" : "gray"}
                startIcon={<FileText size={16} />}
                onClick={() => setFormat("csv")}
              >
                CSV (.csv)
              </AppButton>
            )}
          </Stack>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Columns
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              rowGap: 0,
              columnGap: 2,
              maxHeight: 200,
              overflowY: "auto",
            }}
          >
            {columns.map((c) => (
              <FormControlLabel
                key={c.id}
                control={
                  <Checkbox
                    size="small"
                    checked={columnIds.includes(c.id)}
                    onChange={() => toggleColumn(c.id)}
                  />
                }
                label={c.label}
              />
            ))}
          </Box>
          {columnIds.length === 0 && (
            <Typography variant="body2" sx={{ color: "error.main", mt: 0.5 }}>
              Pick at least one column to export.
            </Typography>
          )}
        </Box>

        {isExporting && (
          <Box>
            <LinearProgress
              variant={progress && progress[1] > 0 ? "determinate" : "indeterminate"}
              value={
                progress && progress[1] > 0
                  ? Math.min(100, (progress[0] / progress[1]) * 100)
                  : undefined
              }
            />
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
              {progress && progress[1] > 0
                ? `Fetched ${progress[0].toLocaleString()} of ${progress[1].toLocaleString()} rows…`
                : "Preparing your file…"}
            </Typography>
          </Box>
        )}
      </Stack>
    </AppDialog>
  );
}

export default ExportDialog;
