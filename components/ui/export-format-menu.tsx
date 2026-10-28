"use client";

import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { ExportFileFormat } from "@/lib/utils/exportRows";

interface ExportFormatMenuProps {
  /** The clicked element the menu opens under; null = closed. */
  anchorEl: HTMLElement | null;
  /** The menu heading, e.g. "Export Sent recipients". */
  title: string;
  onClose: () => void;
  onChoose: (format: ExportFileFormat) => void;
}

/** "CSV or Excel?" - the menu a stats card opens before exporting its rows. */
export function ExportFormatMenu({ anchorEl, title, onClose, onChoose }: ExportFormatMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      slotProps={{ paper: { sx: { minWidth: 200, borderRadius: 2 } } }}
    >
      <ListSubheader sx={{ lineHeight: "32px" }}>{title}</ListSubheader>
      <MenuItem onClick={() => onChoose("csv")}>
        <ListItemIcon><FileText size={16} /></ListItemIcon>
        <ListItemText primary="CSV (.csv)" />
      </MenuItem>
      <MenuItem onClick={() => onChoose("excel")}>
        <ListItemIcon><FileSpreadsheet size={16} /></ListItemIcon>
        <ListItemText primary="Excel (.xlsx)" />
      </MenuItem>
    </Menu>
  );
}
