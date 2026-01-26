"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { Popover } from "@mui/material";

interface ExportPopoverProps {
  onExportCSV: () => void;
  onPrint: () => void;
}

export default function ExportPopover({
  onExportCSV,
  onPrint,
}: ExportPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-[#DDE4FC] text-[#6739EC] text-sm rounded-lg flex items-center gap-2 cursor-pointer transition-colors hover:bg-[#D1DAFB]"
      >
        <Upload size={16} /> Export
      </button>

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
              "w-[160px] p-2 rounded-xl mt-1.5 shadow-lg border border-gray-100",
            style: {
              boxShadow:
                "0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)",
            },
          },
        }}
      >
        <div className="flex flex-col">
          <button
            onClick={() => {
              onExportCSV();
              handleClose();
            }}
            className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Download as CSV
          </button>
          <button
            onClick={() => {
              onPrint();
              handleClose();
            }}
            className="text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Print
          </button>
        </div>
      </Popover>
    </>
  );
}
